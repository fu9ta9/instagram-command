'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function UpgradeClient() {
  const [loading, setLoading] = useState(false)
  // const { data: session } = useSession()

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // userId: session?.user?.id,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe error:', error)
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">プラン選択</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">BASICプラン</h2>
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold">¥3,980 / 月</p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? '処理中...' : '申し込む'}
          </button>
        </div>
        <ul className="list-disc list-inside text-gray-600">
          <li>機能1: xxxxxxxxxxxxxxx</li>
          <li>機能2: xxxxxxxxxxxxxxx</li>
          <li>機能3: xxxxxxxxxxxxxxx</li>
        </ul>
      </div>
    </div>
  )
}