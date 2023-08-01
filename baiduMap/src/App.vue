<template>
  <router-view />
</template>
<script lang="ts" setup>
import * as echarts from 'echarts'
import { provide } from 'vue';
provide('echarts', echarts)
</script>
<style>
body,
html,
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
}
</style>
