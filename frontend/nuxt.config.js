module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: '하와와',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no, shrink-to-fit=no' },
      { name: 'theme-color', content: '#29313D' },
      { name: 'google-site-verification', content: 'BEmhl96CsIh9rlpvLSKMLLjHOccJrj6VnMdtMjd8Nbk' },
      { hid: 'description', name: 'description', content: '하와와 - 유머, 정보, 연예인, 애니메이션, 서브컬쳐 커뮤니티' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#409EFF' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    vendor: ['vuex', 'socket.io-client', 'element-ui'],
  },
  plugins: [
    '~/plugins/socket.io.js',
    '~/plugins/element-ui',
    { src: '~/plugins/quill.js', ssr: false },
    { src: '~/plugins/chart', ssr: false },
  ],
  css: [
    '~/assets/main.css',
    'element-ui/lib/theme-chalk/index.css',
    'element-ui/lib/theme-chalk/display.css'
  ],
  modules: [
    '@nuxtjs/bulma',
    '@nuxtjs/proxy',
    ['@nuxtjs/moment', ['ko']],
    'nuxt-fontawesome',
    'nuxt-clipboard2'
  ],
  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['fas']
      }
    ]
  },
  proxy: {
    '/api': 'http://localhost:8000'
  },
  env: {
    SOCKET_HOST_URL: 'https://hawawa.co.kr'
  },
  configureWebpack: {
    output: {
      globalObject: 'this',
    },
  },
}