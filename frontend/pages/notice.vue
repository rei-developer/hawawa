<template>
  <div>
    <el-row>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
      <el-col :xl='16'>
        <div class='Container'>
          <div class='item'>
            <div class='content'>
              <div class='AD hidden-mobile'>
                <iframe src='/ad.html' />
              </div>
              <div class='AD hidden-desktop'>
                <iframe src='/ad-mobile.html' />
              </div>
              <div class='marginBottom'>
                <el-button-group>
                  <el-button type='info' size='small' @click='readAll' round>
                    <font-awesome-icon icon='eye' />
                    전부 읽음
                  </el-button>
                  <el-button type='danger' size='small' @click='trashAll' round>
                    <font-awesome-icon icon='trash' />
                    전부 삭제
                  </el-button>
                </el-button-group>
              </div>
              <div class='containerSubject'>
                <font-awesome-icon icon='envelope' />
                알림 목록 ({{ $store.state.user.noticeCount }})
              </div>
              <div class='noticeList'>
                <div
                  :class='"item" + (item.confirm < 1 ? " view" : (index % 2 === 0 ? "" : " odd"))'
                  v-for='(item, index) in notices' :key='index'>
                  <div class='image' @click='move(item)'>
                    <img :src='item.profile ? "https://hawawa.co.kr/profile/" + item.profile : "/profile.png"'>
                  </div>
                  <div class='info' @click='move(item)'>
                    <div class='author'>
                      <img :src='`/level/${item.level}.png`'>
                      <img class='icon' :src='`https://hawawa.co.kr/icon/${item.icon}`' v-if='item.icon !== ""'>
                      <span class='userTitle' v-if='item.userTitle'>{{ item.userTitle }}</span>
                      {{ item.author }}
                      <span class='regdate'>
                        <font-awesome-icon icon='history' />
                        {{ $moment(item.updated).format('YYYY/MM/DD HH:mm:ss') }}
                      </span>
                    </div>
                    <div class='desciption'>
                      <span class='tagUser' v-if='item.tagAuthor'>{{ item.tagAuthor }}</span>
                      <div class='sticker' v-if='item.stickerId > 0'>
                        <img :src='`https://hawawa.co.kr/sticker/${item.stickerId}/${item.stickerSelect}`'>
                      </div>
                      <span v-html='item.content' />
                    </div>
                  </div>
                  <div class='read' @click='read(item)'>
                    <font-awesome-icon :icon='item.confirm < 1 ? "eye" : "eye-slash"' />
                  </div>
                  <div class='trash' @click='trash(item)'>
                    <font-awesome-icon icon='trash' />
                  </div>
                </div>
              </div>
            </div>
            <div class='sidebar'>
              <Recent />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Recent from '~/components/recent.vue'
  
  export default {
    components: { Recent },
    data() {
      return {
        notices: [],
        page: 0,
        bottom: false
      }
    },
    watch: {
      '$store.state.forceUpdate': function() {
        this.getData(true)
      },
      bottom: function(bottom) {
        if (bottom) this.getData()
      }
    },
    mounted() {
      if (process.browser) {
        window.addEventListener('scroll', () => {
          this.bottom = this.bottomVisible()
        })
      }
      this.getData()
    },
    methods: {
      getData: async function(forceUpdate = false) {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        if (forceUpdate) {
          this.notices = []
          this.page = 0
        }
        const data = await this.$axios.$post(
          '/api/notice/list',
          { page: this.page++ },
          { headers: { 'x-access-token': token } }
        )
        if (!data.notices) return this.$store.commit('setLoading')
        data.notices.map(notice => this.notices.push(notice))
        this.$store.commit('setLoading')
        return data
      },
      move(item) {
        this.$router.push({ path: `/b/${item.boardDomain}/${item.topicId}?postId=${item.postId}` })
      },
      read: async function(item) {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$put(
          `/api/notice/readed/${item.id}/${item.confirm > 0 ? 0 : 1}`,
          { success: true },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.notices = this.notices.map(post => {
          if (post.id === item.id) post.confirm = item.confirm > 0 ? 0 : 1
          return post
        })
        let count = this.$store.state.user.noticeCount
        this.$store.commit('user/setNoticeCount', item.confirm > 0 ? --count : ++count)
        this.$store.commit('setLoading')
      },
      readAll: async function() {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$put(
          '/api/notice/readed',
          { success: true },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.notices = this.notices.map(notice => {
          notice.confirm = 1
          return notice
        })
        this.$store.commit('user/setNoticeCount', 0)
        this.$store.commit('setLoading')
      },
      trash: async function(item) {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$delete(
          `/api/notice/clear/${item.id}`,
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.notices = this.notices.filter(notice => notice.id !== item.id)
        let count = this.$store.state.user.noticeCount
        this.$store.commit('user/setNoticeCount', item.confirm > 0 ? count : --count)
        this.$store.commit('setLoading')
      },
      trashAll: async function() {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$delete(
          '/api/notice/clear',
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.notices = []
        this.page = 0
        this.$store.commit('user/setNoticeCount', 0)
        this.$store.commit('setLoading')
      },
      bottomVisible() {
        if (process.browser) {
          const scrollY = window.pageYOffset
          const visible = document.documentElement.clientHeight
          const pageHeight = document.documentElement.scrollHeight
          const bottomOfPage = visible + scrollY >= pageHeight
          return bottomOfPage || pageHeight < visible
        }
      }
    }
  }
</script>

<style>
  .noticeList {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
  }
  .noticeList .item {
    display: flex;
    border-bottom: 1px solid #F5F5F5;
  }
  .noticeList .item:hover {
    background: #FAFAFA;
    cursor: pointer;
  }
  .noticeList .item.odd {
    background: #FAFAFA;
  }
  .noticeList .item.view {
    background: #FAFAFA;
    border-left: .25rem solid #29313D;
  }
  .noticeList .item .image {
    display: flex;
    flex-direction: column;
    padding: .25rem;
    justify-content: center;
    align-items: center;
  }
  .noticeList .item .image img {
    width: 3rem;
    height: 3rem;
    margin: .25rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
    background: #FFF;
  }
  .noticeList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .noticeList .item .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .noticeList .item .info .author img.icon {
    width: 16px;
    height: 16px;
    vertical-align: text-top;
  }
  .noticeList .item .info .author span.best {
    margin-right: .1rem;
    padding: 0 .25rem;
    background: #ED1C24;
    border-radius: .1rem;
    color: #FFF;
    font-size: .7rem;
  }
  .noticeList .item .info .author span.userTitle {
    padding: 0 .25rem;
    background: #29313D;
    border-radius: .25rem;
    color: #FFF;
    font-size: .7rem;
  }
  .noticeList .item .info .author span.regdate {
    margin-left: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
  .noticeList .item .info .desciption {
    color: #333;
    font-size: .8rem;
  }
  .noticeList .item .info .desciption .sticker img {
    width: 100px;
    height: 100px;
    border-radius: .25rem;
  }
  .noticeList .item .info .desciption span.tagUser {
    margin-right: .1rem;
    padding: 0 .5rem;
    background: #29313D;
    border-radius: 500rem;
    color: #FFF;
    font-size: .75rem;
  }
  .noticeList .item .read,
  .noticeList .item .trash {
    display: flex;
    flex-direction: column;
    width: 3rem;
    background: #29313D;
    color: #FFF;
    font-size: 1rem;
    justify-content: center;
    align-items: center;
  }
  .noticeList .item .trash {
    background: #ED1C24;
  }
  .noticeList .item .read:hover,
  .noticeList .item .trash:hover {
    opacity: .8;
    cursor: pointer;
  }
</style>