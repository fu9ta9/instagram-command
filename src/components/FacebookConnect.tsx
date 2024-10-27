import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function FacebookConnect() {
  const { data: session, status } = useSession();
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);

  useEffect(() => {
    if (session?.user?.facebookAccessToken) {
      setIsFacebookConnected(true);
    }
  }, [session]);

  const handleFacebookConnect = () => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    
    const popup = window.open(
      '/api/auth/signin/facebook', // Facebookログインのエンドポイント
      'Facebook Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      const interval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(interval);
          // ポップアップが閉じられた後にセッションを再取得
          const updatedSession = await fetch('/api/auth/session').then(res => res.json());
          if (updatedSession.user?.facebookAccessToken) {
            setIsFacebookConnected(true);
          } else {
            setIsFacebookConnected(false);
          }
        }
      }, 1000);
    } else {
      console.error('ポップアップウィンドウを開けませんでした。');
    }
  };

  if (isFacebookConnected) {
    return <p>Facebookは既に連携されています</p>;
  }

  return (
    <button onClick={handleFacebookConnect}>
      Facebookと連携する
    </button>
  );
}