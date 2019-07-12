<template>
  <div>
    <div id='background' />
    <no-ssr>
      <Loading v-if='$store.state.loading' />
    </no-ssr>
    <el-container>
      <nuxt />
    </el-container>
  </div>
</template>

<script>
  import Loading from '~/components/loading.vue'

  export default {
    components: { Loading }
  }
</script>

<style>
  #background {
    position: fixed;
    background-image: url('/background.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
</style>