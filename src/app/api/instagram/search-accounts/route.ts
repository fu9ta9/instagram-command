import { NextResponse } from 'next/server';

// モックアカウントデータ（APIが使用できない場合のフォールバック用）
const mockAccounts = [
  { id: "1", username: "travel_photography", name: "旅行写真", avatar: "https://via.placeholder.com/40" },
  { id: "2", username: "food_lover", name: "フードラバー", avatar: "https://via.placeholder.com/40" },
  { id: "3", username: "fitness_guru", name: "フィットネスグル", avatar: "https://via.placeholder.com/40" },
  { id: "4", username: "tech_reviews", name: "テックレビュー", avatar: "https://via.placeholder.com/40" },
  { id: "5", username: "fashion_trends", name: "ファッショントレンド", avatar: "https://via.placeholder.com/40" },
];

export async function GET(request: Request) {
  try {
    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ accounts: [] });
    }

    // 環境変数からアクセストークンを取得
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !igUserId) {
      console.warn('Instagram API設定が不足しています。モックデータを使用します。');
      // モックデータをフィルタリングして返す
      const filteredAccounts = mockAccounts.filter(
        account => 
          account.username.toLowerCase().includes(query.toLowerCase()) ||
          account.name.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({ accounts: filteredAccounts });
    }

    try {
      // Instagram Graph APIを使用してアカウント検索
      // 注意: 実際のInstagram APIには直接的なアカウント検索エンドポイントがないため、
      // ここではIGIDを使用した検索を行います
      
      // 例: ユーザー名で検索する場合
      const apiUrl = `https://graph.facebook.com/v22.0/${igUserId}?fields=business_discovery.username(${query}){username,name,profile_picture_url,id}&access_token=${accessToken}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        // APIエラーの場合はモックデータにフォールバック
        console.warn('Instagram API呼び出しエラー。モックデータを使用します。');
        const filteredAccounts = mockAccounts.filter(
          account => 
            account.username.toLowerCase().includes(query.toLowerCase()) ||
            account.name.toLowerCase().includes(query.toLowerCase())
        );
        return NextResponse.json({ accounts: filteredAccounts });
      }
      
      const data = await response.json();
      
      // business_discoveryが存在する場合、そのアカウント情報を返す
      if (data.business_discovery) {
        const account = data.business_discovery;
        const formattedAccount = {
          id: account.id,
          username: account.username,
          name: account.name || account.username,
          avatar: account.profile_picture_url || "https://via.placeholder.com/40"
        };
        
        return NextResponse.json({ accounts: [formattedAccount] });
      } else {
        // 見つからない場合は空の配列を返す
        return NextResponse.json({ accounts: [] });
      }
    } catch (error) {
      console.error('Instagram API呼び出しエラー:', error);
      // エラーの場合はモックデータにフォールバック
      const filteredAccounts = mockAccounts.filter(
        account => 
          account.username.toLowerCase().includes(query.toLowerCase()) ||
          account.name.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({ accounts: filteredAccounts });
    }
  } catch (error) {
    console.error('アカウント検索エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 