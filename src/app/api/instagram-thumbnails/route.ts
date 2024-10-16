import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"
import axios from 'axios'

interface InstagramMediaItem {
  id: string
  media_type: string
  media_url: string
  thumbnail_url?: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.facebookAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // FacebookのアクセストークンからInstagram Business Account IDを取得
    const accountResponse = await axios.get(`https://graph.facebook.com/v20.0/me/accounts?access_token=${session.user.facebookAccessToken}`)
    const pageId = accountResponse.data.data[0].id
    const pageAccessToken = accountResponse.data.data[0].access_token

    const instagramAccountResponse = await axios.get(`https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`)
    const instagramAccountId = instagramAccountResponse.data.instagram_business_account.id

    // Instagram投稿を取得
    const apiUrl = `https://graph.facebook.com/v20.0/${instagramAccountId}/media?fields=id,media_type,media_url,thumbnail_url&limit=30&access_token=${pageAccessToken}`
    const response = await axios.get<{ data: InstagramMediaItem[] }>(apiUrl)
    
    const thumbnails = response.data.data
      .filter((item: InstagramMediaItem) => item.media_type === 'IMAGE')
      .map((item: InstagramMediaItem) => item.thumbnail_url || item.media_url)
      .slice(0, 9) // 最大9枚のサムネイルを表示

    return NextResponse.json({ thumbnails })
  } catch (error) {
    console.error('Failed to fetch Instagram thumbnails:', error)
    return NextResponse.json({ error: 'Failed to fetch Instagram thumbnails' }, { status: 500 })
  }
}