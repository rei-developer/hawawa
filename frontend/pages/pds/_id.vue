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
              <div>
                <nuxt-link :to='`/pds`'>
                  <el-button type='info' size='small'>목록</el-button>
                </nuxt-link>
                <nuxt-link :to='`/pds/write`' v-if='$store.state.user.isLogged'>
                  <el-button class='floatRight' type='primary' size='small'>
                    <font-awesome-icon icon='pencil-alt' />
                    업로드
                  </el-button>
                </nuxt-link>
              </div>
              <div class='Blank' />
              <div class='topicArticle'>
                <div class='header'>
                  <div class='image'>
                    <img :src='pds.profile ? "https://hawawa.co.kr/profile/" + pds.profile : "/profile.png"'>
                  </div>
                  <div class='info'>
                    <div class='subject'>
                      <span class='star' v-if='pds.isBest > 0'>
                        <img :src='pds.isBest > 1 ? "/star.svg" : "/burn.svg"'>
                      </span>
                      <span class='notice' v-if='pds.isNotice > 0'>NOTICE</span>
                      {{ pds.title }}
                    </div>
                    <div class='author'>
                      <img :src='`/level/${pds.level}.png`'>
                      <img class='icon' :src='`https://hawawa.co.kr/icon/${pds.icon}`' v-if='pds.icon !== ""'>
                      <span class='userTitle' v-if='pds.userTitle'>{{ pds.userTitle }}</span>
                      {{ pds.author }}
                    </div>
                    <div class='detail'>
                      <span>
                        <font-awesome-icon icon='flag-checkered' />
                        {{ id }}
                      </span>
                      <span>
                        <font-awesome-icon icon='clock' />
                        {{ $moment(pds.created).fromNow() }}
                      </span>
                      <span v-if='pds.hits > 0'>
                        <font-awesome-icon icon='eye' />
                        {{ numberWithCommas(pds.hits) }}
                      </span>
                      <span v-if='pds.likes > 0'>
                        <font-awesome-icon icon='heart' />
                        +{{ numberWithCommas(pds.likes) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class='content'>
                  <span v-html='pds.content' />
                  <div class='event'>
                    <el-button-group>
                      <el-button type='primary' size='small' round @click='votes(true)'>
                        <img src='/up.png'>
                        좋아요 {{ pds.likes }}
                      </el-button>
                      <el-button type='info' size='small' round @click='votes(false)'>
                        나빠요 {{ pds.hates }}
                        <img src='/down.png'>
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </div>
              <div class='marginTop'>
                <nuxt-link :to='`/pds`'>
                  <el-button type='info' size='small'>목록</el-button>
                </nuxt-link>
                <el-button
                  type='info'
                  size='small'
                  @click='removeHandler'
                  v-if='$store.state.user.isLogged && ($store.state.user.isAdmin > 0 || pds.userId === $store.state.user.id)'>
                  삭제
                </el-button>
                <nuxt-link :to='`/pds/write`' v-if='$store.state.user.isLogged'>
                  <el-button class='floatRight' type='primary' size='small'>
                    <font-awesome-icon icon='pencil-alt' />
                    업로드
                  </el-button>
                </nuxt-link>
              </div>
              <PdsList class='marginTop' :id='id' :purePage='$route.query.page || 1' />
            </div>
            <div class='sidebar'>
              <Recent />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import PdsList from '~/components/pds/list.vue'
  import Recent from '~/components/recent.vue'

  export default {
    components: {
      PdsList,
      Recent,
    },
    data() {
      return {
        id: 0,
        pds: {
          userId: 0,
          author: '',
          title: '',
          content: '',
          ip: '',
          header: '',
          url: '',
          cost: 0,
          created: '',
          updated: '',
          hits: 0,
          likes: 0,
          hates: 0,
          isImage: false,
          isNotice: false,
          profile: '',
          admin: 0
        },
        loading: true
      }
    },
    async asyncData ({ app, params, store, $axios }) {
      const id = params.id
      const token = store.state.user.isLogged ? store.state.user.token : ''
      const data = await $axios.$get(
        `/api/pds/read/${id}`,
        { headers: { 'x-access-token': token } }
      )
      if (data.status === 'fail') return console.log(data.message)
      if (store.state.user.isLogged) store.commit('user/setNoticeCount', data.count)
      return {
        id,
        pds: data.pds,
        images: data.images
      }
    },
    methods: {
      votes: async function(flag) {
        if (this.id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post(
          '/api/pds/vote',
          { id: this.id, likes: flag },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message('투표했습니다.')
        this.$store.commit('setLoading')
      },
      removeHandler: async function() {
        if (this.id < 1 || !this.$store.state.user.isLogged) return
        this.$confirm('정말로 삭제하시겠습니까?', '알림', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소'
        }).then(() => {
          this.remove()
        })
      },
      remove: async function() {
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$delete(
          '/api/pds/delete',
          {
            data: { id: this.id },
            headers: { 'x-access-token': token }
          }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$router.go(-1)
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
        })
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    },
    head() {
      return {
        title: `${this.pds.title} - 하와와`
      }
    }
  }
</script>

<style>
  .topicArticle {
    display: flex;
    margin-top: 1rem;
    border: 1px solid #EEE;
    background: rgba(255, 255, 255, .95);
    flex-direction: column;
  }
  .topicArticle .header {
    display: flex;
    padding: .5rem;
    border-bottom: 1px solid #EEE;
  }
  .topicArticle .header .image {
    display: flex;
    margin-right: 1rem;
    flex-direction: column;
  }
  .topicArticle .header .image img {
    width: 4.5rem;
    height: 4.5rem;
    padding: 2px;
    border-radius: 500rem;
    box-shadow: 1px 1px 5px rgba(41, 49, 61, .2);
  }
  .topicArticle .header .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .topicArticle .header .info .subject {
    color: #29313D;
    font-size: 1rem;
    font-weight: bold;
  }
  .topicArticle .header .info .subject span.star img {
    width: 16px;
    height: 16px;
  }
  .topicArticle .header .info .subject span.notice,
  .topicArticle .header .info .subject span.category {
    margin-right: .1rem;
    padding: 0 .25rem;
    background: #ED1C24;
    border-radius: .1rem;
    color: #FFF;
    font-size: .8rem;
  }
  .topicArticle .header .info .subject span.category { background: #29313D }
  .topicArticle .header .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .topicArticle .header .info .author img.icon {
    width: 16px;
    height: 16px;
    vertical-align: text-top;
  }
  .topicArticle .header .info .author span.userTitle {
    padding: 0 .25rem;
    background: #29313D;
    border-radius: .25rem;
    color: #FFF;
    font-size: .7rem;
  }
  .topicArticle .header .info .detail span {
    margin-right: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
  .topicArticle .content {
    margin: 0;
    padding: 1rem;
    border-bottom: 1px solid #F5F5F5;
    font-size: .9rem;
  }
  .topicArticle .content .chart {
    text-align: center;
  }
  .topicArticle .content img {
    max-width: 100%;
    height: auto;
  }
  .topicArticle .content iframe {
    min-width: calc(375px - 2rem);
    min-height: 193px;
    border: 0;
  }
  .topicArticle .content .event {
    width: 300px;
    margin: 2rem auto .5rem;
    text-align: center;
  }
  .topicArticle .info {
    color: #29313D;
    font-size: .8rem;
  }
  .topicArticle .info .item {
    padding: .25rem;
    border-bottom: 1px solid #EEE;
  }
  .topicArticle .info .item:last-child { border: 0 }
  .topicArticle .info .item span.link:hover {
    color: #25c6ff;
    text-decoration: underline;
    cursor: pointer;
  }
  .topicArticle .info .item .event {
    display: inline-block;
    width: fit-content;
    padding: 0 .5rem;
    background: #EAEAEA;
    border-radius: .25rem;
    font-size: .75rem;
  }
  .topicArticle .info .item .event:hover {
    opacity: .8;
    cursor: pointer;
  }

  @media (min-width: 720px) {
    .topicArticle .content iframe {
      min-width: 480px;
      min-height: 360px;
      border: 0;
    }
  }
</style>