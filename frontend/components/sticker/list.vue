<template>
  <div>
    <StickerView
      :id='id'
      :sticker='sticker'
      v-on:close='close'
      v-if='id > 0' />
    <div class='AD hidden-mobile'>
      <iframe src='/ad.html' />
    </div>
    <div class='AD hidden-desktop'>
      <iframe src='/ad-mobile.html' />
    </div>
    <el-alert
      title='현재 스티커 등록 기능은 개발중에 있습니다. 또한, 스티커 이름이 숫자로 되어있는 것은 이름 미상입니다. 이름을 아시는 분은 건의 게시판으로 알려주세요!'
      type='error'
      :closable='false' />
    <div class='marginTop'>
      <el-radio-group v-model='tags' size='small'>
        <el-radio-button label='전체' />
        <el-radio-button label='연예' />
        <el-radio-button label='애니' />
        <el-radio-button label='게임' />
        <el-radio-button label='기타' />
      </el-radio-group>
    </div>
    <div class='containerSubject marginTop'>
      <font-awesome-icon icon='cart-arrow-down' />
      스티커샵 ({{ numberWithCommas(count) }})
      <div class='stickerPointInfo'>
        <font-awesome-icon icon='gift' />
        <span class='bold'>{{ numberWithCommas($store.state.user.point) }}</span>
      </div>
    </div>
    <div class='stickerList'>
      <div
        class='item'
        @click='view(item)'
        v-for='(item, index) in stickers' :key='index'>
        <div class='image'>
          <img :src='`https://hawawa.co.kr/sticker/${item.id}/1.${item.ext}`'>
        </div>
        <div class='info'>
          <div class='name'>{{ item.name }}</div>
          <div class='price'>
            <font-awesome-icon icon='gift' />
            {{ numberWithCommas(item.price) }}
          </div>
        </div>
      </div>
    </div>
    <el-pagination
      class='marginVertical'
      @current-change='currentChange'
      :current-page='page'
      :page-size='20'
      layout='prev, pager, next'
      :total='count' />
  </div>
</template>

<script>
  import Library from '~/assets/lib.js'
  import StickerView from '~/components/sticker/view.vue'
  
  export default {
    components: { StickerView },
    data() {
      return {
        id: 0,
        tags: '전체',
        sticker: {},
        stickers: [],
        count: 0,
        page: 1
      }
    },
    watch: {
      tags: function() {
        this.page = 1
        this.getData()
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      getData: async function() {
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post(
          '/api/sticker/list',
          { page: this.page - 1, tags: this.tags }
        )
        this.stickers = data.stickers
        this.count = data.count
        this.$store.commit('setLoading')
      },
      view(item) {
        this.id = item.id
        this.sticker = item
      },
      close() {
        this.id = 0
        this.sticker = {}
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
  /* Sticker Point Infomation */
  .stickerPointInfo {
    margin-top: .3rem;
    padding: .1rem .5rem;
    border-radius: 500rem;
    background: #EAEAEA;
    color: #29313D;
    font-size: .75rem;
    float: right;
  }
  .stickerPointInfo span.bold { font-weight: bold }

  /* Sticker List */
  .stickerList .item {
    display: inline-block;
    margin: .5rem;
    border-bottom: 1px solid #F5F5F5;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, .5);
  }
  .stickerList .item:hover {
    background: rgba(245, 245, 245, .5);
    cursor: pointer;
  }
  .stickerList .item .image img {
    width: 100px;
    height: 100px;
    margin: .25rem;
    margin-bottom: 0;
    border-radius: .5rem;
  }
  .stickerList .item .info { padding-bottom: .25rem }
  .stickerList .item .info .name {
    color: #25c6ff;
    font-size: .8rem;
    font-weight: bold;
    text-align: center;
  }
  .stickerList .item .info .price {
    width: fit-content;
    margin: 0 auto;
    padding: 0 .5rem .1rem .5rem;
    border-radius: 500rem;
    background: #29313D;
    color: #FFF;
    font-size: .8rem;
    text-align: center;
  }
</style>