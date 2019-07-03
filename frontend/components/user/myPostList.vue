<template>
  <div>
    <div class='AD hidden-mobile'>
      <iframe src='/ad.html' />
    </div>
    <div class='AD hidden-desktop'>
      <iframe src='/ad-mobile.html' />
    </div>
    <div class='containerSubject marginTop'>
      <font-awesome-icon icon='comment-dots' />
      내 작성 댓글 ({{ numberWithCommas(postsCount) }})
    </div>
    <div class='myPostList'>
      <div
        :ref='`post${item.id}`'
        v-for='(item, index) in posts' :key='index'>
        <div :class='"item" + (item.tagUserId ? " reply" : "") + (item.id == viewPostId ? " view" : "")'>
          <div class='reply' v-if='item.tagUserId'>
            <font-awesome-icon icon='chevron-right' />
          </div>
          <div class='image'>
            <img :src='item.profile ? "https://hawawa.co.kr/profile/" + item.profile : "/profile.png"'>
          </div>
          <div class='info'>
            <div class='author'>
              <span class='best' v-if='item.likes >= 1'>BEST</span>
              <span class='event'>
                <font-awesome-icon icon='history' />
                {{ $moment(item.updated).fromNow() }}
              </span>
              <span class='event' v-if='item.likes > 0'>
                <font-awesome-icon icon='heart' />
                +{{ numberWithCommas(item.likes) }}
              </span>
              <span class='event' v-if='item.hates > 0'>
                <font-awesome-icon icon='heart-broken' />
                -{{ numberWithCommas(item.hates) }}
              </span>
            </div>
            <div class='desciption'>
              <span class='tagUser' v-if='item.tagUserId'>
                <font-awesome-icon icon='at' />
                {{ item.tagAuthor }}
              </span>
              <div class='sticker' v-if='item.stickerId > 0'>
                <img :src='`https://hawawa.co.kr/sticker/${item.stickerId}/${item.stickerSelect}`'>
              </div>
              <span v-html='item.content' />
            </div>
          </div>
          <div class='trash' @click='remove(item.id)'>
            <font-awesome-icon icon='trash' />
          </div>
        </div>
      </div>
    </div>
    <div class='marginVertical'>
      <el-pagination
        layout='prev, pager, next'
        :page-size='20'
        :total='postsCount'
        :current-page='postsPage'
        @current-change='currentChange' />
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        posts: [],
        postsCount: 0,
        postsPage: 1,
        loading: false
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      getData: async function() {
        if (this.loading) return
        this.loading = true
        const { data } = await axios.post(
          '/api/topic/list/post/me',
          { userId: this.$store.state.user.id, page: this.postsPage - 1 }
        )
        if (data.status === 'fail') {
          this.loading = false
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        if (data.posts) this.posts = data.posts
        this.postsCount = data.count
        this.loading = false
      },
      remove: async function(id) {
        if (id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const { data } = await axios.delete(
          '/api/topic/delete/post',
          {
            data: { id },
            headers: { 'x-access-token': token }
          }
        )
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.posts = this.posts.filter(post => post.id !== id)
        --this.postsCount
        this.$message.success('댓글 삭제 성공!')
        this.$store.commit('setLoading')
      },
      currentChange(page) {
        this.postsPage = page
        this.getData()
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  .myPostList {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
  }
  .myPostList .item {
    display: flex;
    border-bottom: 1px solid #F5F5F5;
    background: rgba(255, 255, 255, .5);
  }
  .myPostList .item .image {
    display: flex;
    flex-direction: column;
    padding: .25rem;
    justify-content: center;
    align-items: center;
  }
  .myPostList .item .image img {
    width: 3rem;
    height: 3rem;
    margin: .25rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
  }
  .myPostList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .myPostList .item .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .myPostList .item .info .author span.best {
    margin-right: .1rem;
    padding: 0 .25rem;
    background: #ED1C24;
    border-radius: .1rem;
    color: #FFF;
    font-size: .7rem;
  }
  .myPostList .item .info .author span.event {
    margin-right: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
  .myPostList .item .info .desciption {
    color: #333;
    font-size: .8rem;
  }
  .myPostList .item .info .desciption .sticker img {
    width: 100px;
    height: 100px;
    border-radius: .25rem;
  }
  .myPostList .item .info .desciption span.tagUser {
    margin-right: .25rem;
    padding: 0 .5rem;
    background: #29313D;
    border-radius: 500rem;
    color: #FFF;
    font-size: .75rem;
  }
  .myPostList .item .trash {
    display: flex;
    flex-direction: column;
    width: 3rem;
    background: #ED1C24;
    color: #FFF;
    font-size: 1rem;
    justify-content: center;
    align-items: center;
  }
  .myPostList .item .trash:hover {
    opacity: .8;
    cursor: pointer;
  }
</style>