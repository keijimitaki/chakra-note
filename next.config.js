/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
  env: {
    REACT_APP_STRIPE_PUBLISHABLE_KEY: "pk_test_51KCuoBBfCVZgAE4exIMlS7PBPHRQtoAVs5I1kkxQ6wZBxGuSjWgLDRc1Vc6NhOVujwZE8aIQhTNniT4rSfPy1sVw00ABOVsiVR"
  },

  // async rewrites() {
  //   return {
  //     // すべてのNext.jsページ（ダイナミックルートを含む）をチェックした後と静的ファイルをチェックした後、他のリクエストをプロキシします。
  //     fallback: [
  //       {
  //         source: '/functions/:path*',
  //         destination: `http://localhost:4000/:path*`,
  //       },
  //       {
  //         source: '/api/:path*',
  //         destination: `https://www.yahoo.co.jp`,
  //       },
  //       {
  //         source: '/api/mydev/',
  //         destination: `https://jsonplaceholder.typicode.com/posts/`,
  //       },             
  //     ],
  //   }
  // },
  
  // async redirects() {
  //   return [
  //     {
  //       source: '/about',
  //       destination: '/',
  //       permanent: true,
  //     },
  //   ]
  // },


}

module.exports = nextConfig
