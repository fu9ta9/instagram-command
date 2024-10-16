import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const { userId } = await req.json()

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
      client_reference_id: userId,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json({ error: 'チェックアウトセッションの作成に失敗しました' }, { status: 500 })
  }
}