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
      // Facebook認証URLを直接構築
      const authUrl = `https://www.facebook.com/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&display=page&extras=${encodeURIComponent(JSON.stringify({setup:{channel:"IG_API_ONBOARDING"}}))}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/facebook-callback`)}&response_type=token&scope=${encodeURIComponent(['instagram_basic','pages_manage_metadata','instagram_manage_comments','pages_show_list'].join(','))}`;
      // 新しいタブで開く
      window.open(authUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('認証エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Button 
        onClick={handleConnect} 
        className="mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'ログイン中...' : isReconnect ? 'Instagram再連携' : 'Facebook/Instagram連携'}
      </Button>
    </div>
  );
}
