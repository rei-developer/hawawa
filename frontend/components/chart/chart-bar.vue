<template>
  <div>
    <h2>Bar</h2>

    <div class="card">
      <canvas id="fooCanvas" count="2" />

      <chartjs-bar
        v-for="(item, index) in types"
        v-bind:key="index"
        v-bind:backgroundcolor="item.bgColor"
        v-bind:beginzero="beginZero"
        v-bind:bind="true"
        v-bind:bordercolor="item.borderColor"
        v-bind:data="item.data"
        v-bind:datalabel="item.dataLabel"
        v-bind:labels="labels"
        target="fooCanvas"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      beginZero: true,
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      types: [
        {
          bgColor: "#ff80ab",
          borderColor: "#e91e63",
          data: [1, 3, 5, 7, 2, 4, 6],
          dataLabel: "Bar"
        },
        {
          bgColor: "#ea80fc",
          borderColor: "#9c27b0",
          data: [1, 5, 2, 6, 3, 7, 4],
          dataLabel: "Baz"
        }
      ]
    };
  }
};
</script>