<template>
  <div>
    <no-ssr>
      <Loading v-if='$store.state.loading' />
    </no-ssr>
    <el-container>
      <el-aside width='200px' v-if='$store.state.aside'>
        <Sidemenu />
      </el-aside>
      <el-container>
        <div class='version' v-if='frontendVersion < backendVersion'>
          최신 버전이 아닙니다. 탭 또는 브라우저를 새로 열어주세요!
        </div>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <nuxt />
        </el-main>
      </el-container>
    </el-container>
    <div class='popupMenu hidden-desktop' @click='aside' round>
      <font-awesome-icon icon='bars' />
    </div>
  </div>
</template>

<script>
  import Loading from '~/components/loading.vue'
  import Header from '~/components/header.vue'
  import Sidemenu from '~/components/sideMenu.vue'
  import Footer from '~/components/footer.vue'
  
  export default {
    components: {
      Loading,
      Header,
      Sidemenu,
      Footer
    },
    data() {
      return {
        backendVersion: 0,
        frontendVersion: 61
      }
    },
    beforeMount() {
      this.$socket.on('newBest', data => {
        this.$notify({
          title: data.title,
          message: '새로운 인기글이 등록되었습니다!',
          customClass: 'notify best',
          position: 'top-right',
          onClick: () => this.move(data)
        })
        this.playSound('/alram.mp3')
      })
      this.$socket.on('newTopic', data => {
        this.$notify({
          title: data.title,
          message: '새로운 글이 등록되었습니다.',
          customClass: 'notify',
          position: 'top-right',
          onClick: () => this.move(data)
        })
        this.playSound('/alram.mp3')
      })
    },
    mounted() {
      this.checkVersion()
      this.checkLogged()
      this.getNotices()
      this.updateNotices()
    },
    beforeDestroy() {
      this.$socket.removeAllListeners()
      this.$socket.clear()
    },
    methods: {
      checkVersion: async function() {
        const data = await this.$axios.$get('/api/version')
        this.backendVersion = data.version || 0
      },
      checkLogged: async function() {
        const token = localStorage.token
        if (!token) return
        const data = await this.$axios.$get(
          '/api/auth/check',
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return
        data.token = token
        this.$store.commit('user/setUser', data)
      },
      getNotices: async function() {
        const token = localStorage.token
        if (!token) return
        const data = await this.$axios.$get(
          '/api/notice',
          { headers: { 'x-access-token': token } }
        )
        if (data.count) this.$store.commit('user/setNoticeCount', data.count)
      },
      updateNotices() {
        setTimeout(async () => {
          this.getNotices()
          this.updateNotices()
        }, 10000)
      },
      move(item) {
        this.$router.push({ path: `/b/${item.domain}/${item.id}` })
      },
      aside() {
        this.$store.commit('setAside')
      },
      playSound(sound) {
        if (!sound) return
        const audio = new Audio(sound)
        audio.play()
      }
    }
  }
</script>

<style>
  /* Version */
  .version {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: .5rem 0;
    border-top: 1px solid rgba(0, 0, 0, .1);
    background: #29313D;
    color: yellow;
    font-size: .8rem;
    text-align: center;
    z-index: 10000;
  }

  /* Popup Menu */
  .popupMenu {
    position: fixed;
    left: 2rem;
    bottom: 2rem;
    width: 4rem;
    height: 4rem;
    line-height: 3.9rem;
    border-radius: 500rem;
    background: #29313D;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.1);
    color: #FFF;
    font-size: 1.5rem;
    text-align: center;
    cursor: pointer;
    z-index: 100;
  }
  .popupMenu:hover {
    opacity: .8;
  }

  .notify {
    padding: .25rem 0;
    border: 0;
    border-radius: .25rem;
  }
  .notify:hover {
    opacity: .9;
    cursor: pointer;
  }
  .notify.best {
    background: #25c6ff;
  }
  .notify.best .el-notification__title,
  .notify.best .el-notification__content,
  .notify.best .el-notification__closeBtn { color: #FFF }
  .notify .el-notification__content { margin: 0 }
</style>