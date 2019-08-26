<template>
  <div class='Header'>
    <el-row :gutter='0'>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
      <el-col :xl='16'>
        <el-menu
          class='el-menu'
          mode='horizontal'
          :router='true'
          active-text-color='#29313D'>
          <el-menu-item index='0' route='/' class='Logo' @click='forceUpdate'>
            <img src='~/assets/Icon.png' class='hidden-desktop'>
            <img src='~/assets/Logo.png' class='hidden-mobile'>
          </el-menu-item>
          <el-menu-item index='1' route='/gallery' class='hidden-mobile' @click='forceUpdate'>
            <font-awesome-icon icon='camera-retro' />
            갤러리
          </el-menu-item>
          <el-menu-item index='2' route='/b/best' class='hidden-mobile' @click='forceUpdate'>
            <font-awesome-icon icon='star' />
            인기
          </el-menu-item>
          <el-menu-item index='3' route='/b/all' class='hidden-mobile' @click='forceUpdate'>전체</el-menu-item>
          <el-menu-item index='4' route='/b/talk' class='hidden-mobile' @click='forceUpdate'>토크</el-menu-item>
          <el-menu-item index='5' route='/b/notice' class='hidden-mobile' @click='forceUpdate'>공지사항</el-menu-item>
          <el-menu-item index='6' route='/pds' class='hidden-mobile' @click='forceUpdate'>자료실</el-menu-item>
          <el-submenu index='7' class='hidden-mobile'>
            <template slot='title'>포인트</template>
            <el-menu-item index='7-1' route='/sticker'>스티커샵</el-menu-item>
            <el-menu-item index='7-2' route='/iconshop'>아이콘샵</el-menu-item>
          </el-submenu>
          <el-submenu index='8' class='rightMenu' v-if='$store.state.user.isLogged'>
            <template slot='title'>
              <div class='Avatar'>
                <img :src='$store.state.user.profileImageUrl'>
              </div>
              <img :src='`/level/${$store.state.user.level}.png`'>
              <img class='Icon' :src='`https://hawawa.co.kr/icon/${$store.state.user.icon}`' v-if='$store.state.user.icon !== ""'>
              {{ $store.state.user.nickname }}
            </template>
            <el-menu-item index='8-1' route='/edit'>프로필 편집</el-menu-item>
            <el-menu-item index='8-2' route='/edit/topic'>내 작성글</el-menu-item>
            <el-menu-item index='8-3' route='/edit/post'>내 작성 댓글</el-menu-item>
            <el-menu-item index='8-4' @click='signOut'>로그아웃</el-menu-item>
          </el-submenu>
          <el-menu-item index='8' route='/signin' class='rightMenu' v-if='!$store.state.user.isLogged'>
            <font-awesome-icon icon='sign-in-alt' />
            로그인
          </el-menu-item>
          <el-menu-item index='9' route='/notice' class='rightMenu' @click='forceUpdate' v-if='$store.state.user.isLogged'>
            <font-awesome-icon icon='envelope' />
            <el-badge class='Badge' :value='$store.state.user.noticeCount' v-if='$store.state.user.noticeCount > 0' />
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    methods: {
      forceUpdate() {
        this.$store.commit('forceUpdate')
      },
      signOut() {
        if (!this.$store.state.user.isLogged) return
        this.$store.commit('user/signOut')
      }
    }
  }
</script>

<style>
  /* Header */
  .Header {
    position: relative;
    margin-bottom: 1rem;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, .25);
    background-image: url(/navbg.jpg);
    overflow: visible;
    z-index: 1;
  }

  /* Logo */
  .Logo {
    padding-left: 0;
    border-bottom-color: transparent !important;
  }
  .Logo:hover {
    background-color: transparent !important;
    opacity: 0.8;
  }
  .Logo img {
    height: 41px;
    padding-bottom: 5px;
  }

  /* Badge */
  .Badge {
    position: absolute;
    margin-top: -10px;
    margin-left: -5px;
    font-weight: normal;
  }

  /* Avatar */
  .Avatar {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 0 .25rem 3px;
    padding: 2px;
    border: 1px solid #DDD;
    border-radius: 500rem;
    background: #FFF;
  }
  .Avatar img {
    width: 34px;
    height: 34px;
    margin-bottom: 50px;
    border-radius: 500rem;
  }

  /* Icon */
  img.Icon {
    width: 16px;
    height: 16px;
    margin-top: -4px;
  }

  /* Right Menu */
  .rightMenu {
    float: right !important;
  }
  .rightMenu .el-submenu__title {
    padding-right: 0 !important;
    font-weight: bold;
  }
</style>