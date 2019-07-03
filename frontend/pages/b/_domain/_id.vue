<template>
  <div>
    <!-- <div class='animeBackground' v-if='domain === "anime"' /> -->
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
                <nuxt-link :to='`/b/${domain}`'>
                  <el-button type='info' size='small'>목록</el-button>
                </nuxt-link>
                <nuxt-link :to='`/b/${domain}/write`' v-if='$store.state.user.isLogged && domain !== "all" && domain !== "best"'>
                  <el-button class='floatRight' type='primary' size='small'>
                    <font-awesome-icon icon='pencil-alt' />
                    글 작성
                  </el-button>
                </nuxt-link>
              </div>
              <div class='Blank' />
              <div class='topicArticle'>
                <div class='header'>
                  <div class='image'>
                    <img :src='topic.profile ? "https://hawawa.co.kr/profile/" + topic.profile : "/profile.png"'>
                  </div>
                  <div class='info'>
                    <div class='subject'>
                      <span class='star' v-if='topic.isBest > 0'>
                        <img :src='topic.isBest > 1 ? "/star.svg" : "/burn.svg"'>
                      </span>
                      <span class='notice' v-if='topic.isNotice > 0'>NOTICE</span>
                      <span class='category' v-if='topic.category !== ""'>{{ topic.category }}</span>
                      {{ topic.title }}
                    </div>
                    <div class='author'>
                      <img :src='`/level/${topic.level}.png`'>
                      <img class='icon' :src='`https://hawawa.co.kr/icon/${topic.icon}`' v-if='topic.icon !== ""'>
                      <span class='userTitle' v-if='topic.userTitle'>{{ topic.userTitle }}</span>
                      {{ topic.author }}
                    </div>
                    <div class='detail'>
                      <span>
                        <font-awesome-icon icon='flag-checkered' />
                        {{ id }}
                      </span>
                      <span>
                        <font-awesome-icon icon='clock' />
                        {{ $moment(topic.created).fromNow() }}
                      </span>
                      <span v-if='topic.hits > 0'>
                        <font-awesome-icon icon='eye' />
                        {{ numberWithCommas(topic.hits) }}
                      </span>
                      <span v-if='topic.likes > 0'>
                        <font-awesome-icon icon='heart' />
                        +{{ numberWithCommas(topic.likes) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class='content'>
                  <div class='chart' v-if='topic.isChart'>
                    <no-ssr>
                      <ChartPie
                        :data='charts.data'
                        :labels='charts.labels' />
                      <div class='marginVertical'>
                        <el-select v-model='charts.select' placeholder='설문조사 참여'>
                          <el-option
                            v-for='(item, index) in charts.labels'
                            :key='index'
                            :value='index'
                            :label='`${index + 1}. ${item} (${charts.data[index] ? numberWithCommas(charts.data[index]) : 0})`' />
                        </el-select>
                        <el-button
                          type='primary'
                          @click='chartVotes'>
                          <font-awesome-icon icon='chart-pie' />
                          설문조사 참여
                        </el-button>
                      </div>
                    </no-ssr>
                  </div>
                  <span v-html='topic.content' />
                  <div class='event'>
                    <el-button-group>
                      <el-button type='primary' size='small' round @click='votes(true)'>
                        <img src='/up.png'>
                        데뷔 {{ topic.likes }}
                      </el-button>
                      <el-button type='info' size='small' round @click='votes(false)'>
                        탈락 {{ topic.hates }}
                        <img src='/down.png'>
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
                <div class='info'>
                  <div class='item' v-if='images'>
                    <div
                      class='images'
                      v-for='(item, index) in images' :key='`i${index}`'>
                      <font-awesome-icon icon='file-image' />
                      <a href='#' :download='`https://hawawa.co.kr/img/${item.imageUrl}`'>
                        <span class='link'>[{{ index + 1 }}] {{ item.name }}</span>
                      </a>
                    </div>
                  </div>
                  <div class='item'>
                    <span>
                      <font-awesome-icon icon='link' />
                      https://hawawa.co.kr/b/{{ domain }}/{{ id }}
                    </span>
                    <div class='event' @click='copyLink(`https://hawawa.co.kr/b/${domain}/${id}`)'>복사하기</div>
                  </div>
                </div>
              </div>
              <PostList :id='id' :topic='topic' />
              <div>
                <nuxt-link :to='`/b/${domain}`'>
                  <el-button type='info' size='small'>목록</el-button>
                </nuxt-link>
                <el-button
                  type='info'
                  size='small'
                  @click='removeHandler'
                  v-if='$store.state.user.isLogged && ($store.state.user.isAdmin > 0 || topic.userId === $store.state.user.id)'>
                  삭제
                </el-button>
                <nuxt-link :to='`/b/${domain}/write`' v-if='$store.state.user.isLogged && domain !== "all" && domain !== "best"'>
                  <el-button class='floatRight' type='primary' size='small'>
                    <font-awesome-icon icon='pencil-alt' />
                    글 작성
                  </el-button>
                </nuxt-link>
              </div>
              <TopicList class='marginTop' :id='id' :purePage='$route.query.page || 1' />
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
  import TopicList from '~/components/topic/list.vue'
  import PostList from '~/components/post/list.vue'
  import Recent from '~/components/recent.vue'
  import ChartPie from '~/components/chart/chart-pie'
  import axios from 'axios'
  
  export default {
    components: {
      TopicList,
      PostList,
      Recent,
      ChartPie
    },
    data() {
      return {
        domain: '',
        id: 0,
        topic: {
          userId: 0,
          boardDomain: '',
          originBoardDomain: '',
          category: '',
          author: '',
          title: '',
          content: '',
          ip: '',
          header: '',
          created: '',
          updated: '',
          hits: 0,
          likes: 0,
          hates: 0,
          isChart: false,
          isImage: false,
          isBest: false,
          isNotice: false,
          profile: '',
          admin: 0
        },
        chart: {
          data: [],
          labels: [],
          select: 0
        },
        images: [],
        loading: true
      }
    },
    async asyncData ({ app, params, store }) {
      const domain = params.domain
      const id = params.id
      const token = store.state.user.isLogged ? store.state.user.token : ''
      const { data } = await axios.get(
        `/api/topic/read/${id}`,
        { headers: { 'x-access-token': token } }
      )
      if (data.status === 'fail') return alert(data.message)
      if (store.state.user.isLogged) store.commit('user/setNoticeCount', data.count)
      const charts = data.charts ? data.charts.map(item => item.text) : []
      const chartVotes = []
      if (data.chartVotes) data.chartVotes.map(item => chartVotes[item.select] = item.count)
      return {
        domain,
        id,
        topic: data.topic,
        charts: {
          data: chartVotes,
          labels: charts,
          select: 0
        },
        images: data.images
      }
    },
    beforeMount() {
      this.$socket.emit('join', this.id)
      this.$socket.on('vote', data => {
        this.topic.likes = data.likes
        this.topic.hates = data.hates
      })
    },
    beforeDestroy() {
      this.$socket.emit('leave', this.id)
      this.$socket.removeAllListeners()
    },
    methods: {
      votes: async function(flag) {
        if (this.id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const { data } = await axios.post(
          '/api/topic/vote',
          { id: this.id, likes: flag },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        data.move === 'BEST' ? this.$message.success('인기글로 보냈습니다.') : this.$message('투표했습니다.')
        this.$store.commit('setLoading')
      },
      chartVotes: async function() {
        if (this.charts.select < 0 || this.charts.select > this.charts.labels.length) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const { data } = await axios.post(
          '/api/chart/vote',
          { id: this.id, select: this.charts.select },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('설문조사를 참여했습니다.')
        this.$store.commit('setLoading')
      },
      copyLink: async function(link) {
        this.$message.success('링크를 복사했습니다.')
        this.$copyText(link)
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
        const { data } = await axios.delete(
          '/api/topic/delete',
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
        title: `${this.topic.title} - 하와와`
      }
    }
  }
</script>

<style>
  .topicArticle {
    display: flex;
    margin-top: 1rem;
    background: rgba(255, 255, 255, .95);
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
    flex-direction: column;
  }
  .topicArticle .header {
    display: flex;
    padding: .5rem;
    border-bottom: 1px solid #F5F5F5;
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
    box-shadow: 1px 1px 5px rgba(41, 49, 61, .5);
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
    border-bottom: 1px solid #F5F5F5;
  }
  .topicArticle .info .item:last-child { border: 0 }
  .topicArticle .info .item span.link:hover {
    color: #409EFF;
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