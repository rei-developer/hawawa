<template>
  <div>
    <div class='accountBox'>
      <div class='header'>프로필 편집</div>
      <el-tooltip class='item' effect='dark' content='프로필 사진을 변경할 수 있습니다.' placement='bottom'>
        <div class='profile'>
          <img :src='$store.state.user.profileImageUrl'>
          <input type='file' @change='imageUpload' />
        </div>
      </el-tooltip>
      <div class='article'>
        <div class='title'>
          <font-awesome-icon icon='id-badge' />
          기본 정보
        </div>
        <el-input class='marginBottom input-with-select' size='small' :value='$store.state.user.username' readonly>
          <el-button class='editPrepend' slot='prepend'>ID</el-button>
        </el-input>
        <el-input class='marginBottom input-with-select' size='small' :placeholder='$store.state.user.nickname' v-model='nickname' autofocus>
          <el-button class='editPrepend' slot='prepend'>닉네임</el-button>
        </el-input>
        <el-input class='input-with-select' size='small' :value='$store.state.user.email' readonly>
          <el-button class='editPrepend' slot='prepend'>이메일 주소</el-button>
        </el-input>
        <hr />
        <div class='title'>
          <font-awesome-icon icon='key' />
          비밀번호 변경 (준비중)
        </div>
        <el-input class='marginBottom input-with-select' size='small' placeholder='현재 사용중인 암호' v-model='nowPassword' show-password>
          <el-button class='editPrepend' slot='prepend'>현재 암호</el-button>
        </el-input>
        <el-input class='marginBottom input-with-select' size='small' placeholder='20자 제한' v-model='newPassword' show-password>
          <el-button class='editPrepend' slot='prepend'>새 암호</el-button>
        </el-input>
        <el-input class='input-with-select' size='small' placeholder='20자 제한' v-model='newPassword2' show-password>
          <el-button class='editPrepend' slot='prepend'>새 암호 확인</el-button>
        </el-input>
        <hr />
        <div class='title'>
          <font-awesome-icon icon='calendar-check' />
          날짜 정보
        </div>
        <el-input
          class='marginBottom input-with-select'
          size='small'
          :value='`${$moment($store.state.user.registerDate).format("YYYY/MM/DD HH:mm:ss")} (${numberWithCommas($moment().diff($moment($store.state.user.registerDate), "days"))}일)`'
          readonly>
          <el-button class='editPrepend' slot='prepend'>계정 생성 날짜</el-button>
        </el-input>
        <el-input
          class='input-with-select'
          size='small'
          :value='$moment($store.state.user.blockDate).format("YYYY/MM/DD")'
          readonly>
          <el-button class='editPrepend' slot='prepend'>이용 제한 날짜</el-button>
        </el-input>
        <hr />
        <div class='title'>
          <font-awesome-icon icon='gift' />
          포인트 정보
        </div>
        <el-input class='marginBottom input-with-select' size='small' :value='numberWithCommas($store.state.user.point)' readonly>
          <el-button class='editPrepend' slot='prepend'>포인트</el-button>
        </el-input>
        <el-input class='marginBottom input-with-select' size='small' :value='$store.state.user.level' readonly>
          <el-button class='editPrepend' slot='prepend'>레벨</el-button>
        </el-input>
        <el-input class='marginBottom input-with-select' size='small' :value='`${numberWithCommas(exp)} / ${numberWithCommas(maxExp)} (${per}%)`' readonly>
          <el-button class='editPrepend' slot='prepend'>경험치</el-button>
        </el-input>
        <el-progress class='marginBottom' :text-inside='true' :stroke-width='20' :percentage='per' color='#409EFF'></el-progress>
        <el-button class='widthAll' type='primary' size='small' @click='edit'>편집</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  
  export default {
    data() {
      return {
        nickname: '',
        email: '',
        nowPassword: '',
        newPassword: '',
        newPassword2: '',
        exp: 0,
        maxExp: 0,
        per: 0,
        loading: false
      }
    },
    watch: {
      '$store.state.user.level': function() {
        this.getStatus()
      },
      '$store.state.user.exp': function() {
        this.getStatus()
      }
    },
    mounted() {
      this.getStatus()
    },
    methods: {
      getStatus() {
        this.exp = this.$store.state.user.exp
        this.maxExp = Math.pow(this.$store.state.user.level, 2) * 90
        this.per = (this.exp / this.maxExp * 100).toFixed(2)
      },
      imageUpload: async function(e) {
        if (this.loading || e.target.files.length < 1) return
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        const LIMITS = 10485760
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('type', 'file')
        formData.append('image', file, file.name)
        if (!/(.png|.jpg|.jpeg)/i.test(file.name)) return this.$message.error('이미지 업로드 실패... (png, jpg, jpeg만 가능)')
        if (file.size > LIMITS) return this.$message.error('이미지 업로드 실패... (10MB 이하만 업로드 가능)')
        this.loading = true
        this.$store.commit('setLoading', true)
        const { data } = await axios.post(
          '/api/cloud/profile',
          formData,
          { headers: { 'content-type': 'multipart/form-data' } }
        )
        if (data.status === 'fail') {
          this.loading = false
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.editByProfileImage(token, data.filename)
      },
      editByProfileImage: async function(token, url) {
        const { data } = await axios.patch(
          '/api/auth/edit/profile',
          { url },
          { headers: { 'x-access-token': token } }
        )
        this.loading = false
        this.$store.commit('setLoading')
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.$message.success('프로필 사진을 업로드했습니다.')
        this.$store.commit('user/setProfileImageUrl', url)
      },
      edit: async function() {
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const { data } = await axios.patch(
          '/api/auth/edit',
          { nickname: this.nickname },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('프로필을 편집했습니다.')
        if (this.nickname !== '') this.$store.commit('user/setNickname', this.nickname)
        this.$store.commit('setLoading')
      },
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }
</script>

<style>
  /* Margin */
  .marginBottom {
    margin-bottom: .5rem;
  }

  /* Element UI Customize */
  .editPrepend {
    width: 7rem;
    padding: 12px;
    text-align: left;
  }

  /* Account Box */
  .accountBox {
    width: 330px;
    margin: 0 auto;
  }
  .accountBox .header {
    margin: 1rem auto;
    color: #29313D;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  }
  .accountBox .profile {
    margin-bottom: 1rem;
    text-align: center;
  }
  .accountBox .profile:hover {
    opacity: .8;
  }
  .accountBox .profile img {
    width: 5rem;
    height: 5rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
    background: #FFF;
  }
  .accountBox .profile input {
    position: absolute;
    width: 5rem;
    height: 5rem;
    margin-left: -5rem;
    opacity: 0;
  }
  .accountBox .profile input:hover {
    cursor: pointer;
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
  .accountBox .article .title {
    margin-bottom: .5rem;
    color: #29313D;
    font-size: .9rem;
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