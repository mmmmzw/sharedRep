<template>
  <div class="page">
    <div class="eyeSocket eyeSocketSleeping" id="bigEye">
      <div id="eyeball"></div>
    </div>
    <div class="filter">
      // 添加滤镜的元素
      <div class="eyeSocket" id="eyeFilter">// 大眼替身</div>
    </div>
    <!-- Svg滤镜 -->
    <svg width="0">
      <filter id="filter">
        <feTurbulence baseFrequency="1">
          <animate id="animate1" attributeName="baseFrequency" dur="1s" from="0.5" to="0.55" begin="0s;animate1.end"></animate>
          <animate id="animate2" attributeName="baseFrequency" dur="1s" from="0.55" to="0.5" begin="animate2.end"></animate>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="50" xChannelSelector="R" yChannelSelector="B" />
      </filter>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, reactive, nextTick } from "vue"
import * as echarts from "echarts"
// 画眼球
let eyeball: any
let eyeballChart: any
let bigEye: any
let leftRotSize = 0 // 旋转角度
let ballSize = 0 // 眼睛尺寸
let rotTimer: any // 定时器
let isSleep = true // 是否处于休眠状态
let ballColor = "transparent" // 默认透明，其实默认是啥都无所谓，反正看不见
let eyeFilter: any
let sleepTimer: any // 休眠定时器

function getEyeballChart() {
  eyeballChart.setOption({
    series: [
      {
        type: "gauge", // 使用仪表盘类型
        radius: "-20%", // 采用负数是为了让分割线从内向外延伸
        clockwise: false,
        startAngle: `${0 + leftRotSize * 5}`, // 起始角度
        endAngle: `${270 + leftRotSize * 5}`, // 结束角度
        splitNumber: 3, // 分割数量，会将270度分割为3份，所以有四根线
        detail: false,
        axisLine: {
          show: false,
        },
        axisTick: false,
        splitLine: {
          show: true,
          length: ballSize, // 分割线长度
          lineStyle: {
            shadowBlur: 20, // 阴影渐变
            shadowColor: ballColor, // 阴影颜色
            shadowOffsetY: "0",
            color: ballColor, // 分割线颜色
            width: 4, // 分割线宽度
          },
        },
        axisLabel: false,
      },
      {
        type: "gauge",
        radius: "-20%",
        clockwise: false,
        startAngle: `${45 + leftRotSize * 5}`, // 倾斜45度
        endAngle: `${315 + leftRotSize * 5}`,
        splitNumber: 3,
        detail: false,
        axisLine: {
          show: false,
        },
        axisTick: false,
        splitLine: {
          show: true,
          length: ballSize,
          lineStyle: {
            shadowBlur: 20,
            shadowColor: ballColor,
            shadowOffsetY: "0",
            color: ballColor,
            width: 4,
          },
        },
        axisLabel: false,
      },
    ],
  })
}
// 唤醒
function toSleep() {
  clearInterval(rotTimer)
  document.body.removeEventListener("mousemove", focusOnMouse)
  bigEye.style.transform = `rotateY(0deg) rotateX(0deg)` // 大眼归位
  eyeball.style.transform = `translate(0px, 0px)` // 眼睛归位
  rotTimer = setInterval(() => {
    getEyeballChart()
    if (ballSize > 0) {
      ballSize -= 0.1
    } else {
      if (bigEye) {
        bigEye.className = "eyeSocket eyeSocketSleeping"
      }
    }
    leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1)
  }, 10)
}
function clickToWeakup() {
  isSleep = false // 修改状态
  // bigEye.className = "eyeSocket" // 清除休眠状态
  eyeFilter.style.opacity = "1"
  eyeFilter.className = bigEye.className = "eyeSocket eyeSocketLooking"
  setAngry()
  clearInterval(rotTimer) // 清除定时器
  rotTimer = setInterval(() => {
    getEyeballChart()
    ballSize <= 50 && (ballSize += 1)
    leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.5)
  }, 10)
}
// 生气模式
function setAngry() {
  // 通过js修改body的css变量
  document.body.style.setProperty("--c-eyeSocket", "rgb(255,187,255)")
  document.body.style.setProperty("--c-eyeSocket-outer", "rgb(238,85,135)")
  document.body.style.setProperty("--c-eyeSocket-outer-shadow", "rgb(255, 60, 86)")
  document.body.style.setProperty("--c-eyeSocket-inner", "rgb(208,14,74)")
  ballColor = "rgb(208,14,74)"
}
// 常态模式
function setNormal() {
  document.body.style.setProperty("--c-eyeSocket", "rgb(41, 104, 217)")
  document.body.style.setProperty("--c-eyeSocket-outer", "#02ffff")
  document.body.style.setProperty("--c-eyeSocket-outer-shadow", "transparent")
  document.body.style.setProperty("--c-eyeSocket-inner", "rgb(35, 22, 140)")
  ballColor = "rgb(0,238,255)"
}
// ...其他代码
// 工作
function focusOnMouse(e) {
  // 视口尺寸，获取到整个视口的大小
  let clientWidth = document.body.clientWidth
  let clientHeight = document.body.clientHeight
  // 原点，即bigEye中心位置，页面中心
  let origin = [clientWidth / 2, clientHeight / 2]
  // 鼠标坐标
  let mouseCoords = [e.clientX - origin[0], origin[1] - e.clientY]
  // 旋转角度
  let eyeXDeg = (mouseCoords[1] / clientHeight) * 100 // 这里的80代表的是最上下边缘大眼X轴旋转角度
  let eyeYDeg = (mouseCoords[0] / clientWidth) * 80
  bigEye.style.transform = `rotateY(${eyeYDeg}deg) rotateX(${eyeXDeg}deg)`
  eyeball.style.transform = `translate(${eyeYDeg / 1.5}px, ${-eyeXDeg / 1.5}px)`
  if (sleepTimer) clearTimeout(sleepTimer)
  sleepTimer = setTimeout(() => {
    toSleep()
  }, 3000)
}

