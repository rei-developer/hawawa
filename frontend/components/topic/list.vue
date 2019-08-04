<template>
  <div>
    <div class='AD hidden-mobile'>
      <iframe src='/ad.html' />
    </div>
    <div class='AD hidden-desktop'>
      <iframe src='/ad-mobile.html' />
    </div>
    <div>
      <nuxt-link :to='`/b/${domain}`'>
        <el-button type='info' size='small' @click='forceUpdate'>목록</el-button>
      </nuxt-link>
      <nuxt-link :to='`/b/${domain}/write`' v-if='$store.state.user.isLogged && domain !== "all" && domain !== "best"'>
        <el-button class='floatRight' type='primary' size='small'>
          <font-awesome-icon icon='pencil-alt' />
          글 작성
        </el-button>
      </nuxt-link>
    </div>
    <div class='marginTop' v-if='categories.length > 0'>
      <el-radio-group v-model='category' size='small'>
        <el-radio-button
          :label='item.name'
          v-for='(item, index) in categories' :key='index' />
      </el-radio-group>
    </div>
    <div class='containerSubject marginTop'>
      <font-awesome-icon icon='pencil-alt' />
      {{ getBoardName() }} ({{ numberWithCommas(counts.count) }})
      <div class='topicCounts'>
        어제 <span class='bold'>{{ counts.yesterday }}</span>
        <span class='divide'>|</span>
        오늘 <span class='bold'>{{ counts.today }}</span>
        <span class='divide'>|</span>
        평균 <span class='bold'>{{ counts.regen }}분</span>
      </div>
    </div>
    <div class='topicList'>
      <div
        :class='id == item.id ? "item view" : "item odd"'
        v-for='item in notices' :key='item.id'>
        <div class='image' @click='move(item)'>
          <img :src='item.imageUrl ? "https://hawawa.co.kr/img/thumb/" + item.imageUrl : "/default.png"'>
        </div>
        <div class='info' @click='move(item)'>
          <div class='subject'>
            <span class='board' v-if='domain === "all" || domain === "best"'>{{ getBoardName(item.boardDomain) }}</span>
            <span class='star' v-if='item.isBest > 0'>
              <img :src='item.isBest > 1 ? "/star.svg" : "/burn.svg"'>
            </span>
            <span class='view'>
              <span class='notice'>NOTICE</span>
              <span class='category' v-if='item.category !== ""'>{{ item.category }}</span>
              {{ item.title }}
              <span class='newest' v-if='$moment().diff($moment(item.created), "days") <= 1'>NEW</span>
              <span class='posts' v-if='item.postsCount > 0'>{{ numberWithCommas(item.postsCount) }}</span>
              <span class='image' v-if='item.isImage > 0'>
                <font-awesome-icon icon='image' />
              </span>
            </span>
          </div>
          <div class='author'>
            <img :src='`/level/${item.level}.png`'>
            <img class='icon' :src='`https://hawawa.co.kr/icon/${item.icon}`' v-if='item.icon !== ""'>
            <span class='userTitle' v-if='item.userTitle'>{{ item.userTitle }}</span>
            {{ item.author }}
            <span class='event'>
              <font-awesome-icon icon='clock' />
              {{ $moment(item.created).format('YYYY/MM/DD HH:mm:ss') }}
            </span>
            <span class='event' v-if='item.hits > 0'>
              <font-awesome-icon icon='eye' />
              {{ numberWithCommas(item.hits) }}
            </span>
            <span class='event' v-if='item.likes > 0'>
              <font-awesome-icon icon='heart' />
              +{{ numberWithCommas(item.likes) }}
            </span>
          </div>
        </div>
        <div class='unlock' @click='unlockHandler(item.id)' v-if='$store.state.user.isAdmin > 0'>
          <font-awesome-icon icon='unlock-alt' />
        </div>
      </div>
      <div
        :class='id == item.id ? "item view" : (index % 2 === 0 ? "item" : "item odd")'
        v-for='(item, index) in topics' :key='index'>
        <div class='image' @click='move(item)'>
          <img :src='item.imageUrl ? "https://hawawa.co.kr/img/thumb/" + item.imageUrl : "/default.png"'>
        </div>
        <div class='info' @click='move(item)'>
          <div class='subject'>
            <span class='board' v-if='domain === "all" || domain === "best"'>{{ getBoardName(item.boardDomain) }}</span>
            <span class='star' v-if='item.isBest > 0'>
              <img :src='item.isBest > 1 ? "/star.svg" : "/burn.svg"'>
            </span>
            <span :class='id == item.id ? "view" : ""'>
              <span class='category' v-if='item.category !== ""'>{{ item.category }}</span>
              {{ item.title }}
              <span class='newest' v-if='$moment().diff($moment(item.created), "days") <= 1'>NEW</span>
              <span class='posts' v-if='item.postsCount > 0'>{{ item.postsCount }}</span>
              <span v-if='item.isImage > 0'>
                <font-awesome-icon icon='image' />
              </span>
            </span>
          </div>
          <div class='author'>
            <img :src='`/level/${item.level}.png`'>
            <img class='icon' :src='`https://hawawa.co.kr/icon/${item.icon}`' v-if='item.icon !== ""'>
            <span class='userTitle' v-if='item.userTitle'>{{ item.userTitle }}</span>
            {{ item.author }}
            <span class='event'>
              <font-awesome-icon icon='clock' />
              {{ $moment(item.created).format('YYYY/MM/DD HH:mm:ss') }}
            </span>
            <span class='event' v-if='item.hits > 0'>
              <font-awesome-icon icon='eye' />
              {{ numberWithCommas(item.hits) }}
            </span>
            <span class='event' v-if='item.likes > 0'>
              <font-awesome-icon icon='heart' />
              +{{ numberWithCommas(item.likes) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class='marginVertical'>
      <el-input class='input-with-select' size='medium' placeholder='검색어 (2글자 이상)' v-model='searches.text'>
        <el-select v-model='searches.select' slot='prepend'>
          <el-option label='제목' :value='0' />
          <el-option label='본문' :value='1' />
          <el-option label='전체' :value='2' />
          <el-option label='작성자' :value='3' />
        </el-select>
        <el-button slot='append' @click='search'>
          <font-awesome-icon icon='search' />
          검색
        </el-button>
      </el-input>
    </div>
    <el-pagination
      class='marginBottom'
      @current-change='currentChange'
      :current-page='page'
      :page-size='20'
      layout='prev, pager, next'
      :total='counts.count' />
    <div class='marginBottom'>
      <nuxt-link :to='`/b/${domain}`'>
        <el-button type='info' size='small' @click='forceUpdate'>목록</el-button>
      </nuxt-link>
      <nuxt-link :to='`/b/${domain}/write`' v-if='$store.state.user.isLogged && domain !== "all" && domain !== "best"'>
        <el-button class='floatRight' type='primary' size='small'>
          <font-awesome-icon icon='pencil-alt' />
          글 작성
        </el-button>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
  import Library from '~/assets/lib.js'
  
  export default {
    props: ['id', 'purePage'],
    data() {
      return {
        domain: 'all',
        category: '(없음)',
        categories: [],
        notices: [],
        topics: [],
        counts: {
          count: 0,
          yesterday: 0,
          today: 0,
          regen: 0
        },
        searches: {
          text: '',
          select: 0
        },
        page: Number(this.purePage)
      }
    },
    watch: {
      '$store.state.forceUpdate': function() {
        this.getData(true)
        this.getCount()
      },
      category: function() {
        this.page = 1
        this.getData(true)
        this.getCount()
      }
    },
    mounted() {
      this.domain = this.$route.params.domain
      this.category = this.$route.query.category || '(없음)'
      this.getData()
      this.getCount()
    },
    methods: {
      getBoardName(domain = this.domain) {
        return Library.getBoardName(domain)
      },
      getData: async function(forceUpdate = false) {
        this.$store.commit('setLoading', true)
        if (forceUpdate) this.page = 1
        const data = await this.$axios.$post(
          '/api/topic/list',
          {
            domain: this.domain,
            category: this.category === '(없음)' ? '' : this.category,
            searches: this.searches,
            page: this.page - 1
          }
        )
        this.categories = []
        this.notices = []
        if (data.categories) this.categories = data.categories
        if (data.notices) this.notices = data.notices
        this.topics = data.topics
        this.counts.count = data.count
        this.$store.commit('setLoading')
      },
      getCount: async function() {
        const data = await this.$axios.$get(`/api/topic/count/${this.domain}`)
        if (data.status === 'fail') return
        this.counts.yesterday = this.numberWithCommas(data.yesterday - data.today)
        this.counts.today = this.numberWithCommas(data.today)
        this.counts.regen = data.regen ? (data.regen).toFixed(1) : 0
      },
      unlockHandler: async function(id) {
        if (id < 1 || !this.$store.state.user.admin < 1) return
        this.$confirm('정말로 공지사항을 해제하시겠습니까?', '알림', {
          confirmButtonText: '해제',
          cancelButtonText: '취소'
        }).then(() => {
          this.unlock(id)
        })
      },
      unlock: async function(id) {
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$patch(
          '/api/topic/edit/notice',
          { id },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('공지사항을 해제했습니다.')
        this.forceUpdate()
        this.$store.commit('setLoading')
      },
      search: async function() {
        if (this.searches.text === '') return this.$message.error('검색어를 입력하세요.')
        if (this.searches.text.length < 2) return this.$message.error('검색어는 두 글자 이상 입력하세요.')
        this.page = 1
        this.getData(true)
        this.getCount()
      },
      move(item) {
        this.$router.push({ path: `/b/${this.domain}/${item.id}?page=${this.page}${this.category !== '(없음)' ? '&category=' + this.category : ''}` })
      },
      currentChange(page) {
        this.page = page
        this.getData()
        this.getCount()
      },
      forceUpdate() {
        this.$store.commit('forceUpdate')
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  /* Topic Counts */
  .topicCounts {
    margin-top: .3rem;
    padding: .1rem .5rem;
    border-radius: 500rem;
    background: #EAEAEA;
    color: #29313D;
    font-size: .75rem;
    float: right;
  }
  .topicCounts span.bold { font-weight: bold }
  .topicCounts span.divide {
    color: #CCC;
    font-size: .5rem;
  }

  /* Topic List */
  .topicList {
    display: flex;
    flex-direction: column;
    border: 1px solid #EEE;
  }
  .topicList .item {
    display: flex;
    border-bottom: 1px solid #EEE;
    background: #FFF;
  }
  .topicList .item.odd,
  .topicList .item.view { background: #FBFBFB }
  .topicList .item.view { border-left: .3rem solid #25c6ff }
  .topicList .item:hover,
  .topicList .item.view:hover {
    background: #F0F0F0;
    cursor: pointer;
  }
  .topicList .item .image {
    display: flex;
    flex-direction: column;
  }
  .topicList .item .image img {
    width: 3.5rem;
    height: 3.5rem;
    margin: .25rem;
    border-radius: .2rem;
    background: #FFF;
  }
  .topicList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .topicList .item .info .subject {
    color: #333;
    font-size: .8rem;
  }
  .topicList .item .info .subject span.board {
    padding: 0 .5rem;
    border-radius: 500rem;
    background: #29313D;
    color: #FFF;
    font-weight: bold;
  }
  .topicList .item .info .subject span.star img {
    width: 16px;
    height: 16px;
  }
  .topicList .item .info .subject span.notice,
  .topicList .item .info .subject span.category,
  .topicList .item .info .subject span.newest,
  .topicList .item .info .subject span.posts {
    padding: 0 .25rem;
    border-radius: .1rem;
    background: #ED1C24;
    color: #FFF;
    font-size: .7rem;
  }
  .topicList .item .info .subject span.category {
    background: #EAEAEA;
    color: #29313D;
  }
  .topicList .item .info .subject span.newest { background: #25c6ff }
  .topicList .item .info .subject span.posts { background: #999 }
  .topicList .item .info .subject span.image { color: #25c6ff }
  .topicList .item .info .subject span.view {
    color: #25c6ff;
    font-weight: bold;
  }
  .topicList .item .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .topicList .item .info .author img.icon {
    width: 16px;
    height: 16px;
    vertical-align: text-top;
  }
  .topicList .item .info .author span.userTitle {
    padding: 0 .25rem;
    background: #29313D;
    border-radius: .25rem;
    color: #FFF;
    font-size: .7rem;
  }
  .topicList .item .info .author span.event {
    margin-left: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
  .topicList .item .unlock {
    display: flex;
    flex-direction: column;
    width: 3rem;
    background: #29313D;
    color: #FFF;
    font-size: 1rem;
    justify-content: center;
    align-items: center;
  }
  .topicList .item .unlock:hover {
    opacity: .8;
    cursor: pointer;
  }
</style>