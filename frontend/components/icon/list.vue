<template>
  <div>
    <div class='AD hidden-mobile'>
      <iframe src='/ad.html' />
    </div>
    <div class='AD hidden-desktop'>
      <iframe src='/ad-mobile.html' />
    </div>
    <div class='containerSubject marginTop'>
      <font-awesome-icon icon='cart-arrow-down' />
      아이콘샵 ({{ numberWithCommas(count) }})
      <div class='iconshopPointInfo'>
        <font-awesome-icon icon='gift' />
        <span class='bold'>{{ numberWithCommas($store.state.user.point) }}</span>
      </div>
    </div>
    <div class='iconshopList'>
      <div
        class='item'
        @click='buyHandler(item)'
        v-for='(item, index) in icons' :key='index'>
        <div class='image'>
          <img :src='`https://hawawa.co.kr/icon/${item.filename}`'>
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
  import axios from 'axios'
  
  export default {
    data() {
      return {
        icons: [],
        count: 0,
        page: 1,
        loading: false
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      getData: async function() {
        this.$store.commit('setLoading', true)
        const { data } = await axios.post(
          '/api/icon/list',
          { page: this.page - 1 }
        )
        this.icons = data.icons
        this.count = data.count
        this.$store.commit('setLoading')
      },
      buyHandler: async function(item) {
        if (this.loading) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        this.$confirm('정말로 구매하시겠습니까?', '알림', {
          confirmButtonText: '구매',
          cancelButtonText: '취소'
        }).then(() => {
          this.buy(item)
        })
      },
      buy: async function(item) {
        const token = this.$store.state.user.token
        this.loading = true
        const { data } = await axios.post(
          '/api/icon/buy',
          { id: item.id },
          { headers: { 'x-access-token': token } }
        )
        this.loading = false
        if (data.status === 'fail') return this.$message.error(data.message)
        this.$message.success('아이콘 교체 완료')
        this.$store.commit('user/setIcon', item.filename)
        this.$store.commit('user/setUpPoint', -(item.price))
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
  /* Iconshop Point Infomation */
  .iconshopPointInfo {
    margin-top: .3rem;
    padding: .1rem .5rem;
    border-radius: 500rem;
    background: #EAEAEA;
    color: #29313D;
    font-size: .75rem;
    float: right;
  }
  .iconshopPointInfo span.bold { font-weight: bold }

  /* Iconshop List */
  .iconshopList .item {
    display: inline-block;
    margin: .5rem;
    border-bottom: 1px solid #F5F5F5;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, .5);
  }
  .iconshopList .item:hover {
    background: rgba(245, 245, 245, .5);
    cursor: pointer;
  }
  .iconshopList .item .image {
    width: 100px;
  }
  .iconshopList .item .image img {
    width: 32px;
    height: 32px;
    margin: .25rem auto;
    margin-bottom: 0;
    border-radius: .25rem;
  }
  .iconshopList .item .info { padding-bottom: .25rem }
  .iconshopList .item .info .name {
    color: #409EFF;
    font-size: .8rem;
    font-weight: bold;
    text-align: center;
  }
  .iconshopList .item .info .price {
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