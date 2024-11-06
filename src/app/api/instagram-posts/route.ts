import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function fetchInstagramAccountData(accessToken: string) {
    const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,name,username}&access_token=${accessToken}`
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Facebook APIエラー:', errorData);
        throw new Error('Failed to fetch Instagram account');
    }

    return await response.json();
}

export async function GET() {
  console.log('GET開始');
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) { 
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        access_token: true,
        scope: true,
      },
    });

    if (!account?.access_token) {
      return NextResponse.json({ 
        error: 'Facebook account not connected',
        message: 'Facebookアカウントが接続されていません。ログインしてください。'
      }, { status: 401 });
    }

    // スコープのチェック
    const requiredScopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ];

    const currentScopes = account.scope?.split(',') || [];
    const missingScopes = requiredScopes.filter(scope => !currentScopes.includes(scope));

    // if (missingScopes.length > 0) {
    //   return NextResponse.json({
    //     error: 'Insufficient permissions',
    //     message: '必要な権限が不足しています。再度ログインして権限を付与してください。',
    //     missingScopes
    //   }, { status: 403 });
    // }

    // アカウントデータの詳細な確認
    const accountDetails = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        id: true,
        access_token: true,
        providerAccountId: true,
        scope: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
    });

    console.log('アカウント詳細:', accountDetails);

    if (!accountDetails?.access_token) {
      console.log('アカウントエラー: Facebookアカウントが接続されていないか、アクセストークンが見つかりません');
      return NextResponse.json({ 
        error: 'Facebook account not connected', 
        message: 'Facebookアカウントが接続されていません。以下を確認してください：\n1. Facebookログインが完了ていること\n2. 必要な権限が付与されていること' 
      }, { status: 401 });
    }

    // データベースアクセスの前にセッションの有効性を再確認
    const tmpAccountData = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook',
      },
      select: {
        access_token: true,
      },
    });

    if (!tmpAccountData?.access_token) {
      console.log('アカウントエラー: Facebookアカウントが接続されていないか、アクセストークンが見つかりません');
      return NextResponse.json(
        { error: 'Facebook account not connected', message: 'Facebookアカウントが接続されていません。設定画面からFacebookアカウントを接続してください。' }, 
        { status: 401 }
      );
    }

    // Instagram Business AccountのIDを取得する前にスコープを確認
    const scopeResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${tmpAccountData.access_token}`
    );
    const scopeData = await scopeResponse.json();
    console.log('付与されている権限:', scopeData);

    // 必要な権限のチェック
    const requiredPermissions = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ];

    const missingPermissions = requiredPermissions.filter(
      permission => !scopeData.data.some((p: { permission: string; status: string }) => p.permission === permission && p.status === 'granted')
    );

    if (missingPermissions.length > 0) {
      console.log('不足している権限:', missingPermissions);
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: '必要な権限が不足しています。再度Facebookログインを行ってください。',
        missingPermissions
      }, { status: 403 });
    }

    // Instagram Business AccountのIDを取得
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id}&access_token=${tmpAccountData.access_token}`
    );
    
    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.error('Facebook APIエラー:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to fetch Instagram account', 
          message: 'Instagramアカウントの取得に失敗しました。Facebookの権限設定を確認してください。',
          details: errorData 
        }, 
        { status: accountResponse.status }
      );
    }

    const instagramAccountData = await accountResponse.json();
    console.log('Facebook APIレスポンス:', instagramAccountData);

    const instagramAccountId = instagramAccountData.data[0]?.instagram_business_account?.id;

    if (!instagramAccountId) {
      console.log('アカウントエラー: Instagramビジネスアカウントが見つかりません');
      return NextResponse.json(
        { 
          error: 'Instagram business account not found', 
          message: 'Instagramビジネスアカウントが見つかりません。Facebookページに接続されたInstagramビジネスアカウントがあることを確認してください。'
        }, 
        { status: 404 }
      );
    }

    // 投稿を取得
    const postsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,media_type,media_url,thumbnail_url,timestamp&access_token=${tmpAccountData.access_token}`
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      console.error('Instagram APIエラー:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to fetch Instagram posts', 
          message: 'Instagram投稿の取得に失敗しました。',
          details: errorData 
        }, 
        { status: postsResponse.status }
      );
    }

    const postsData = await postsResponse.json();
    console.log('Instagram投稿データ:', postsData);

    // Facebookページの確認
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${tmpAccountData.access_token}`
    );
    const pagesData = await pagesResponse.json();
    console.log('Facebookページ情報:', pagesData);

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({
        error: 'No Facebook Pages',
        message: 'Facebookページが見つかりません。Facebookページを作成し、管理者権限を付与してください。'
      }, { status: 404 });
    }

    // Instagram Business Accountの確認をより詳細に
    const instagramAccountDataFetched = await fetchInstagramAccountData(tmpAccountData.access_token);
    console.log('Instagram Business Account情報:', instagramAccountDataFetched);

    if (!instagramAccountDataFetched.data?.[0]?.instagram_business_account) {
      return NextResponse.json({
        error: 'Instagram business account not found',
        message: `
          Instagramビジネスアカウントが見つかりません。
          以下を確認してください：
          1. Facebookページが存在すること
          2. Instagramアカウントがビジネスアカウントであること
          3. FacebookページとInstagramビジネ��アカウントが連携されていること
        `.trim()
      }, { status: 404 });
    }

    return NextResponse.json(postsData.data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
