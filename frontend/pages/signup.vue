<template>
  <div>
    <div class='accountBox'>
      <div class='header'>
        <nuxt-link to='/'>
          <img src='~/assets/Logo.png'>
        </nuxt-link>
      </div>
      <div class='article'>
        <el-input class='marginBottom' size='small' placeholder='ID' v-model='username' autofocus />
        <el-input class='marginBottom' size='small' placeholder='비밀번호' v-model='password' show-password />
        <el-input class='marginBottom' size='small' placeholder='닉네임' v-model='nickname' />
        <el-input class='marginBottom input-with-select' size='small' placeholder='이메일 주소' v-model='email'>
          <el-button slot='append' @click='accept'>전송</el-button>
        </el-input>
        <el-input class='marginBottom' size='small' placeholder='인증 코드' v-model='authCode' />
        <el-button class='widthAll' type='primary' size='small' @click='signUp'>
          <font-awesome-icon icon='user-edit' />
          계정 생성
        </el-button>
      </div>
    </div>
    <div class='accountBox'>
      <div class='article'>
        <div class='signIn' @click='signIn'>계정이 있으시다면 로그인하세요</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
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
    width: 330px;
    margin: 0 auto;
  }
  .accountBox .header {
    width: 300px;
    margin: 5rem auto 2rem;
  }
  .accountBox .article {
    width: 100%;
    padding: .5rem;
    margin-bottom: 4rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, .08);
    background: #FFF;
  }
  .accountBox .article:last-child {
    margin-bottom: 1rem;
  }

  /* Sign In */
  .signIn {
    width: 100%;
    padding: .5rem 0;
    border-radius: .5rem;
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    color: #67C23A;
    font-size: .8rem;
    text-align: center;
    cursor: pointer;
  }
  .signIn:hover {
    background: rgba(103, 194, 58, .1);
  }
</style>