<template>
  <div>
    <div v-if='postsCount > 0'>
      <div class='containerSubject marginTop'>
        <font-awesome-icon icon='comment-dots' />
        댓글 ({{ numberWithCommas(postsCount) }})
      </div>
      <div class='postList'>
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
                <img :src='`/level/${item.level}.png`'>
                <img class='icon' :src='`https://hawawa.co.kr/icon/${item.icon}`' v-if='item.icon !== ""'>
                <span class='userTitle' v-if='item.userTitle'>{{ item.userTitle }}</span>
                {{ item.author }}
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
                <span :class='item.userId === topic.userId ? "writer" : ""' v-html='item.content' />
              </div>
            </div>
            <el-dropdown class='more' trigger='click' @command='handleCommand' v-if='$store.state.user.isLogged'>
              <span class='el-dropdown-link'>
                <font-awesome-icon icon='ellipsis-h' />
              </span>
              <el-dropdown-menu slot='dropdown'>
                <el-dropdown-item :command='["reply", item.id]'>댓글</el-dropdown-item>
                <el-dropdown-item :command='["votes", item.id, true]' v-if='item.userId !== $store.state.user.id'>추천</el-dropdown-item>
                <el-dropdown-item :command='["votes", item.id, false]' v-if='item.userId !== $store.state.user.id'>비추천</el-dropdown-item>
                <el-dropdown-item :command='["update", item]' v-if='$store.state.user.isAdmin > 0 || item.userId === $store.state.user.id'>수정</el-dropdown-item>
                <el-dropdown-item :command='["remove", item.id]' v-if='$store.state.user.isAdmin > 0 || item.userId === $store.state.user.id'>삭제</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class='postReplyWrite' v-if='item.id === tempPostReplyId'>
            <PostWrite
              :id='id'
              :pureContent='""'
              :author='item.author'
              :topicUserId='topic.userId'
              :postUserId='item.userId'
              :postRootId='item.postRootId || item.id'
              :postParentId='item.id' />
          </div>
          <div class='postUpdate' v-if='item.id === tempPostUpdateId'>
            <PostWrite
              :id='item.id'
              :edit='true'
              :pureContent='item.content.replace(/<br>+/g, "\n")' />
          </div>
        </div>
      </div>
    </div>
    <el-button
      class='newestPost'
      type='info'
      v-if='newPostsCount > 0'
      @click='getData'
      round>
      <font-awesome-icon class='fa-spin' icon='sync-alt' />
      새 댓글 불러오기 ({{ numberWithCommas(newPostsCount) }})
    </el-button>
    <div class='postBox'>
      <PostWrite
        :id='id'
        :pureContent='""'
        :topicUserId='topic.userId' />
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
  import PostWrite from '~/components/post/write.vue'
  
  export default {
    components: { PostWrite },
    props: ['id', 'topic'],
    data() {
      return {
        posts: [],
        postsCount: 0,
        postsPage: 1,
        newPostsCount: 0,
        viewPostId: 0,
        tempPostReplyId: 0,
        tempPostUpdateId: 0,
        loading: false
      }
    },
    watch: {
      '$store.state.forceUpdate': function() {
        this.getData()
      }
    },
    beforeMount() {
      this.$socket.on('newPost', () => {
        this.playSound('https://soundbible.com/mp3/Blop-Mark_DiAngelo-79054334.mp3')
        this.newPostsCount++
      })
      this.$socket.on('votePost', data => {
        this.posts = this.posts.map(post => {
          if (post.id === data.postId) {
            post.likes = data.likes
            post.hates = data.hates
          }
          return post
        })
      })
    },
    mounted() {
      this.viewPostId = this.$route.query.postId
      this.getData()
    },
    methods: {
      getData: async function() {
        if (this.loading) return
        this.loading = true
        const data = await this.$axios.$post('/api/topic/list/post', { id: this.id, page: this.postsPage - 1 })
        if (data.status === 'fail') {
          this.loading = false
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.postsCount = data.count
        this.newPostsCount = 0
        this.tempPostReplyId = 0
        this.tempPostUpdateId = 0
        if (data.posts) this.posts = data.posts
        if (this.viewPostId > 0) this.scrollTo()
        this.loading = false
      },
      handleCommand(command) {
        switch (command[0]) {
          case 'reply':
            this.reply(command[1])
            break
          case 'votes':
            this.votes(command[1], command[2])
            break
          case 'update':
            this.update(command[1])
            break
          case 'remove':
            this.removeHandler(command[1])
            break
        }
      },
      reply(id) {
        this.tempPostReplyId = id
        this.tempPostUpdateId = 0
      },
      votes: async function(id, flag) {
        if (id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post(
          '/api/topic/vote/post',
          { id, likes: flag },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message('투표했습니다.')
        this.$store.commit('setLoading')
      },
      update(item) {
        if (item.id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        this.tempPostReplyId = 0
        this.tempPostUpdateId = item.id
      },
      removeHandler: async function(id) {
        if (id < 1) return
        this.$confirm('정말로 삭제하시겠습니까?', '알림', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소'
        }).then(() => {
          this.remove(id)
        })
      },
      remove: async function(id) {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$delete(
          '/api/topic/delete/post',
          {
            data: { id, page: this.postsPage },
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
      scrollTo() {
        const el = this.posts.find(p => p.id == this.viewPostId)
        if (!el) return
        this.$nextTick(() => {
          window.scrollTo({
            top: this.$refs[`post${this.viewPostId}`][0].offsetTop,
            behavior: 'smooth'
          })
        })
      },
      playSound(sound) {
        if (!sound) return
        const audio = new Audio(sound)
        audio.play()
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  /* Newest Post */
  .newestPost { margin-top: 1rem }

  /* Post Box */
  .postBox {
    margin-top: 1rem;
    padding: .5rem;
    border: 1px solid #EEE;
    background: #FFF;
  }
  .postReplyWrite,
  .postUpdate {
    padding: .5rem;
    border-bottom: 1px solid #EEE;
    background: #FFF;
  }

  /* Post List */
  .postList {
    display: flex;
    margin-top: 1rem;
    border: 1px solid #EEE;
    flex-direction: column;
  }
  .postList .item {
    display: flex;
    border-bottom: 1px solid #EEE;
    background: #FFF;
  }
  .postList .item.view {
    border-left: .25rem solid #29313D;
  }
  .postList .item.view,
  .postList .item.reply {
    background: #FBFBFB;
  }
  .postList .item .reply {
    display: flex;
    flex-direction: column;
    margin-left: .5rem;
    padding: .25rem;
    color: #CCC;
    justify-content: center;
    align-items: center;
  }
  .postList .item .image {
    display: flex;
    flex-direction: column;
    padding: .25rem;
    justify-content: center;
    align-items: center;
  }
  .postList .item .image img {
    width: 3rem;
    height: 3rem;
    margin: .25rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
  }
  .postList .item .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: .25rem;
    padding-left: 0;
  }
  .postList .item .info .author {
    color: #333;
    font-size: .8rem;
    font-weight: bold;
  }
  .postList .item .info .author span.best {
    margin-right: .1rem;
    padding: 0 .25rem;
    background: #ED1C24;
    border-radius: .1rem;
    color: #FFF;
    font-size: .7rem;
  }
  .postList .item .info .author img.icon {
    width: 16px;
    height: 16px;
    vertical-align: text-top;
  }
  .postList .item .info .author span.userTitle {
    padding: 0 .25rem;
    background: #29313D;
    border-radius: .25rem;
    color: #FFF;
    font-size: .7rem;
  }
  .postList .item .info .author span.event {
    margin-left: .25rem;
    color: #999;
    font-size: .7rem;
    font-weight: normal;
  }
  .postList .item .info .desciption {
    color: #333;
    font-size: .8rem;
  }
  .postList .item .info .desciption .sticker img {
    width: 100px;
    height: 100px;
    border-radius: .25rem;
  }
  .postList .item .info .desciption span.writer {
    color: #25c6ff;
    font-weight: bold;
  }
  .postList .item .info .desciption span.tagUser {
    margin-right: .25rem;
    padding: 0 .5rem;
    background: #29313D;
    border-radius: 500rem;
    color: #FFF;
    font-size: .75rem;
  }
  .postList .item .more {
    display: flex;
    flex-direction: column;
    width: 2rem;
    background: #F5F5F5;
    justify-content: center;
    align-items: center;
  }
  .postList .item .more:hover {
    background: #FAFAFA;
    cursor: pointer;
  }
</style>