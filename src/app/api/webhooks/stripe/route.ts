import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

async function logError(message: string) {
    await prisma.executionLog.create({
        data: {
            errorMessage: message
        }
    });
}

async function logWebhookEvent(event: Stripe.Event, details: string) {
    await prisma.executionLog.create({
        data: {
            errorMessage: `Stripe webhook ${event.type}:
            ID: ${event.id}
            Details: ${details}`
        }
    });
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature");

    if (!signature) {
        await logError("Stripe-Signature header is missing");
        return new NextResponse("Stripe signature missing", { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        await logError("STRIPE_WEBHOOK_SECRET is not configured");
        return new NextResponse("Webhook secret missing", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        await logError(`Webhook received: ${event.type}, Event ID: ${event.id}`);
    } catch (err) {
        const error = err as Error;
        await logError(`Webhook verification error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription
                );

                if (!session?.metadata?.userId) {
                    throw new Error('User id is required');
                }

                await prisma.userSubscription.create({
                    data: {
                        userId: session.metadata.userId,
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCurrentPeriodEnd: new Date(
                            subscription.current_period_end * 1000
                        ),
                    },
                });

                await prisma.user.update({
                    where: {
                        id: session.metadata.userId,
                    },
                    data: {
                        membershipType: 'PAID',
                    },
                });

                break;
            }

            case "customer.subscription.created": {
                const subscription = event.data.object as Stripe.Subscription;
                
                await logError(`New subscription created:
                    Subscription ID: ${subscription.id}
                    Customer: ${subscription.customer}
                `);

                const userId = subscription.metadata.userId;
                if (!userId) {
                    throw new Error('User ID not found in subscription metadata');
                }

                const existingSubscription = await prisma.userSubscription.findFirst({
                    where: { userId: userId }
                });

                await prisma.$transaction(async (tx) => {
                    if (existingSubscription) {
                        await tx.userSubscription.delete({
                            where: { id: existingSubscription.id }
                        });
                    }

                    await tx.userSubscription.create({
                        data: {
                            userId: userId,
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: subscription.customer as string,
                            stripePriceId: subscription.items.data[0].price.id,
                            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            status: 'ACTIVE'
                        }
                    });

                    await tx.user.update({
                        where: { id: userId },
                        data: { membershipType: 'PAID' }
                    });
                });

                break;
            }

            case "invoice.payment_succeeded": {
                const subscriptionId = session.subscription;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                    await prisma.userSubscription.update({
                        where: {
                            stripeSubscriptionId: subscriptionId,
                        },
                        data: {
                            stripePriceId: subscription.items.data[0].price.id,
                            stripeCurrentPeriodEnd: new Date(
                                subscription.current_period_end * 1000
                            ),
                        },
                    });
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                
                await logError(`Payment failed for subscription:
                    Invoice ID: ${invoice.id}
                    Customer: ${invoice.customer}
                    Amount: ${invoice.amount_due}
                `);

                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        invoice.subscription as string
                    );

                    if (subscription.status === 'past_due') {
                        await prisma.$transaction([
                            prisma.userSubscription.update({
                                where: { stripeSubscriptionId: subscription.id },
                                data: { stripeCurrentPeriodEnd: new Date() }
                            }),
                            prisma.user.update({
                                where: {
                                    id: (await prisma.userSubscription.findUnique({
                                        where: { stripeSubscriptionId: subscription.id }
                                    }))?.userId
                                },
                                data: { membershipType: 'FREE' }
                            })
                        ]);
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = await prisma.userSubscription.findUnique({
                    where: {
                        stripeSubscriptionId: session.id,
                    },
                    include: {
                        user: true,
                    },
                });

                if (subscription) {
                    await prisma.userSubscription.update({
                        where: {
                            stripeSubscriptionId: session.id,
                        },
                        data: {
                            status: 'CANCELED',
                            endDate: new Date(),
                        },
                    });

                    await prisma.user.update({
                        where: {
                            id: subscription.userId,
                        },
                        data: {
                            membershipType: 'FREE',
                        },
                    });
                }
                break;
            }
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await logError(`Webhook handler error: ${errorMessage}`);
        return new NextResponse(`Webhook handler failed: ${errorMessage}`, { status: 500 });
    }
}