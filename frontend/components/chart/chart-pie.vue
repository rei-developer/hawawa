<template>
  <div>
    <chartjs-pie
      :bind='true'
      :datasets='datasets'
      :labels='labels'
      :option='option'
    />
  </div>
</template>

<script>
  export default {
    props: ['data', 'labels'],
    data() {
      return {
        datasets: [
          {
            data: this.data,
            backgroundColor: ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB', '#9966FF']
          }
        ],
        option: {}
      }
    }
  }
</script>