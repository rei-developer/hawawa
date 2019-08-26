<template>
  <div>
    <el-menu :default-openeds='["8"]'>
      <el-menu-item class='is-active' index='1' @click='exit()'>
        <font-awesome-icon icon='times' />
      </el-menu-item>
      <el-menu-item index='2' @click='move("/gallery")'>
        <font-awesome-icon icon='camera-retro' />
        <span>갤러리</span>
      </el-menu-item>
      <el-menu-item index='3' @click='move("/b/best")'>
        <font-awesome-icon icon='star' />
        <span>인기</span>
      </el-menu-item>
      <el-menu-item index='4' @click='move("/b/all")'>
        <span>전체</span>
      </el-menu-item>
      <el-menu-item index='5' @click='move("/b/talk")'>
        <span>토크</span>
      </el-menu-item>
      <el-menu-item index='6' @click='move("/b/notice")'>
        <span>공지사항</span>
      </el-menu-item>
      <el-menu-item index='7' @click='move("/pds")'>
        <span>자료실</span>
      </el-menu-item>
      <el-submenu index='8'>
        <template slot='title'>포인트</template>
        <el-menu-item index='8-1' @click='move("/sticker")'>스티커샵</el-menu-item>
        <el-menu-item index='8-2' @click='move("/iconshop")'>아이콘샵</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
  export default {
    methods: {
      move(path) {
        this.$store.commit('forceUpdate')
        this.$store.commit('setAside')
        this.$router.push({ path })
      },
      exit() {
        this.$store.commit('setAside')
      }
    }
  }
</script>