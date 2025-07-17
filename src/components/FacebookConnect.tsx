import { Button } from "@/components/ui/button";
import { useState } from 'react';

interface FacebookConnectProps {
  isReconnect?: boolean;
}

export default function FacebookConnect({ isReconnect = false }: FacebookConnectProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    try {
      // Instagram Business認証URLを構築
      // const redirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/instagram-callback`;
      // const scopes = [
      //   'instagram_business_basic',
      //   'instagram_business_manage_messages',
      //   'instagram_business_manage_comments',
      //   'instagram_business_manage_insights'
      // ];
      
      // const authUrl = `https://www.instagram.com/oauth/authorize?` + 
      //   `client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}` +
      //   `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      //   `&response_type=code` +
      //   `&scope=${encodeURIComponent(scopes.join(','))}` +
      //   `&enable_fb_login=0` +
      //   `&force_authentication=1`;
      
      
      // 新しいタブで開く
      const authUrl = 'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1657931374802435&redirect_uri=https://insta-command.com/instagram-callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights';
      
      window.open(authUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('認証エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Button 
        onClick={handleConnect} 
        disabled={isLoading}
      >
        {isLoading ? 'ログイン中...' : isReconnect ? 'Instagram再連携' : 'Instagram連携'}
      </Button>
  );
}