onMounted(() => {
  eyeball = document.getElementById("eyeball") // 获取eyeball元素
  bigEye = document.getElementById("bigEye")
  eyeFilter = document.getElementById("eyeFilter")
  bigEye.addEventListener("click", () => {
    if (!isSleep) return
    clickToWeakup()
  })
  // ...其他代码
  bigEye.addEventListener("webkitAnimationEnd", () => {
    // 监听动画结束事件
    new Promise((res) => {
      clearInterval(rotTimer) // 清除定时器
      rotTimer = setInterval(() => {
        getEyeballChart() // 更新视图
        ballSize > 0 && (ballSize -= 0.5) // 眼球尺寸减小
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1)
        if (ballSize === 0) {
          // 当眼球尺寸为0时，将Promise标记为resolved，然后执行后面的代码
          clearInterval(rotTimer)
          res()
        }
      }, 10)
    }).then(() => {
      eyeFilter.style.opacity = "0" // 清除光环
      eyeFilter.className = bigEye.className = "eyeSocket" // 清除环视动画
      setNormal() // 设置常态样式
      document.body.addEventListener("mousemove", focusOnMouse)
      rotTimer = setInterval(() => {
        getEyeballChart()
        ballSize <= 12 && (ballSize += 0.1) // 眼球尺寸缓慢增加
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1)
      }, 10)
    })
  })

  eyeballChart = echarts.init(eyeball) // 初始化画布
  setNormal()
  //   getEyeballChart()
  //   toSleep()
})
</script>

<style lang="less" scoped>
// body {
//     width: 100vw;
//     height: 100vh;
//     overflow: hidden;
// }
@width: 150px;
@height: 150px;
body {
  perspective: 1000px;
  --c-eyeSocket: rgb(41, 104, 217);
  --c-eyeSocket-outer: #02ffff;
  --c-eyeSocket-outer-shadow: transparent;
  --c-eyeSocket-inner: rgb(35, 22, 140);
}
.page {
  width: 100%;
  height: 100%;
  background-color: #1c1d21;
}
.filter {
  width: 100%;
  height: 100%;
  filter: url("#filter");
}
.eyeSocket,
.filter .eyeSocket {
  position: absolute;
  left: calc(50% - @width / 2);
  top: calc(50% - @height / 2);
  width: @width;
  height: @height;
  border-radius: 50%;
  border: 4px solid var(--c--eyeSocket);
  box-shadow: 0px 0px 50px var(--c-eyeSocket-outer-shadow); /* 当生气时添加红色外发光，常态则保持透明 */
  transition: border 0.5s ease-in-out, box-shadow 0.5s ease-in-out; /* 添加过渡效果 */
  z-index: 1;

  &::before,
  &::after {
    position: absolute;
    content: "";
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    box-sizing: border-box;
    transition: all 0.5s ease-in-out;
  }

  &::before {
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    border: 6px solid var(--c-eyeSocket-outer);
  }

  &::after {
    width: 100%;
    height: 100%;
    border: 4px solid var(--c-eyeSocket-inner);
    box-shadow: inset 0px 0px 30px var(--c-eyeSocket-inner);
  }
}

#eyeball {
  width: @width;
  height: @height;
}
@keyframes sleeping {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
.eyeSocketSleeping {
  animation: sleeping 6s infinite;
}
.filter .eyeSocket {
  opacity: 0;
  left: calc(50% - 92px);
  top: calc(50% - 92px);
  transition: all 0.5s ease-in-out;
}

.eyeSocketLooking {
  animation: lookAround 2.5s;
}
@keyframes lookAround {
  0% {
    transform: translateX(0) rotateY(0);
  }

  10% {
    transform: translateX(0) rotateY(0);
  }

  40% {
    transform: translateX(-70px) rotateY(-30deg);
  }

  80% {
    transform: translateX(70px) rotateY(30deg);
  }

  100% {
    transform: translateX(0) rotateY(0);
  }
}
</style>
