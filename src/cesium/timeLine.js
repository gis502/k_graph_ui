import * as Cesium from 'cesium'

let timeLine = {
    fly(lng, lat, height) {
        // console.log("this.centerPoint", this.centerPoint)
        // 飞行动画持续时间（秒）
        window.viewer.scene.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                parseFloat(lng),
                parseFloat(lat),
                height),
            orientation: {
                // 指向
                heading: 6.283185307179581,
                // 视角
                pitch: -1.5688168484696687,
                roll: 0.0
            },
            duration: 2 // 飞行动画持续时间（秒）
        });

    },
    addMakerPoint(start, stop, lng, lat, height, img, labeltext, id, plottype,layerName) {
        if(window.viewer&&window.viewer.entities){
            window.viewer.entities.add({
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    // start: Cesium.JulianDate.fromDate(new Date("2022-06-01T15:57:30")),
                    // stop: Cesium.JulianDate.fromDate(new Date("Sat Jun 11 2022 17:00:08 GMT+0800 (China Standard Time)"))
                    start: Cesium.JulianDate.fromDate(new Date(start)),
                    stop: Cesium.JulianDate.fromDate(new Date(stop))
                })]),
                position: Cesium.Cartesian3.fromDegrees(
                    parseFloat(lng),
                    parseFloat(lat),
                    parseFloat( height||0)
                ),
                billboard: {
                    image: img,
                    width: 40,
                    height: 40,
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    depthTest: false,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                },
                label: {
                    text: labeltext,
                    show: true,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.RED,        //字体颜色
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -16),
                },
                id: id,
                plottype: plottype,
                layer: layerName
            })
        }
        // console.log(window.viewer.entities,"window.viewer.entities")

    },
    MiniMapAddMakerPoint(smallViewer,start, stop, lng, lat, height, img, labeltext, id, plottype,layerName) {
        console.log(smallViewer.entities,"smallViewer.entities")
        smallViewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: Cesium.JulianDate.fromDate(new Date(start)),
                stop: Cesium.JulianDate.fromDate(new Date(stop))
            })]),
            position: Cesium.Cartesian3.fromDegrees(
                parseFloat(lng),
                parseFloat(lat),
                parseFloat(height || 0)
            ),
            billboard: {
                image: img,
                width: 40,
                height: 40,
                eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                scale: 0.8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                depthTest: false,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                color: Cesium.Color.WHITE.withAlpha(1),//颜色
            },
            label: {
                text: labeltext,
                show: true,
                font: '14px sans-serif',
                fillColor: Cesium.Color.RED,        //字体颜色
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -16),
            },
            id: id,
            plottype: plottype,
            layer: layerName
        })
    },
}
export default timeLine;
