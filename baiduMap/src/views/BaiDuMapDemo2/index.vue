<!-- 预警中心-地图 -->
<!-- websocket 网关连不上。5s一个定时器取数据，问题多多。 -->
<!-- TODO: 内存泄漏问题。每当定时器获取一次数据，目前把旧的点隐藏，时间一长就出问题。如果需要就从clearPoints的map.removeOverla着手吧~ -->
<template>
  <div class="page">
    <div class="box1" v-if="status.isDev">
      <h4>本地环境专用(控制台)</h4>
      <div class="btn" @click="getData('single')">每个点一条数据</div>
      <div class="btn" @click="getData('double')">一条浮窗预警、每个点两条数据</div>
      <div class="btn" @click="getData('half')">两条浮窗预警、每个点一半数据</div>
      <div class="btn" @click="getData()">两条浮窗预警、每个点完整数据</div>
      <div class="btn" @click="clearWarningSign()">重新展示未处理的预警浮窗，每个点完整数据</div>
    </div>
    <WarningPopup ref="WarningPopupRef" @warningStatus="warningStatus"></WarningPopup>
    <div class="flash" @click="clearWarningSign()"></div>
    <div id="allmap" :class="warnColor"></div>
  </div>
  <!-- <SecondPage ref="SecondRef" :visible="visible"></SecondPage> -->
</template>

<script lang="ts">
import { nextTick, ref, onMounted, reactive, inject } from "vue";
import { MyPoints } from "./warninterface";
import { getWarningEventMap } from "./data";
import dayjs from "dayjs";
// import SecondPage from "./SecondPage.vue";
import WarningPopup from "./warningPopup.vue";
import { buildingLabelList } from "./data";

