import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function FacebookConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    try {
      // Business Login用のカスタムURL構築
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
        display: 'page',
        extras: JSON.stringify({
          setup: {
            channel: "IG_API_ONBOARDING"
          }
        }),
        redirect_uri: `${process.env.NEXTAUTH_URL}/dashboard`,
        response_type: 'token',
        scope: [
          'instagram_basic',
          'instagram_content_publish',
          'instagram_manage_comments',
          'instagram_manage_insights',
          'pages_show_list',
          'pages_read_engagement'
        ].join(',')
      });

      // Facebook Business Login URLへリダイレクト
      const loginUrl = `https://www.facebook.com/dialog/oauth?${params.toString()}`;
      window.location.href = loginUrl;

    } catch (error) {
      console.error('Facebook Business Login Error:', error);
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
