import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"
import axios from 'axios'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // const userId = session.user.instagramUserId // FBログイン時に取得したIDを想定
  const accessToken = session.accessToken

  try {
    // const response = await axios.get(
    //   `https://graph.facebook.com/v20.0/${userId}/media?fields=id,comments_count,like_count,media_product_type,media_url,thumbnail_url,timestamp&limit=30&access_token=${accessToken}`
    // )
    // return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 500 })
  }
}