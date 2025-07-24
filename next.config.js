/** @type {import('next').NextConfig} */
const nextConfig = {
  // APIルートを動的に処理するように設定
  async headers() {
    return [
      {
        source: '/api/instagram/posts',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/api/instagram/search/posts',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/api/instagram/search-accounts',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/api/instagram/search/all-posts',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/api/replies/recent',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドではopenid-clientのfallbackを設定
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
