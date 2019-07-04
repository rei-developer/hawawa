<template>
  <div class='StickerView'>
    <div class='title'>
      <font-awesome-icon icon='info-circle' />
      스티커 정보
      <button class='close' @click='$emit("close")'>×</button>
    </div>
    <div class='content'>
      <div class='head'>
        <div class='name'>{{ sticker.name }}</div>
        <div class='left' v-if='lastDays > 0'>내 남은 기간 : <strong>{{ lastDays }}</strong>일</div>
        <div class='comment'>{{ sticker.description !== '' ? sticker.description : sticker.name }}</div>
      </div>
      <div class='item'>
        <img
          :src='`https://hawawa.co.kr/sticker/${id}/${index}.${sticker.ext}`'
          v-for='index in sticker.number' :key='index'>
      </div>
      <div class='footer'>
        <div class='buy'>
          <el-button type='primary' size='small' @click='buy'>
            <span v-if='loading'>
              <font-awesome-icon class='fa-spin' icon='circle-notch' />
            </span>
            <span v-else>
              구매
            </span>
          </el-button>
        </div>
        <div class='info'>
          <div>기간제 {{ sticker.days }}일</div>
          <div>
            <font-awesome-icon icon='gift' />
            {{ numberWithCommas(sticker.price) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['id', 'sticker'],
    data() {
      return {
        lastDays: 0,
        loading: false
      }
    },
    watch: {
      'id': async function() {
        this.getData()
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      getData: async function() {
        if (this.id < 1) return
        if (!this.$store.state.user.isLogged) return
        const token = this.$store.state.user.token
        this.lastDays = 0
        const data = await this.$axios.$get(
          `/api/sticker/list/${this.id}`,
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') return
        this.lastDays = data.days
      },
      buy: async function() {
        if (this.loading || this.id < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.loading = true
        const data = await this.$axios.$post(
          '/api/sticker/buy',
          { id: this.id },
          { headers: { 'x-access-token': token } }
        )
        this.loading = false
        if (data.status === 'fail') return this.$message.error(data.message)
        this.$message.success(`구매 완료 (${data.date})`)
        this.$store.commit('user/setUpPoint', -(this.sticker.price))
        this.lastDays += (this.sticker.days - 1)
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  .StickerView {
    position: fixed;
    left: 50%;
    top: 6em;
    width: 360px;
    height: 495px;
    margin: 0 0 0 -180px;
    border: 1px solid #333;
    border-radius: .5rem;
    background-color: #FFF;
    font-size: .9rem;
    z-index: 10000;
  }
  .StickerView > .title {
    margin: 0;
    padding: 6px;
    height: 29px;
    background-color: #29313D;
    color: #FFF;
    font-size: .9rem;
    font-weight: bold;
  }
  .StickerView .close {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 24px;
    height: 24px;
    line-height: 0;
    margin: 0;
    border: none;
    background: transparent;
    color: #FFF;
    text-align: center;
    cursor: pointer;
    outline: none;
  }
  .StickerView .content { padding: 12px }
  .StickerView .head {
    margin-bottom: 6px;
    padding: 8px;
    background-color: #FAFAFA;
  }
  .StickerView .name {
    float: left;
    margin-bottom: 6px;
    font-weight: bold;
    color: #29313D;
  }
  .StickerView .left {
    float: right;
    margin-bottom: 6px;
    color: #999;
  }
  .StickerView .left strong {
    padding: 0 3px;
    color: #29313D;
  }
  .StickerView .comment {
    clear: both;
    margin-top: 6px;
    padding-top: 6px;
    min-height: 40px;
    border-top: 1px solid #D2D2D2;
    color: #555;
  }
  .StickerView .item {
    height: 300px;
    overflow: auto;
  }
  .StickerView .item img {
    float: left;
    display: block;
    margin: 2px;
    width: 100px;
    height: 100px;
  }
  .StickerView .footer {
    margin: 6px 0;
    padding: 6px 0;
    border-top: 1px solid #D2D2D2;
    color: #A1A1A1;
    font-size: .8rem;
  }
  .StickerView .footer .buy {
    float: left;
    font-size: 13px;
    padding: 1px 3px;
  }
  .StickerView .footer .info {
    display: inline-block;
    text-align: right;
    float: right;
  }
</style>