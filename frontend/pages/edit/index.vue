<template>
  <div>
    <div class='accountBox'>
      <div class='header'>프로필 편집</div>
      <div class='profile' :style='$store.state.user.backgroundImageUrl ? `background-image: url(${$store.state.user.backgroundImageUrl})` : ""'>
        <div class='background' />
        <div class='nickname'>
          <img :src='`/level/${$store.state.user.level}.png`'>
          {{ $store.state.user.nickname }}
        </div>
        <el-tooltip class='item' effect='dark' content='배경사진을 변경할 수 있습니다.' placement='bottom'>
          <div class='upload'>
            <font-awesome-icon icon='camera' />
            <input type='file' @change='backgroundImageUpload' />
          </div>
        </el-tooltip>
        <div class='image'>
          <img :src='$store.state.user.profileImageUrl || "/profile.png"'>
          <el-tooltip class='item' effect='dark' content='프로필 사진을 변경할 수 있습니다.' placement='bottom'>
            <input type='file' @change='profileImageUpload' />
          </el-tooltip>
        </div>
      </div>
      <div class='article'>
        <div class='title'>
          <font-awesome-icon icon='id-badge' />
          기본 정보
        </div>
        <el-input class='marginBottom input-with-select' size='small' :placeholder='$store.state.user.username' v-model='username'>
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
          암호 변경
        </div>
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
        <el-progress class='marginBottom' :text-inside='true' :stroke-width='20' :percentage='per' color='#25c6ff'></el-progress>
        <el-button class='widthAll' type='primary' size='small' @click='edit'>편집</el-button>
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
      profileImageUpload: async function(e) {
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
        const data = await this.$axios.$post(
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
      backgroundImageUpload: async function(e) {
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
        const data = await this.$axios.$post(
          '/api/cloud/background',
          formData,
          { headers: { 'content-type': 'multipart/form-data' } }
        )
        if (data.status === 'fail') {
          this.loading = false
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.editByBackgroundImage(token, data.filename)
      },
      editByProfileImage: async function(token, url) {
        const data = await this.$axios.$patch(
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
      editByBackgroundImage: async function(token, url) {
        const data = await this.$axios.$patch(
          '/api/auth/edit/background',
          { url },
          { headers: { 'x-access-token': token } }
        )
        this.loading = false
        this.$store.commit('setLoading')
        if (data.status === 'fail') return this.$message.error(data.message || '오류가 발생했습니다.')
        this.$message.success('배경사진을 업로드했습니다.')
        this.$store.commit('user/setBackgroundImageUrl', url)
      },
      edit: async function() {
        if (this.newPassword !== this.newPassword2) return this.$message.error('새 암호가 서로 다릅니다.')
        if (!this.$store.state.user.isLogged) return this.$message.error('로그인하세요.')
        const token = this.$store.state.user.token
        this.$store.commit('setLoading', true)
        const data = await this.$axios.$patch(
          '/api/auth/edit',
          {
            username: this.username,
            nickname: this.nickname,
            newPassword: this.newPassword,
            newPassword2: this.newPassword2
          },
          { headers: { 'x-access-token': token } }
        )
        if (data.status === 'fail') {
          this.$store.commit('setLoading')
          return this.$message.error(data.message || '오류가 발생했습니다.')
        }
        this.$message.success('프로필을 편집했습니다.')
        if (this.username !== '') this.$store.commit('user/setUsername', this.username)
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
    position: relative;
    border: 1px solid #EEE;
    border-top-left-radius: .5rem;
    border-top-right-radius: .5rem;
    background-size: cover;
    background-repeat: repeat;
  }
  .accountBox .profile .image img {
    width: 5rem;
    height: 5rem;
    margin: .5rem;
    padding: 2px;
    border: 1px solid #CCC;
    border-radius: 500rem;
    background: #FFF;
  }
  .accountBox .profile .image input {
    position: absolute;
    width: 5rem;
    height: 5rem;
    top: 0;
    left: .5rem;
    opacity: 0;
  }
  .accountBox .profile .upload {
    position: absolute;
    right: .5rem;
    bottom: .5rem;
    width: 2.2rem;
    height: 2.2rem;
    line-height: 2rem;
    border-radius: 500rem;
    background: #29313D;
    color: #FFF;
    font-size: 1.2rem;
    text-align: center;
    opacity: .75;
    z-index: 1;
  }
  .accountBox .profile .upload input {
    position: absolute;
    width: 2.2rem;
    height: 2.2rem;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
  .accountBox .profile .image input:hover,
  .accountBox .profile .upload input:hover {
    cursor: pointer;
  }
  .accountBox .profile .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, .5), transparent);
  }
  .accountBox .profile .nickname {
    position: absolute;
    left: 6rem;
    bottom: .2rem;
    color: #FFF;
    font-size: 1.4rem;
    font-weight: bold;
  }
  .accountBox .profile .upload:hover {
    cursor: pointer;
    opacity: 1;
  }
  .accountBox .article {
    width: 100%;
    padding: .5rem;
    margin-bottom: 4rem;
    border: 1px solid #EEE;
    border-top: 0;
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