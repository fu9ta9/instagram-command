import { stripe } from '@/lib/stripe'
import { getSessionWrapper } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  
  try {
    const session = await getSessionWrapper();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 環境変数のチェックを追加
    if (!process.env.STRIPE_API_KEY) {
      await prisma.executionLog.create({
        data: {
          errorMessage: 'STRIPE_API_KEY is not defined'
        }
      })
      return NextResponse.json({ 
        error: "Stripe設定が見つかりません",
        details: "環境変数が設定されていません"
      }, { 
        status: 500 
      })
    }

    try {
      // ログを追加
      await prisma.executionLog.create({
        data: {
          errorMessage: `Creating checkout session for user: ${session.user.id}`
        }
      })

      // Stripeのチェックアウトセッションを作成
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: session.user.email!,
        metadata: {
          userId: session.user.id
        },
        subscription_data: {
          metadata: {
            userId: session.user.id  // サブスクリプションにもメタデータを追加
          }
        },
        line_items: [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: "プロプラン",
                description: "Instagram DM自動返信 プロプラン",
              },
              unit_amount: 3980,
              recurring: {
                interval: "month"
              }
            },
            quantity: 1,
          }
        ],
        success_url: `${process.env.NEXTAUTH_URL}/plan?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/plan?canceled=true`,
      })

      await prisma.executionLog.create({
        data: {
          errorMessage: `Checkout session created:
          Session ID: ${stripeSession.id}
          User ID in metadata: ${stripeSession.metadata?.userId}`
        }
      })

      return NextResponse.json({ url: stripeSession.url })

    } catch (stripeError) {
      await prisma.executionLog.create({
        data: {
          errorMessage: `Stripe API error: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`
        }
      })
      throw stripeError
    }

  } catch (error) {
    console.error('Checkout session error:', error)
    await prisma.executionLog.create({
      data: {
        errorMessage: `Checkout session error: ${error instanceof Error ? error.message : String(error)}`
      }
    })
    return NextResponse.json({ 
      error: "チェックアウトセッションの作成に失敗しました",
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
}