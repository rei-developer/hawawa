<template>
  <div>
    <h2>Line</h2>

    <div class="card">
      <header>
        <chartjs-line
          v-bind:backgroundcolor="bgColor"
          v-bind:beginzero="beginZero"
          v-bind:bind="true"
          v-bind:bordercolor="borderColor"
          v-bind:data="data[radio]"
          v-bind:datalabel="dataLabel"
          v-bind:labels="labels[radio]"
        />
      </header>

      <footer class="flex two">
        <label>
          <input v-model="radio" v-bind:name="dataLabel" type="radio" value="day">
          <span class="checkable">Today</span>
        </label>
        <label>
          <input v-model="radio" v-bind:name="dataLabel" type="radio" value="week">
          <span class="checkable">This Week</span>
        </label>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      beginZero: true,
      bgColor: "#ff8a80",
      borderColor: "#f44336",
      data: {
        day: [1, 3, 5, 3, 1],
        week: [12, 14, 16, 18, 11, 13, 15]
      },
      dataLabel: "Foo",
      labels: {
        day: [8, 10, 12, 14, 16],
        week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      radio: "day"
    };
  }
};
</script>