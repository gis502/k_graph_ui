import request from "@/utils/request.js";

export function getSentimentAnalysisChartData(){
    return request({
        url: '/pythonRun/SentimentAnalysisChartData',
        method: 'get',
    });
}