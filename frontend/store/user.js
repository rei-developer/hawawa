export const state = () => ({
  token: '',
  id: 0,
  username: '',
  nickname: '',
  email: '',
  profileImageUrl: null,
  registerDate: null,
  blockDate: null,
  level: 0,
  exp: 0,
  point: 0,
  icon: '',
  isAdmin: false,
  noticeCount: 0,
  isLogged: false
})

export const mutations = {
  setUser: (state, data) => {
    state.token = data.token
    state.id = data.user.id
    state.username = data.user.username
    state.nickname = data.user.nickname
    state.email = data.user.email
    state.profileImageUrl = data.user.profileImageUrl ? `https://hawawa.co.kr/profile/${data.user.profileImageUrl}` : '/profile.png'
    state.registerDate = data.user.registerDate
    state.blockDate = data.user.blockDate
    state.level = data.user.level
    state.exp = data.user.exp
    state.point = data.user.point
    state.icon = data.user.icon
    state.isAdmin = data.user.isAdmin
    state.isLogged = true
  },
  setUsername: (state, username) => state.username = username,
  setNickname: (state, nickname) => state.nickname = nickname,
  setProfileImageUrl: (state, url) => state.profileImageUrl = `https://hawawa.co.kr/profile/${url}`,
  setIcon: (state, filename) => state.icon = filename,
  setNoticeCount: (state, count) => state.noticeCount = count,
  setUpPoint: (state, point) => state.point += point,
  signOut: state => {
    state.token = ''
    state.isLogged = false
    localStorage.removeItem('token')
  }
}