<template>
  <div class="home">
    <div class="row1">
      <!-- 1 -->
      <div class="box" @click="goToPath('BaiDuMapDemo1')">
        <div class="pic">
          <img src="@/assets/snapshot/BaiDuMapDemo1.gif" alt="" />
        </div>
        <h2 class="title">BaiDuMapDemo1</h2>
        <h3 class="title">【自定义图标】【波纹动画】【点击图标事件】</h3>
      </div>
      <!-- 2 -->
      <div class="box" @click="goToPath('BigEye')">
        <div class="pic">
          <img src="@/assets/snapshot/BigEye.png" alt="" />
        </div>
        <h2 class="title">BigEye</h2>
        <h3 class="title"></h3>
      </div>
      <!-- 3 -->
      <div class="box" @click="goToPath('BaiDuMapDemo2')">
        <div class="pic">
          <img src="@/assets/snapshot/BaiDuMapDemo2.png" alt="" />
        </div>
        <h2 class="title">BaiDuMapDemo2</h2>
        <h3 class="title">预警浮窗</h3>
      </div>
      <!-- 4 -->
      <div class="box" @click="goToPath('threejs')">
        <div class="pic">
          <img src="@/assets/snapshot/BaiDuMapDemo2.png" alt="" />
        </div>
        <h2 class="title">demo1</h2>
        <h3 class="title">xx</h3>
      </div>
      <div class="box"></div>
      <div class="box"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Options, Vue } from "vue-class-component";
import { useRouter } from "vue-router";
const router = useRouter();
const goToPath = (path: string) => {
  router.push({
    name: path,
  });
};
</script>
<style lang="less" scoped>
.row1 {
  display: flex;
  height: 300px;

  .box {
    flex: 1;
    height: 100%;
    background-color: lightcyans;
    border: 2px solid #ccc;
    cursor: pointer;

    .pic {
      width: 100%;
      height: 80%;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      text-align: center;
    }
  }
}
</style>
