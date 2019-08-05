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
                  <el-button type='primary' size='small' @click='getData("all", true)' round>전체</el-button>
                  <el-button type='info' size='small' @click='getData("best", true)' round>인기</el-button>
                  <el-button type='info' size='small' @click='getData("talk", true)' round>토크</el-button>
                </el-button-group>
              </div>
              <masonry
                :cols='{ default: 4, 1024: 3, 768: 2 }'
                :gutter='10'>
                <div
                  class='masonryList'
                  v-for='(item, index) in topics'
                  :key='index'>
                  <div v-if='item.imageUrl' class='item'>
                    <img
                      @click='move(item)'
                      :src='`https://hawawa.co.kr/img/${item.imageUrl}`'>
                    <div class='user'>
                      <div class='item'>
                        <div class='image'>
                          <img :src='item.profile ? "https://hawawa.co.kr/profile/" + item.profile : "/profile.png"'>
                        </div>
                        <div class='info'>
                          <div><b>{{ item.author }}</b></div>
                          <div>{{ $moment(item.created).fromNow() }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </masonry>
              <!--
              <div class='indexTopicList'>
                <div
                  class='item'
                  v-for='(item, index) in topics' :key='index'>
                  <div class='grade'>
                    <span class='likes'>
                      <font-awesome-icon icon='angle-up' />
                      {{ numberWithCommas(item.likes) }}
                    </span>
                    <el-button
                      size='mini'
                      plain round
                      @click='votes(item.id)'>
                      <font-awesome-icon icon='heart' />
                    </el-button>
                  </div>
                  <div class='image' @click='move(item)'>
                    <img :src='item.imageUrl ? "https://idolboard.com/img/thumb/" + item.imageUrl : "/default.png"'>
                  </div>
                  <div class='info' @click='move(item)'>
                    <div class='subject'>
                      <span class='board'>{{ getBoardName(item.boardDomain) }}</span>
                      <span class='star' v-if='item.isBest > 0'>
                        <img :src='item.isBest > 1 ? "/star.svg" : "/burn.svg"'>
                      </span>
                      <span class='category' v-if='item.category !== ""'>{{ item.category }}</span>
                      {{ item.title }}
                      <span class='newest' v-if='$moment().diff($moment(item.created), "days") <= 1'>NEW</span>
                      <span class='posts' v-if='item.postsCount > 0'>{{ numberWithCommas(item.postsCount) }}</span>
                    </div>
                    <div class='regdate'>
                      <font-awesome-icon icon='clock' />
                      {{ $moment(item.created).format('YYYY/MM/DD HH:mm:ss') }}
                    </div>
                  </div>
                </div>
              </div> -->
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
  import Library from '~/assets/lib.js'
  import Recent from '~/components/recent.vue'

  export default {
    components: { Recent },
    data() {
      return {
        domain: 'all',
        topics: [],
        topicsCount: 0,
        page: 0,
        bottom: false,
        lading: false
      }
    },
    watch: {
      '$store.state.forceUpdate': function() {
        this.getData('all', true)
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
      getBoardName(domain = this.domain) {
        return Library.getBoardName(domain)
      },
      getData: async function(domain = this.domain, forceUpdate = false) {
        this.$store.commit('setLoading', true)
        if (this.domain != domain) this.domain = domain
        if (forceUpdate) {
          this.topics = []
          this.topicsCount = 0
          this.page = 0
        }
        const data = await this.$axios.$post(
          '/api/topic/list',
          { domain, page: this.page++ }
        )
        if (!data.topics) return this.$store.commit('setLoading')
        data.topics.map(topic => this.topics.push(topic))
        this.topicsCount = data.count
        this.$store.commit('setLoading')
        return data
      },
      votes: async function(id) {
        if (process.browser) {
          if (id < 1) return
          if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
          const token = this.$store.state.user.token
          this.$store.commit('setLoading', true)
          const data = await this.$axios.$post(
            '/api/topic/vote',
            { id, likes: true },
            { headers: { 'x-access-token': token } }
          )
          if (data.status === 'fail') {
            this.$store.commit('setLoading')
            return this.$message.error(data.message || '오류가 발생했습니다.')
          }
          data.move === 'BEST' ? this.$message.success('인기글로 보냈습니다!') : this.$message('추천했습니다.')
          this.$store.commit('setLoading')
        }
      },
      move(item) {
        const domain = this.domain === 'best' ? 'best' : item.boardDomain
        this.$router.push({ path: `/b/${domain}/${item.id}` })
      },
      bottomVisible() {
        if (process.browser) {
          const scrollY = window.pageYOffset
          const visible = document.documentElement.clientHeight
          const pageHeight = document.documentElement.scrollHeight
          const bottomOfPage = visible + scrollY >= pageHeight
          return bottomOfPage || pageHeight < visible
        }
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  .masonryList {
    position: relative;
    width: 100%;
    height: auto;
    margin-bottom: 4px;
  }
  .masonryList .item img {
    width: 100%;
    max-height: 480px;
    border-radius: .15rem;
  }
  .masonryList .item img:hover {
    opacity: .8;
    cursor: pointer;
  }
  .masonryList .item .user {
    display: flex;
    position: absolute;
    width: 100%;
    height: 44px;
    bottom: 6px;
    padding: 6px;
    background: linear-gradient(to top, rgba(0, 0, 0, .5), transparent);
    flex-direction: column;
  }
  .masonryList .item .user .item {
    display: flex;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 1rem;
  }
  .masonryList .item .user .item .image {
    display: flex;
    flex-direction: column;
  }
  .masonryList .item .user .item .image img {
    width: 32px;
    height: 32px;
    border-radius: 500rem;
  }
  .masonryList .item .user .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-left: .25rem;
    color: #FFF;
    font-size: .7rem;
  }
</style>