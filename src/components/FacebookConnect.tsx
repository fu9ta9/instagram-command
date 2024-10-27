import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function FacebookConnect() {
  const { data: session } = useSession();
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);

  useEffect(() => {
    if (session?.user?.facebookAccessToken) {
      setIsFacebookConnected(true);
    }
  }, [session]);

  const handleFacebookConnect = async () => {
    const result = await signIn('facebook', { redirect: false });
    if (result?.error) {
      console.error('Facebook連携に失敗しました:', result.error);
    } else {
      setIsFacebookConnected(true);
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
