<template>
    <div class="page">
        <div class="eyeSocket">
            <div id="eyeball">
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref,inject, onMounted, reactive, nextTick} from "vue"
import * as echarts from 'echarts'
// 画眼球
let eyeball
let eyeballChart:any
function getEyeballChart() {
    eyeballChart.setOption({
        series: [
            {
                type: 'gauge', // 使用仪表盘类型
                radius: '-20%', // 采用负数是为了让分割线从内向外延伸
                clockwise: false,
                startAngle: '0', // 起始角度
                endAngle: '270', // 结束角度
                splitNumber: 3, // 分割数量，会将270度分割为3份，所以有四根线
                detail: false,
                axisLine: {
                    show: false,
                },
                axisTick: false,
                splitLine: {
                    show: true,
                    length: 12, // 分割线长度
                    lineStyle: {
                        shadowBlur: 20, // 阴影渐变
                        shadowColor: 'rgb(0, 238, 255)', // 阴影颜色
                        shadowOffsetY: '0',
                        color: 'rgb(0, 238, 255)', // 分割线颜色
                        width: 4, // 分割线宽度
                    }
                },
                axisLabel: false
            },
            {
                type: 'gauge',
                radius: '-20%',
                clockwise: false,
                startAngle: '45', // 倾斜45度
                endAngle: '315',
                splitNumber: 3,
                detail: false,
                axisLine: {
                    show: false,
                },
                axisTick: false,
                splitLine: {
                    show: true,
                    length: 12,
                    lineStyle: {
                        shadowBlur: 20,
                        shadowColor: 'rgb(0, 238, 255)',
                        shadowOffsetY: '0',
                        color: 'rgb(0, 238, 255)',
                        width: 4,
                    }
                },
                axisLabel: false
            }
        ]
    })
}
onMounted(()=>{
    eyeball = document.getElementById('eyeball'); // 获取eyeball元素
    eyeballChart = echarts.init(eyeball); // 初始化画布
    getEyeballChart();
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
.page {
    width: 100%;
    height: 100%;
    // background-color: #1c1d21;
}

.eyeSocket {
    position: absolute;
    left: calc(50% - @width / 2);
    top: calc(50% - @height / 2);
    width: @width;
    height: @height;
    border-radius: 50%;
    border: 4px solid rgb(41, 104, 217);
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
    }

    &::before {
        width: calc(100% + 20px);
        height: calc(100% + 20px);
        border: 6px solid #02ffff;
    }

    &::after {
        width: 100%;
        height: 100%;
        border: 4px solid rgb(35, 22, 140);
        box-shadow: inset 0px 0px 30px  rgb(35, 22, 140);
    }
}

#eyeball {
    width: @width;
    height: @height;
}
</style>