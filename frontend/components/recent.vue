<template>
  <div>
    <div class='containerSubject'>
      <font-awesome-icon icon='star' />
      최근 인기 게시물
    </div>
    <div class='recentList'>
      <div
        class='item'
        @click='move(item.id)'
        v-for='(item, index) in topics' :key='index'>
        <span class='star' v-if='item.isBest > 0'>
          <img :src='item.isBest > 1 ? "/star.svg" : "/burn.svg"'>
        </span>
        {{ item.title }}
        <span class='posts' v-if='item.postsCount > 0'>{{ numberWithCommas(item.postsCount) }}</span>
        <div class='event'>
          <span>
            <font-awesome-icon icon='clock' />
            {{ $moment(item.created).fromNow() }}
          </span>
          <span v-if='item.likes > 0'>
            <font-awesome-icon icon='heart' />
            +{{ numberWithCommas(item.likes) }}
          </span>
        </div>
      </div>
    </div>
    <div class='ADSidebar'>
      <iframe src='/ad-sidebar.html' />
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    props: ['domain'],
    data() {
      return {
        topics: []
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      getData: async function() {
        const { data } = await axios.get('/api/topic/list/widget')
        if (!this.topics) return
        this.topics = data.map(i => {
          i.title = i.title.length > 50 ? i.title.substr(0, 50) + '...' : i.title
          i.created = this.$moment(i.created).format('YYYY/MM/DD HH:mm:ss')
          return i
        })
        return data
      },
      move(id) {
        this.$router.push({ path: `/b/all/${id}` })
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  .recentList {
    margin-bottom: 1rem;
    padding: .5em;
    border-radius: .25rem;
    background-color: #F5F5F5;
  }
  .recentList .item {
    margin-bottom: .5rem;
    padding: .25rem .5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    background-color: #FFF;
    color: #409EFF;
    font-size: .8rem;
    font-weight: bold;
  }
  .recentList .item:last-child {
    margin-bottom: 0;
  }
  .recentList .item:hover {
    background: #FAFAFA;
    color: #29313D;
    cursor: pointer;
  }
  .recentList .item span.star img {
    width: 14px;
    height: 14px;
    margin-bottom: 4px;
    vertical-align: middle;
  }
  .recentList .item span.posts {
    margin-left: .1rem;
    padding: 0 .25rem;
    background: #999;
    border-radius: .1rem;
    color: #FFF;
    font-size: .7rem;
    font-weight: normal;
  }
  .recentList .item .event span {
    margin-right: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
</style>