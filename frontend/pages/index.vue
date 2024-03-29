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
              <div class='containerSubject'>
                <font-awesome-icon icon='folder-open' />
                {{ getBoardName() }} 게시물 ({{ numberWithCommas(topicsCount) }})
              </div>
              <div class='indexTopicList'>
                <div
                  class='item'
                  v-for='(item, index) in topics' :key='index'>
                  <div class='image' @click='move(item)'>
                    <img :src='item.imageUrl ? "https://hawawa.co.kr/img/thumb/" + item.imageUrl : (item.profile ? "https://hawawa.co.kr/profile/" + item.profile : "/default.png")'>
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
              </div>
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
  .indexTopicList {
    display: flex;
    flex-direction: column;
  }
  .indexTopicList .item {
    display: flex;
    margin-bottom: .5rem;
    border: 1px solid #EEE;
    background: #FFF;
  }
  .indexTopicList .item:hover {
    background: #FAFAFA;
    cursor: pointer;
  }
  .indexTopicList .item .image {
    display: flex;
    flex-direction: column;
  }
  .indexTopicList .item .image img {
    width: 3.5rem;
    height: 3.5rem;
    margin: .25rem;
    border-radius: .2rem;
  }
  .indexTopicList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .indexTopicList .item .info .subject {
    color: #25c6ff;
    font-size: .8rem;
    font-weight: bold;
  }
  .indexTopicList .item .info .subject span.board {
    padding: 0 .5rem;
    background: #29313D;
    border-radius: 500rem;
    color: #FFF;
  }
  .indexTopicList .item .info .subject span.star img {
    width: 16px;
    height: 16px;
  }
  .indexTopicList .item .info .subject span.category,
  .indexTopicList .item .info .subject span.newest,
  .indexTopicList .item .info .subject span.posts {
    margin-left: .1rem;
    padding: 0 .25rem;
    background: #25c6ff;
    border-radius: .1rem;
    color: #FFF;
    font-size: .7rem;
    font-weight: normal;
  }
  .indexTopicList .item .info .subject span.category {
    margin-left: 0;
    margin-right: .1rem;
    background: #29313D;
  }
  .indexTopicList .item .info .subject span.posts { background: #999 }
  .indexTopicList .item .info .regdate {
    margin-top: .25rem;
    padding: 0 .5rem;
    background: #F5F5F5;
    border-radius: 500rem;
    color: #35495E;
    font-size: .7rem;
    align-self: flex-start;
  }
</style>