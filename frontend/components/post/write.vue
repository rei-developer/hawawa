<template>
  <div>
    <StickerInventory
      v-on:use='use'
      v-on:close='close'
      v-if='!stickers.hide' />
    <div v-if='$store.state.user.isLogged'>
      <div class='postHeader' v-if='author'>
        <div class='author'>
          <font-awesome-icon icon='at' />
          {{ author }}
        </div>
        <div class='label'>에게 대댓글 작성</div>
      </div>
      <div class='postWrite'>
        <div class='item'>
          <div class='profile'>
            <img :src='$store.state.user.profileImageUrl'>
          </div>
          <div class='inputbox'>
            <textarea
              rows='3'
              placeholder='이곳에 내용을 입력하세요.'
              v-model='content' />
          </div>
          <div class='send'>
            <div class='sticker' @click='stickers.hide = false'>스티커</div>
            <div class='submit' @click='submit'>
              <span v-if='loading'>
                <font-awesome-icon class='fa-spin' icon='circle-notch' />
              </span>
              <span v-else>
                <font-awesome-icon icon='pencil-alt' />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class='postFooter'>
        <div class='sticker'
          @click='clear'
          v-if='stickers.sticker'>
          <div class='item'>
            <div class='image'>
              <img :src='`https://hawawa.co.kr/sticker/${stickers.sticker.id}/${stickers.select}.${stickers.sticker.ext}`'>
            </div>
            {{ stickers.sticker.name }}
            <div class='remove'>
              <font-awesome-icon icon='times' />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <nuxt-link to='/signin'>
        <div class='signIn'>계정이 있으시다면 로그인하세요</div>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
  import StickerInventory from '~/components/sticker/inventory.vue'
  import axios from 'axios'

  export default {
    components: { StickerInventory },
    props: ['id', 'edit', 'pureContent', 'author', 'topicUserId', 'postUserId', 'postRootId', 'postParentId'],
    data() {
      return {
        content: this.pureContent,
        stickers: {
          sticker: null,
          select: 0,
          hide: true
        },
        loading: false
      }
    },
    methods: {
      submit: async function() {
        if (this.loading) return
        if (!this.stickers.sticker && this.content === '') return this.$message.error('내용을 입력하세요.')
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.loading = true
        let result
        if (this.edit) {
          const { data } = await axios.patch(
            '/api/topic/edit/post',
            {
              id: this.id,
              content: this.content,
              sticker: {
                id: this.stickers.sticker ? this.stickers.sticker.id : 0,
                select: this.stickers.sticker ? `${this.stickers.select}.${this.stickers.sticker.ext}` : ''
              }
            },
            { headers: { 'x-access-token': token } }
          )
          result = data
        } else {
          const { data } = await axios.post('/api/topic/write/post', {
            topicId: this.id,
            topicUserId: this.topicUserId,
            postUserId: this.postUserId,
            postRootId: this.postRootId,
            postParentId: this.postParentId,
            content: this.content,
            sticker: {
              id: this.stickers.sticker ? this.stickers.sticker.id : 0,
              select: this.stickers.sticker ? `${this.stickers.select}.${this.stickers.sticker.ext}` : ''
            }
          }, {
            headers: { 'x-access-token': token }
          })
          result = data
        }
        if (result.status === 'fail') {
          this.loading = false
          return this.$message.error(result.message || '오류가 발생했습니다.')
        }
        this.$store.commit('forceUpdate')
        this.content = ''
        this.clear()
        this.loading = false
      },
      close() {
        this.stickers.hide = true
      },
      clear() {
        this.stickers = {
          sticker: null,
          select: 0,
          hide: true
        }
      },
      use(item, select) {
        this.stickers = {
          sticker: item,
          select: select,
          hide: true
        }
      }
    }
  }
</script>

<style>
  /* Post Header */
  .postHeader > .author {
    display: inline-block;
    width: fit-content;
    margin-bottom: .5rem;
    padding: 0 .5rem;
    background: #29313D;
    border-radius: 500rem;
    color: #FFF;
    font-size: .75rem;
  }
  .postHeader > .label {
    display: inline-block;
    color: #29313D;
    font-size: .75rem;
    font-weight: normal;
  }

  /* Post Footer */
  .postFooter > .sticker {
    display: flex;
    flex-direction: column;
    margin-top: .5rem;
  }
  .postFooter > .sticker > .item {
    display: flex;
    width: fit-content;
    padding: .1rem;
    padding-right: .5rem;
    border-radius: 500rem;
    background: #EAEAEA;
    color: #29313D;
    font-size: .7rem;
    justify-content: center;
    align-items: center;
  }
  .postFooter > .sticker > .item:hover {
    background: #F5F5F5;
    cursor: pointer;
  }
  .postFooter > .sticker > .item  > .image {
    display: flex;
    flex-direction: column;
    margin-right: .25rem;
    padding: 0;
  }
  .postFooter > .sticker > .item  > .image img {
    width: 2rem;
    height: 2rem;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 500rem;
  }
  .postFooter > .sticker > .item  > .remove {
    display: flex;
    flex-direction: column;
    margin-left: .25rem;
  }

  /* Post Write */
  .postWrite {
    display: flex;
    flex-direction: column;
  }
  .postWrite .item {
    display: flex;
    border-bottom: 0 !important;
  }
  .postWrite .item .profile {
    display: flex;
    flex-direction: column;
    margin-right: .5rem;
    justify-content: center;
    align-items: center;
  }
  .postWrite .item .profile img {
    width: 4rem;
    height: 4rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
  }
  .postWrite .item .inputbox {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .postWrite .item .inputbox textarea {
    height: 4.5rem;
    padding: .5rem;
    border: 2px solid #CCC;
    outline: none !important;
  }
  .postWrite .item .send {
    display: flex;
    flex-direction: column;
    margin-left: .5rem;
    text-align: center;
  }
  .postWrite .item .send .sticker {
    width: 4.5rem;
    padding: .25rem 0;
    border-radius: .25rem;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    background: #EAEAEA;
    color: #29313D;
    font-size: .8rem;
  }
  .postWrite .item .send .submit {
    width: 4.5rem;
    height: 45px;
    line-height: 44px;
    border-radius: .25rem;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    background: #29313D;
    color: #FFF;
    font-size: 1.5rem;
  }
  .postWrite .item .send .sticker:hover,
  .postWrite .item .send .submit:hover {
    opacity: .8;
    cursor: pointer;
  }

  @media (max-width: 1023px) {
    .postWrite .item .profile { display: none }
  }

  /* Sign In */
  .signIn {
    width: 100%;
    padding: .5rem 0;
    border-radius: .5rem;
    color: #67C23A;
    font-size: .8rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }
  .signIn:hover {
    background: rgba(103, 194, 58, 0.1);
  }
</style>