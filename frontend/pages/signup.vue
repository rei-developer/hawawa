<template>
  <div>
    <div class='accountBox'>
      <div class='article'>
        <div class='header'>
          <nuxt-link to='/'>
            <img src='~/assets/Logo.png'>
          </nuxt-link>
        </div>
        <div class='title'>회원가입</div>
        <el-input placeholder='ID' v-model='username' autofocus />
        <el-input placeholder='비밀번호' v-model='password' show-password />
        <el-input placeholder='닉네임' v-model='nickname' />
        <el-input class='input-with-select' placeholder='이메일 주소' v-model='email'>
          <el-button slot='append' @click='accept'>전송</el-button>
        </el-input>
        <el-input class='marginBottom' placeholder='인증 코드' v-model='authCode' />
        <el-button class='widthAll' type='primary' @click='signUp'>다음</el-button>
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
        nickname: '',
        email: '',
        authCode: '',
        password: ''
      }
    },
    methods: {
      signIn() {
        this.$router.push({ path: '/signin' })
      },
      signUp: async function() {
        if (this.username === '') return this.$message.error('ID를 입력하세요.')
        if (this.nickname === '') return this.$message.error('닉네임을 입력하세요.')
        if (this.email === '') return this.$message.error('이메일 주소를 입력하세요.')
        if (this.authCode === '') return this.$message.error('ID를 입력하세요.')
        if (this.password === '') return this.$message.error('인증 코드를 입력하세요.')
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post('/api/auth/signup', { username: this.username, nickname: this.nickname, email: this.email, authCode: this.authCode, password: this.password })
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('계정 생성 성공')
        this.$store.commit('setLoading')
        this.$router.push({ path: '/signin' })
      },
      accept: async function() {
        if (this.email === '') return this.$message.error('이메일 주소를 입력하세요.')
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$post('/api/auth/accept', { email: this.email })
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('인증 코드를 전송했습니다.')
        this.$store.commit('setLoading')
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
    margin-top: -200px;
    margin-left: -115px;
    -ms-overflow-style: none;
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
  .accountBox .article .title {
    color: #757c80;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }
  .accountBox .article .saveId {
    margin-top: 10px;
    color: #333;
    font-size: .8rem;
    float: right;
  }

  ::-webkit-scrollbar { display:none }
</style>