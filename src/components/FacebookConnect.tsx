import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

interface FacebookConnectProps {
  isReconnect?: boolean;
}

export default function FacebookConnect({ isReconnect = false }: FacebookConnectProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // 別タブで開く
      await signIn('facebook', {
        callbackUrl: '/api/auth/callback/facebook',
        redirect: false
      }).then((result) => {
        if (result?.url) {
          window.open(result.url, '_blank');
        }
      });
    } catch (error) {
      console.error('サインインエラー:', error);
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
