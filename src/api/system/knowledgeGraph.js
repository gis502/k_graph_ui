import request from "@/utils/request.js";

export function getGraphData(){
  return request({
    url: '/graph/getGraph',
    method: 'get',
  });
}

