import axios from "axios";

let generalCompute = {
    async getReverseGeocode(lon, lat) {
        try {
            const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
                params: {
                    postStr: JSON.stringify({lon, lat, ver: 1}),
                    type: 'geocode',
                    tk: '80eb284748e84ca6c70468c906f0c889'
                }
            });
            // console.log(response,"response")
            return response.data.result.addressComponent;
        } catch (error) {
            console.error("逆地理编码失败:", error);
            return null;
        }
    },
}
export default generalCompute;