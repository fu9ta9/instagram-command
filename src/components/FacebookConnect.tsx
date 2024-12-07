import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function FacebookConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await signIn('facebook', {
        callbackUrl: '/api/auth/callback/facebook',
        redirect: true
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
        {isLoading ? 'ログイン中...' : 'Facebook/Instagram連携'}
      </Button>
    </div>
  );
}