declare const BMapGL: any;
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: { WarningPopup },
  setup() {
    const status = reactive({
      markerClicked: false,
      audio: new Audio(require("@/assets/BaiDuMapDemo2/alarm.mp3")),
      myPoints: [] as any[],
      isDev: inject("$isDev"),
    });
    const warnColor = ref();
    let map: any = null;
    // 数据源
    // 显隐状态
    const SecondRef = ref();
    const WarningPopupRef = ref();
    /**
     * @method 从接口获取数据，顺便格式化
     */
    const addWaves = () => {
      setTimeout(() => {
        status.myPoints?.forEach((point: MyPoints) => {
          // 是否含有特大预警
          const isWarning = point.warningEventRspList.some((v: any) => v.warningGrade === "特大预警");
          let divElement = document.createElement("div");

          divElement.className = "before";
          let divElement2 = document.createElement("div");
          divElement2.className = "after";
          point.markers.domElement.innerHtml = point.markers.domElement.childNodes[0];
          point.markers.domElement.appendChild(divElement);
          point.markers.domElement.appendChild(divElement2);
          point.markers.domElement.className = "";
          point.markers.domElement.className = "dot";
          if (isWarning) {
            point.markers.domElement.className += " dot-warning";
          }
          point.markers.domElement.style.overflow = "";
          point.markers.domElement.firstChild.style.position = "relative";
          point.markers.domElement.firstChild.style.zIndex = "5";
        });
      }, 1000);
    };
    function addLabel() {
      // 将标注添加到地图中
      for (var i = 0; i < buildingLabelList.length; i++) {
        var point = new BMapGL.Point(buildingLabelList[i].lng, buildingLabelList[i].lat);
        var label = new BMapGL.Label(buildingLabelList[i].label, {
          position: point, // 设置标注的地理位置
          offset: new BMapGL.Size(-30, -12), // 设置标注的偏移量
        });
        map.addOverlay(label);
        label.setStyle({
          // 设置label的样式
          color: "#fff",
          fontSize: "15px",
          backgroundColor: "transparent",
          border: "none",
          // fontWeight: "bold",
        });
      }
    }
    // 模拟数据
    const filterData = (type: string) => {
      status.myPoints?.forEach((point: any) => {
        const len = point?.warningEventRspList?.length || 0;
        point.warningEventRspList = point.warningEventRspList.filter((item: any, index: any) => {
          if (type === "single") {
            return index === 0;
          } else if (type === "double") {
            return index <= 1;
          } else if (type === "half") {
            return index < len / 2;
          }
        });
      });
    };
    // 警告状态，红框闪烁+报警声音n秒
    const warningStatus = (type = "open") => {
      if (type === "open") {
        warnColor.value = "warnColor";
        status.audio.play();
        setTimeout(() => {
          warningStatus("close");
        }, 8000);
      } else if (type === "close") {
        // warnColor.value = "";
        status.audio.pause(); //清除音频播放
        status.audio.currentTime = 0;
      } else if (type === "closeAll") {
        warnColor.value = "";
        status.audio.pause(); //清除音频播放
        status.audio.currentTime = 0;
      }
    };
    // 获取数据
    const getData = async (type = "all") => {
      const response = getWarningEventMap;
      clearPoints();
      console.log("getData：", response);
      status.myPoints = response.data || [];
      type !== "all" && filterData(type);
      console.log(status.myPoints);

      WarningPopupRef.value?.update(status.myPoints);
      nextTick(() => {
        status.myPoints?.forEach((point: any) => {
          const pt = new BMapGL.Point(Number(point.longitude), Number(point.latitude));
          // 是否含有特大预警
          const isWarning = point.warningEventRspList.some((v: any) => v.warningGrade === "特大预警");
          const iconImg = require(`@/assets/BaiDuMapDemo2/${isWarning ? "突发预警" : "普通定位"}.png`);
          const myIcon = new BMapGL.Icon(iconImg, new BMapGL.Size(32, 52), {
            anchor: new BMapGL.Size(16, 50),
          });
          // const myIcon = new BMapGL.Icon(require("@/assets/marker.png"), new BMapGL.Size(46, 64));
          const markers = new BMapGL.Marker(pt, { icon: myIcon });
          // 点击事件
          markers.addEventListener("click", () => {
            status.markerClicked = true;
            //播放警报
            // status.audio.play();
            //创建信息窗口
            let sContent = ``;
            for (let i = 0; i < point.warningEventRspList.length; i++) {
              if (point.warningEventRspList.length == 0) {
                sContent += `<div class="testbox">
                              暂无数据
                              </div>`;
              } else {
                const item = point.warningEventRspList[i];

                sContent += `<div class="testbox">
                                <div class="infobox">
                                  <div class="titlebox">
                                    <div class="title" style='font-size:16px'>${item.warningType}</div>
                                    <div class="status">${item.warningGrade}</div>
                                  </div>
                                  <div class="info">
                                    <div>人员:${item.studentName || "陌生人"}</div>
                                    <div>地点:${item.eventAddress || ""}</div>
                                    <div>设备:${item.deviceName || ""}</div>
                                    <div>时间:${dayjs(item.createTime).format("YYYY-MM-DD HH:mm")}</div>
                                  </div>
                                </div>
                            </div>`;
                if (item.warningGrade === "较重预警") {
                  item.bgColor = "yellow";
                } else if (item.warningGrade === "严重预警") {
                  item.bgColor = "orange";
                } else if (item.warningGrade === "特大预警") {
                  item.bgColor = "red";
                } else if (item.warningGrade === "一般预警") {
                  item.bgColor = "blue";
                }
              }
              // 根据情况配置不同的背景
              nextTick(() => {
                const testbox: any = document.getElementsByClassName("testbox");
                if (testbox?.length) {
                  Array.from(testbox).forEach((item: any, index: number) => {
                    item.className = `testbox set-${point.warningEventRspList[index].bgColor}-bg`;
                  });
                } else {
                  // 第一次dom未创建完毕，用settimeout延迟取
                  setTimeout(() => {
                    const testbox: any = document.getElementsByClassName("testbox");
                    Array.from(testbox).forEach((item: any, index: number) => {
                      item.className = `testbox set-${point.warningEventRspList[index].bgColor}-bg`;
                    });
                  }, 100);
                }
              });
            }
            var opts = {
              width: 300,
              title: "",
              offset: new BMapGL.Size(150, 200),
              customContent: sContent,
              enableMessage: false,
            };

            const infoWindow = new BMapGL.InfoWindow(sContent, opts);
            infoWindow.setStyle;
            markers.openInfoWindow(infoWindow);
            // warnColor.value = "warnColor";

            //需要延时器等坐标点创建完成
            setTimeout(() => {
              const statusSpans: any = document.querySelectorAll(".status");
              statusSpans.forEach((statusSpan: any, index: number) => {
                statusSpan.addEventListener("click", (event: any) => {
                  const ids: any = point.warningEventRspList[index].id;
                  console.log(ids);
                  if (SecondRef.value) {
                    SecondRef.value.open(ids);
                  }
                });
              });
            }, 500);
          });
          point.markers = markers;
          map.addOverlay(markers);
        });
        nextTick(() => {
          addWaves();
        });
      });
    };
    /**
     * @method 清除所有的点
     */
    const clearPoints = () => {
      status.myPoints?.forEach((point: MyPoints) => {
        point.markers.domElement.className = "";
        point.markers.domElement = null;
        point.markers._config.icon.imageUrl = null;
        point.markers._visible = false;
      });
      // status.myPoints = [];
      // var allOverlay = map.getOverlays();
      // for (var i = 0; i < allOverlay.length; i++) {
      //   map.removeOverlay(allOverlay[i]);
      // }
    };
    const mapInit = () => {
      map = new BMapGL.Map("allmap");
      map.centerAndZoom(new BMapGL.Point(120.565342, 27.9765), 19);
      map.disableContinuousZoom(); //禁止双击平滑缩放
      map.disableDoubleClickZoom(); //禁止双击缩放
      map.enableAutoResize(); //自动适应容器尺寸
      map.setHeading(200); //旋转角度
      map.setTilt(35); //倾斜角度
      map.setMapStyleV2({
        styleId: "10f3d969edfe6c0f79787a87a5abda01",
      });
      addLabel();
    };
    // 清除浮窗标记，并重新显示未处理的特大预警浮窗
    const clearWarningSign = async () => {
      WarningPopupRef.value?.clearSign();
      await getData();
    };
    onMounted(async () => {
      mapInit();
      // 本地环境手动刷新数据，避免定时器带来的dom操作影响调试
      // 生产环境定时器
      if (status.isDev) {
        await getData();
      } else {
        await getData();
        setInterval(() => {
          getData();
        }, 5000);
      }
      // await getData();
      // setTimeout(()=> {
      //   clearWarningSign();

      // },)
    });
    return {
      status,
      warnColor,
      SecondRef,
      WarningPopupRef,
      warningStatus,
      getData,
      clearWarningSign,
    };
  },
};
</script>

