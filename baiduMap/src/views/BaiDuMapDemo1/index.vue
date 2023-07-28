<template>
    <div class="page">
        <div class="box1">
            <button @click="changeCurrent(0)">全部</button>
            <button @click="changeCurrent(1)">1</button>
            <button @click="changeCurrent(2)">2</button>
            <button @click="changeCurrent(3)">3</button>
            <div>current:{{ current.type }}</div>
        </div>
        <div id="allmap" style="width: 100%; height: 100%"></div>
    </div>
</template>
<script lang="ts">
import { nextTick, reactive, ref, onMounted } from "vue";
import { Scene, Info, MyPoints } from "./interface"

declare const BMapGL: any;
export default {
    setup() {
        let map: any = null
        const current = reactive({
            type: 0,
            bgColor: ""
        })
        // 数据源
        let myPoints: MyPoints[] = [];
        /**
         * @method 切换应用场景
         * @param type number
         */
        const changeCurrent = (type: number) => {
            current.type = type || 0;
            // 清除所有的点
            clearPoints()
            // 渲染标点
            initPoints()
            // 添加波纹
            addWaves()
        };
        /**
         * @param 一个基于紧急程度的字典
         * 0-不急 1-有点急 2-急急急
         */
        const pointDist: any = {
            0: {
                "urgency": "一般",
                "color": "gray",
                "point": require("@/assets/BaiDuMapDemo1/grayPoint.png"),
                "bg": require("@/assets/BaiDuMapDemo1/grayPoint.png"),
            },
            1: {
                "urgency": "故障",
                "color": "orange",
                "point": require("@/assets/BaiDuMapDemo1/orangePoint.png"),
                "bg": require("@/assets/BaiDuMapDemo1/orangePoint.png"),
            },
            2: {
                "urgency": "报警",
                "color": "red",
                "point": require("@/assets/BaiDuMapDemo1/redPoint.png"),
                "bg": require("@/assets/BaiDuMapDemo1/redPoint.png"),
            },
        }
        /**
         * @method 从接口获取数据，顺便格式化
         */
        const getPoints = () => {
            myPoints = [{
                lat: 31.333788784811513,
                lng: 120.61813444411929,
                info: {
                    urgency: 0,
                    scene: 1
                },
            },
            {
                lat: 31.332288784821513,
                lng: 120.61823444421929,
                info: {
                    urgency: 1,
                    scene: 1
                },
            },
            {
                lat: 31.333288784831513,
                lng: 120.61833444431929,
                info: {
                    urgency: 2,
                    scene: 1
                },
            },
            {
                lat: 31.334288784841513,
                lng: 120.61843444441929,
                info: {
                    urgency: 2,
                    scene: 2
                },
            },
            {
                lat: 31.333288784851513,
                lng: 120.61853444451929,
                info: {
                    urgency: 2,
                    scene: 3
                },
            }]
            myPoints.forEach((v: MyPoints) => {
                v.info.color = pointDist[v.info.urgency]["color"]
                v.info.urgencyLabel = pointDist[v.info.urgency]["urgency"]
            })
        }
        /**
         * @method 为标点增加波纹
         * tip:不加setTimeout的话，point.markers.domElement是null
         */
        const addWaves = () => {
            setTimeout(() => {
                myPoints.filter((point: MyPoints) => {
                    if (current.type === 0) {
                        return true
                    } else {
                        return point.info.scene === current.type
                    }
                }).forEach((point: MyPoints) => {
                    let divElement = document.createElement('div');
                    divElement.className = 'before';
                    let divElement2 = document.createElement('div');
                    divElement2.className = 'after';
                    point.markers.domElement.innerHtml = point.markers.domElement.childNodes[0];
                    point.markers.domElement.appendChild(divElement);
                    point.markers.domElement.appendChild(divElement2);
                    point.markers.domElement.className = '';
                    point.markers.domElement.className = `dot ${point.info?.color || ""}`;
                    point.markers.domElement.style.overflow = '';
                    point.markers.domElement.firstChild.style.position = 'relative';
                    point.markers.domElement.firstChild.style.zIndex = '5';
                })
            }, 1000);
        }
        /**
         * @method 刷新标点
         */
        const initPoints = () => {
            myPoints.filter((point: MyPoints) => {
                if (current.type === 0) {
                    return true
                } else {
                    return point.info.scene === current.type
                }
            }).forEach((point: MyPoints) => {
                const pt = new BMapGL.Point(point.lng, point.lat);
                const myIcon = new BMapGL.Icon(
                    pointDist[point.info.urgency]["point"],
                    new BMapGL.Size(22, 22)
                );
                const markers = new BMapGL.Marker(pt, { icon: myIcon });
                // 点击事件
                markers.addEventListener("click", () => {
                    //创建信息窗口
                    const sContent = `<div class='infoBox'>
                                        <div>设备编号：设备编号</div>
                                        <div>设备名称：设备名称</div>
                                        <div>设备类型：设备类型</div>
                                        <div>设备地址：设备地址</div>
                                        <div>告警时间：告警时间</div>
                                      </div>`;
                    var opts = {
                        width: 180,
                        title: `<div class='placebox'>${point.info?.urgencyLabel || ''}</div>`,
                        offset: new BMapGL.Size(120, 125),
                        customContent: sContent,
                        enableMessage: false,
                    };
                    current.bgColor = point.info?.color || "gray"
                    const infoWindow = new BMapGL.InfoWindow(sContent, opts);
                    infoWindow.setStyle;
                    markers.openInfoWindow(infoWindow);

                    // 根据情况配置不同的背景
                    nextTick(() => {
                        const BMap_bubble_pop: any = document.getElementsByClassName('BMap_bubble_pop')[0]
                        if (BMap_bubble_pop) {
                            BMap_bubble_pop.className = `BMap_bubble_pop set-${current.bgColor}-bg`
                        } else {
                            // 第一次dom未创建完毕，用settimeout延迟取
                            setTimeout(() => {
                                document.getElementsByClassName('BMap_bubble_pop')[0].className = `BMap_bubble_pop set-${current.bgColor}-bg`
                            }, 200)
                        }
                    })
                });
                point.markers = markers
                map.addOverlay(markers);

            });
        }
        /**
         * @method 清除所有的点
         */
        const clearPoints = () => {
            var allOverlay = map.getOverlays();
            for (var i = 0; i < allOverlay.length; i++) {
                map.removeOverlay(allOverlay[i]);
            }
        }
        onMounted(async () => {
            map = new BMapGL.Map("allmap");
            map.centerAndZoom(new BMapGL.Point(120.61853444411929, 31.334288784861513), 19);
            map.enableScrollWheelZoom(true);
            // map.disableContinuousZoom(); //禁止双击平滑缩放
            // map.disableDoubleClickZoom(); //禁止双击缩放
            map.enableAutoResize(); //自动适应容器尺寸
            map.setHeading(200); //旋转角度
            map.setTilt(35); //倾斜角度
            map.setMapStyleV2({
                styleId: "b17d80dbaf5f4997ad757230bca4444f",
            });
            // 从接口获取数据
            await getPoints()
            // 清除所有的点
            clearPoints()
            // 渲染标点
            initPoints()
            // 添加波纹
            addWaves()
        });
        return {
            current,
            changeCurrent,
        };
    },
};
</script>

<style lang="less" scoped>
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
    width: 266px !important;
    height: 208px !important;
    background-size: 100% 100% !important;
    background-color: transparent !important;
    border-radius: 0 !important;
    border: none !important;

    img {
        display: none;
    }
}

:deep(.set-orange-bg) {
    background-image: url("~@/assets/BaiDuMapDemo1/orangeBg.png");
}

:deep(.set-red-bg) {
    background-image: url("~@/assets/BaiDuMapDemo1/redBg.png");
}

:deep(.set-gray-bg) {
    background-image: url("~@/assets/BaiDuMapDemo1/grayBg.png");
}

:deep(.anchorBL) {
    display: none;
}

:deep(.BMap_bottom) {
    display: none;
}

:deep(.BMap_bubble_content) {
    width: 180px !important;
    height: 158px !important;
    color: #ffffff !important;
    font-size: 14;

    .infoBox {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }
}

:deep(.placebox) {
    font-size: 16px !important;
    letter-spacing: 2px;
    color: #ffffff;
    font-weight: bold;
}
</style>
