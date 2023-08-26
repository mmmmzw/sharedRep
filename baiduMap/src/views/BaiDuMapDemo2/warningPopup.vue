<template>
  <div class="warning-popup" v-if="data.boxVisiable">
    <transition enter-active-class=" animate__animated animate__fadeInUp" leave-active-class="animate__animated animate__fadeOutLeft">
      <div class="warning-popup-left" v-if="data.left.visiable">
        <div class="warning-popup-content" @click="openDialog(data.left.id)">
          <div class="warning-popup-content-row1">
            <div class="warning-popup-content-row1-title">{{ data.left.title }}</div>
            <div class="warning-popup-content-row1-tag">{{ data.left.warningGrade }}</div>
          </div>
          <div class="warning-popup-content-row2">
            <div class="warning-popup-content-row2-stuName">{{ data.left.studentName }}</div>
            <div class="warning-popup-content-row2-time">{{ data.left.createTime }}</div>
          </div>
        </div>
        <div class="warning-popup-close-btn" @click="closeLeft"></div>
      </div>
    </transition>
    <transition enter-active-class=" animate__animated animate__fadeInUp" leave-active-class="animate__animated animate__fadeOutLeft">
      <div class="warning-popup-right" v-if="data.right.visiable">
        <div class="warning-popup-content" @click="openDialog(data.right.id)">
          <div class="warning-popup-content-row1">
            <div class="warning-popup-content-row1-title">{{ data.right.title }}</div>
            <div class="warning-popup-content-row1-tag">{{ data.right.warningGrade }}</div>
          </div>
          <div class="warning-popup-content-row2">
            <div class="warning-popup-content-row2-stuName">{{ data.right.studentName }}</div>
            <div class="warning-popup-content-row2-time">{{ data.right.createTime }}</div>
          </div>
        </div>
        <div class="warning-popup-close-btn" @click="closeRight"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, onMounted, reactive, watchEffect, defineProps, defineExpose, defineEmits } from "vue";
import dayjs from "dayjs";
const SecondRef = ref();
const emit = defineEmits(["warningStatus"]);
const data: any = reactive({
  isFirstInit: true,
  boxVisiable: true,
  left: {
    visiable: false,
    studentName: "",
    title: "",
    warningGrade: "",
    createTime: "",
    id: "",
  },
  right: {
    visiable: false,
    studentName: "",
    title: "",
    warningGrade: "",
    createTime: "",
    id: "",
  },
  idPool: [],
  list: [],
});
function openDialog(id: any) {
  if (SecondRef.value) {
    SecondRef.value.open(id);
  }
}
function closeLeft() {
  data.left.visiable = false;
  data.idPool.find((v: any) => v.id === data.left.id).isClosed = true;
  data.left.studentName = "";
  data.left.id = "";
  data.left.title = "";
  data.left.warningGrade = "";
  data.left.createTime = "";
  const currentShowNumber = (data.left.visiable ? 1 : 0) + (data.right.visiable ? 1 : 0);
  if (currentShowNumber === 0) {
    emit("warningStatus", "closeAll");
  }
}
function closeRight() {
  data.right.visiable = false;
  data.idPool.find((v: any) => v.id === data.right.id).isClosed = true;
  data.right.studentName = "";
  data.right.id = "";
  data.right.title = "";
  data.right.warningGrade = "";
  data.right.createTime = "";
  const currentShowNumber = (data.left.visiable ? 1 : 0) + (data.right.visiable ? 1 : 0);
  if (currentShowNumber === 0) {
    emit("warningStatus", "closeAll");
  }
}
// 计算增量函数
function update(list: any) {
  // list = JSON.parse(JSON.stringify(list));
  data.list = [];
  data.list = list
    .reduce((pre: any, cur: any) => {
      const pointStuList = cur.warningEventRspList
        .filter((stu: any) => stu.warningGrade === "特大预警")
        .filter((stu: any) => {
          const idPoolIndex = data.idPool.findIndex((idPoolItem: any) => idPoolItem.id === stu.id);
          if (idPoolIndex === -1) {
            return true;
          } else {
            return !data.idPool[idPoolIndex].isClosed;
          }
        });
      return [...pre, ...pointStuList];
    }, [])
    .sort((a, b) => b - a);
  console.log("未被处置的特大预警：", data.list);
  data.list
    .map((v: any) => {
      return { id: v.id, isClosed: v.isClosed || data.isFirstInit };
    })
    .forEach((idPoolItemRow: any) => {
      if (!data.idPool.some((idPoolItem: any) => idPoolItem.id === idPoolItemRow.id)) data.idPool.push(idPoolItemRow);
    });
  console.log("id池记录：", data.idPool);
  const currentShowNumber = (data.left.visiable ? 1 : 0) + (data.right.visiable ? 1 : 0);

  // 第一次加载不操作
  if (data.isFirstInit) {
    data.isFirstInit = false;
  } else {
    // 如果数量没变，就不更新视图
    if (currentShowNumber === data.list.length) {
      return false;
    }

    // 符合要求，更新视图
    data.left.visiable = false;
    data.right.visiable = false;
    setTimeout(() => {
      if (data.list[0]) {
        data.left.visiable = true;
        data.left.studentName = data.list[0].studentName;
        data.left.id = data.list[0].id;
        data.left.title = data.list[0].warningType;
        data.left.warningGrade = data.list[0].warningGrade;
        data.left.createTime = dayjs(data.list[0].createTime).format("MM-DD HH:mm:ss");
      }
      if (data.list[1]) {
        data.right.visiable = true;
        data.right.studentName = data.list[1].studentName;
        data.right.id = data.list[1].id;
        data.right.title = data.list[1].warningType;
        data.right.warningGrade = data.list[1].warningGrade;
        data.right.createTime = dayjs(data.list[1].createTime).format("MM-DD HH:mm:ss");
        // 不够新的数据一律不允许再次出现
        for (let i = 2; i < data.list.length; i++) {
          data.idPool.find((idPoolItem: any) => idPoolItem.id === data.list[i].id).isClosed = true;
        }
      }
      emit("warningStatus");
    }, 300);
  }
  console.log("data", data);
  console.log("data left", data.left);
  console.log("data right", data.right);
}
function clearSign() {
  data.idPool = [];
}
defineExpose({ update, clearSign });
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