<style scoped lang="less">
@import "./index.css";
body,
html,
#allmap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#allmap {
  margin: 0 auto;
}
:deep(.BMap_bubble_pop) {
  width: 300px !important;
  background: url("~@/assets/BaiDuMapDemo2/dilog.png") !important;
  background-size: 100% 100% !important;
  border-radius: 0 !important;
  border: none !important;
  box-sizing: border-box !important;
  padding: 10px !important;

  img {
    display: none;
  }
}

:deep(.BMap_bubble_top) {
  width: 100% !important;
  height: 0px !important;
}
:deep(.BMap_bubble_center) {
  width: 100% !important;
}
:deep(.BMap_bubble_content) {
  width: 100% !important;
  color: #ffffff !important;
  font-size: 14;
  padding: 10px 10px !important;
  top: 0px !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;

  .infobox {
    width: 100%;
    height: 180px;
    padding: 0px 10px;
    box-sizing: border-box;

    .titlebox {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 20px;
      padding-top: 5px;
    }
    .status {
      cursor: pointer;
      background: transparent;
      width: auto;
      height: 24px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px;
    }
    .info {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
  .set-orange-bg {
    background-image: url("~@/assets/BaiDuMapDemo2/orangeBg.png");
    .status {
      border: 1px solid #f17d21;
      color: #f17d21;
    }
  }
  .set-yellow-bg {
    background-image: url("~@/assets/BaiDuMapDemo2/yellowBg.png");
    .status {
      border: 1px solid #dcab1b;
      color: #dcab1b;
    }
  }

  .set-red-bg {
    background-image: url("~@/assets/BaiDuMapDemo2/redBg.png");
    .status {
      border: 1px solid #f42a2a;
      color: #f42a2a;
    }
  }

  .set-blue-bg {
    background-image: url("~@/assets/BaiDuMapDemo2/blueBg.png");
    .status {
      border: 1px solid #229fe5;
      color: #229fe5;
    }
  }
}
:deep(.BMap_bubble_content::-webkit-scrollbar) {
  width: 15px;
}
:deep(.BMap_bubble_content::-webkit-scrollbar-thumb) {
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #b51e29;
}

::v-deep .BMap_cpyCtrl {
  display: none;
}
::v-deep .anchorBL {
  display: none;
}
::v-deep .BMap_bottom {
  display: none;
}

:deep .BMap_bubble_title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .placebox {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
  }
  .status {
    background: #4f2a1a !important;
    width: auto;
    height: 24px;
    border: 1px solid #ff0000;
    border-radius: 10px;
    color: red;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0px 5px;
  }
}
.warnColor::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, transparent, transparent, #59121a);
  pointer-events: none;
  z-index: 2;
  animation: color 1.5s infinite;
}

@keyframes color {
  0% {
    background: transparent;
  }
  50%,
  75% {
    background: radial-gradient(circle at 50% 50%, transparent, transparent, #59121a);
  }
  78%,
  100% {
    background: radial-gradient(circle at 50% 50%, transparent, transparent, #59121a);
  }
}
</style>
