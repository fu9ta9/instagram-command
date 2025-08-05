import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'

// エラーログを安全に記録する関数
async function safeLogError(message: string) {
  try {
    await prisma.executionLog.create({
      data: {
        errorMessage: message
      }
    });
  } catch (dbError) {
    console.error('DB接続エラー:', dbError);
    console.error('元のエラー:', message);
  }
}

// Persistent Menuを取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const igAccountId = searchParams.get('igAccountId')

    if (!igAccountId) {
      return NextResponse.json({ error: 'IGAccount ID is required' }, { status: 400 })
    }

    // IGAccountの取得と権限確認
    const igAccount = await prisma.iGAccount.findFirst({
      where: {
        id: igAccountId,
        userId: session.user.id
      }
    })

    if (!igAccount) {
      return NextResponse.json({ error: 'IGAccount not found' }, { status: 404 })
    }

    // Instagram APIからPersistent Menuを取得
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${igAccount.instagramId}/messaging_feature_settings?fields=persistent_menu&access_token=${igAccount.accessToken}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      await safeLogError(`Persistent Menu取得エラー: ${JSON.stringify(errorData)}`)
      return NextResponse.json({ error: 'Failed to get persistent menu' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    await safeLogError(`Persistent Menu取得処理エラー: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Persistent Menuを設定
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { igAccountId, menuItems } = body

    if (!igAccountId || !menuItems) {
      return NextResponse.json({ error: 'IGAccount ID and menu items are required' }, { status: 400 })
    }

    // IGAccountの取得と権限確認
    const igAccount = await prisma.iGAccount.findFirst({
      where: {
        id: igAccountId,
        userId: session.user.id
      }
    })

    if (!igAccount) {
      return NextResponse.json({ error: 'IGAccount not found' }, { status: 404 })
    }

    // メニュー項目の検証
    if (!Array.isArray(menuItems) || menuItems.length === 0 || menuItems.length > 5) {
      return NextResponse.json({ error: 'Menu items must be an array with 1-5 items' }, { status: 400 })
    }

    // メニュー項目の形式検証
    const validatedMenuItems = menuItems.map((item: any) => {
      if (!item.title || typeof item.title !== 'string' || item.title.length > 30) {
        throw new Error('Invalid menu item title')
      }

      if (item.type === 'postback') {
        if (!item.payload || typeof item.payload !== 'string' || item.payload.length > 1000) {
          throw new Error('Invalid postback payload')
        }
        return {
          type: 'postback',
          title: item.title,
          payload: item.payload
        }
      } else if (item.type === 'web_url') {
        if (!item.url || typeof item.url !== 'string') {
          throw new Error('Invalid web URL')
        }
        // URLの形式検証
        try {
          const url = new URL(item.url)
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Invalid URL protocol')
          }
        } catch {
          throw new Error('Invalid URL format')
        }
        return {
          type: 'web_url',
          title: item.title,
          url: item.url
        }
      } else {
        throw new Error('Invalid menu item type')
      }
    })

    // Instagram APIでPersistent Menuを設定
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${igAccount.instagramId}/messaging_feature_settings?access_token=${igAccount.accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persistent_menu: validatedMenuItems
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      await safeLogError(`Persistent Menu設定エラー: ${JSON.stringify(errorData)}`)
      return NextResponse.json({ error: 'Failed to set persistent menu', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    
    // 成功ログを記録
    await prisma.executionLog.create({
      data: {
        errorMessage: `Persistent Menu設定成功 - IGAccount: ${igAccount.instagramId}, Items: ${validatedMenuItems.length}`
      }
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    await safeLogError(`Persistent Menu設定処理エラー: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}

// Persistent Menuを削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const igAccountId = searchParams.get('igAccountId')

    if (!igAccountId) {
      return NextResponse.json({ error: 'IGAccount ID is required' }, { status: 400 })
    }

    // IGAccountの取得と権限確認
    const igAccount = await prisma.iGAccount.findFirst({
      where: {
        id: igAccountId,
        userId: session.user.id
      }
    })

    if (!igAccount) {
      return NextResponse.json({ error: 'IGAccount not found' }, { status: 404 })
    }

    // Instagram APIでPersistent Menuを削除（空配列を送信）
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${igAccount.instagramId}/messaging_feature_settings?access_token=${igAccount.accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persistent_menu: []
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      await safeLogError(`Persistent Menu削除エラー: ${JSON.stringify(errorData)}`)
      return NextResponse.json({ error: 'Failed to delete persistent menu' }, { status: response.status })
    }

    const data = await response.json()
    
    // 成功ログを記録
    await prisma.executionLog.create({
      data: {
        errorMessage: `Persistent Menu削除成功 - IGAccount: ${igAccount.instagramId}`
      }
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    await safeLogError(`Persistent Menu削除処理エラー: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}