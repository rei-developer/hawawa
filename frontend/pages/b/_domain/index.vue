<template>
  <div>
    <!-- <div class='animeBackground' v-if='domain === "anime"' /> -->
    <el-row>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
      <el-col :xl='16'>
        <div class='Container'>
          <div class='item'>
            <div class='content'>
              <TopicList :id='0' :purePage='$route.query.page || 1' />
            </div>
            <div class='sidebar'>
              <Recent />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xl='4' hidden-lg-and-down>
        <div class='blank' />
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import TopicList from '~/components/topic/list.vue'
  import Recent from '~/components/recent.vue'

  export default {
    components: {
      TopicList,
      Recent
    },
    data() {
      return {
        domain: ''
      }
    },
    async asyncData ({ params }) {
      const domain = params.domain
      return { domain }
    }
  }
</script>