'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FacebookCallback() {
  const router = useRouter();

  useEffect(() => {
    // ハッシュフラグメントからトークン情報を取得
    const hash = window.location.hash.substring(1); // #を除去
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const dataAccessExpirationTime = params.get('data_access_expiration_time');

    if (accessToken) {
      // トークン情報をクエリパラメータとしてAPIに渡す
      fetch(`/api/auth/callback/facebook?access_token=${accessToken}&expires_in=${expiresIn}&data_access_expiration_time=${dataAccessExpirationTime}`)
        .then(response => {
          if (response.ok) {
            router.push('/dashboard');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [router]);

  return <div>Processing Facebook login...</div>;
} 