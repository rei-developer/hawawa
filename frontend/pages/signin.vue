<template>
  <div class='accountBox'>
    <div class='article'>
      <div class='header'>
        <nuxt-link to='/'>
          <img src='~/assets/Logo.png'>
        </nuxt-link>
      </div>
      <el-input placeholder='ID' v-model='username' autofocus />
      <el-input class='marginBottom' placeholder='비밀번호' v-model='password' show-password />
      <el-button-group>
        <el-button type='info' size='small' @click='signUp'>계정 생성</el-button>
        <el-button type='primary' size='small' @click='signIn'>
          <font-awesome-icon icon='pencil-alt' />
          로그인
        </el-button>
      </el-button-group>
      <div class='saveId'>
        <el-tooltip class='item' effect='dark' content='로그인 ID를 저장합니다.' placement='top'>
          <el-switch
            v-model='save'
            active-color='#29313D' />
        </el-tooltip>
        ID 저장
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    layout: 'sign',
    data() {
      return {
        username: '',
        password: '',
        save: false
      }
    },
    created() {
      if (process.browser) {
        this.save = (localStorage.save === 'true') || false
        if (this.save) this.username = localStorage.username || ''
      }
    },
    updated() {
      if (process.browser) {
        if ((localStorage.save === 'true') !== this.save) {
          localStorage.save = this.save
          if (!this.save) localStorage.removeItem('username')
        }
        if (localStorage.save === 'true' && localStorage.username !== this.username)
          localStorage.username = this.username
      }
    },
    methods: {
      signIn: async function() {
        if (this.username === '') return this.$message.error('ID를 입력하세요.')
        if (this.password === '') return this.$message.error('비밀번호를 입력하세요.')
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post('/api/auth/signin', { username: this.username, password: this.password })
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        localStorage.setItem('token', data.token)
        location.href = '/'
      },
      signUp() {
        this.$router.push({ path: '/signup' })
      }
    }
  }
</script>

<style>
  /* Margin */
  .marginBottom {
    margin-bottom: .5rem;
  }

  /* Account Box */
  .accountBox {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 360px;
    margin-top: -115px;
    margin-left: -115px;
  }
  .accountBox .article {
    width: 100%;
    padding: 1rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, .08);
    border-radius: .2rem;
    background: rgba(255, 255, 255, .95);
  }
  .accountBox .article .header {
    width: 280px;
    margin: .5rem auto 1rem;
  }
  .accountBox .article .saveId {
    margin-top: 10px;
    color: #333;
    font-size: .8rem;
    float: right;
  }

  ::-webkit-scrollbar { display:none }
</style>