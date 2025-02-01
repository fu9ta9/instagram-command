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
      const options = {
        callbackUrl: '/api/auth/callback/facebook',
        redirect: true
      };

      if (isReconnect) {
        await signIn('facebook', {
          ...options,
          auth_type: 'reauthorize'
        });
      } else {
        await signIn('facebook', options);
      }
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
