<template>
  <div>
    <div class='AD hidden-mobile'>
      <iframe src='/ad.html' />
    </div>
    <div class='AD hidden-desktop'>
      <iframe src='/ad-mobile.html' />
    </div>
    <div class='containerSubject marginTop'>
      <font-awesome-icon icon='pencil-alt' />
      내 작성글 ({{ numberWithCommas(topicsCount) }})
    </div>
    <div class='myTopicList'>
      <div
        :class='id == item.id ? "item view" : (index % 2 === 0 ? "item" : "item odd")'
        v-for='(item, index) in topics' :key='index'>
        <div class='image' @click='move(item)'>
          <img :src='item.imageUrl ? "https://hawawa.co.kr/img/thumb/" + item.imageUrl : "/default.png"'>
        </div>
        <div class='info' @click='move(item)'>
          <div class='subject'>
            <span class='board'>{{ getBoardName(item.boardDomain) }}</span>
            <span class='star' v-if='item.isBest > 0'>
              <img :src='item.isBest > 1 ? "/star.svg" : "/burn.svg"'>
            </span>
            <span :class='id == item.id ? "view" : ""'>
              <span class='category' v-if='item.category !== ""'>{{ item.category }}</span>
              {{ item.title }}
              <span class='newest' v-if='$moment().diff($moment(item.created), "days") <= 1'>NEW</span>
              <span class='posts' v-if='item.postsCount > 0'>{{ numberWithCommas(item.postsCount) }}</span>
              <span v-if='item.isImage > 0'>
                <font-awesome-icon icon='image' />
              </span>
            </span>
          </div>
          <div class='author'>
            <span>
              <font-awesome-icon icon='clock' />
              {{ $moment(item.created).format('YYYY/MM/DD HH:mm:ss') }}
            </span>
            <span v-if='item.hits > 0'>
              <font-awesome-icon icon='eye' />
              {{ numberWithCommas(item.hits) }}
            </span>
            <span v-if='item.likes > 0'>
              <font-awesome-icon icon='heart' />
              +{{ numberWithCommas(item.likes) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <el-pagination
      class='marginVertical'
      layout='prev, pager, next'
      :page-size='20'
      :total='topicsCount'
      :current-page='page'
      @current-change='currentChange' />
  </div>
</template>

<script>
  import Library from '~/assets/lib.js'
  
  export default {
    props: ['id', 'page'],
    data() {
      return {
        boardName: '',
        topics: [],
        topicsCount: 0
      }
    },
    mounted() {
      this.getData()
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
          { page: this.page - 1, userId: this.$store.state.user.id }
        )
        this.topics = data.topics
        this.topicsCount = data.count
        this.$store.commit('setLoading')
        return data
      },
      move(item) {
        this.$router.push({ path: `/b/${item.boardDomain}/${item.id}` })
      },
      currentChange(page) {
        this.page = page
        this.getData()
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  .myTopicList {
    display: flex;
    flex-direction: column;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
  }
  .myTopicList .item {
    display: flex;
    border-bottom: 1px solid #F5F5F5;
    background: rgba(255, 255, 255, .5);
  }
  .myTopicList .item:hover {
    background: rgba(245, 245, 245, .5);
    cursor: pointer;
  }
  .myTopicList .item.odd,
  .myTopicList .item.view { background: rgba(245, 245, 245, .5) }
  .myTopicList .item.view { border-left: .25rem solid #29313D }
  .myTopicList .item .image {
    display: flex;
    flex-direction: column;
  }
  .myTopicList .item .image img {
    width: 3.5rem;
    height: 3.5rem;
    margin: .25rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: .25rem;
    background: #FFF;
  }
  .myTopicList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .myTopicList .item .info .subject {
    color: #333;
    font-size: .8rem;
  }
  .myTopicList .item .info .subject span.board {
    padding: 0 .5rem;
    border-radius: 500rem;
    background: #29313D;
    color: #FFF;
    font-weight: bold;
  }
  .myTopicList .item .info .subject span.star img {
    width: 16px;
    height: 16px;
  }
  .myTopicList .item .info .subject span.notice,
  .myTopicList .item .info .subject span.category,
  .myTopicList .item .info .subject span.newest,
  .myTopicList .item .info .subject span.posts {
    margin-right: .1rem;
    padding: 0 .25rem;
    border-radius: .1rem;
    background: #ED1C24;
    color: #FFF;
    font-size: .7rem;
  }
  .myTopicList .item .info .subject span.category { background: #29313D }
  .myTopicList .item .info .subject span.newest { background: #409EFF }
  .myTopicList .item .info .subject span.posts { background: #999 }
  .myTopicList .item .info .subject span.image { color: #409EFF }
  .myTopicList .item .info .subject span.view {
    color: #409EFF;
    font-weight: bold;
  }
  .myTopicList .item .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .myTopicList .item .info .author span {
    margin-right: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
</style>