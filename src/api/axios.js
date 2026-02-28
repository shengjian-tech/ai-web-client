import axios from 'axios'

import { routeProfix ,poxy_url} from '@/utils/config.js'
import { message } from 'antd';


axios.defaults.timeout = 180000
axios.defaults.baseURL = process.env.VUE_APP_BASE_API



//http request
axios.interceptors.request.use(
  (config) => {
    const contentType = config.headers['Content-Type'] || 'application/json;charset=UTF-8'
    config.headers = {
      'Content-Type': contentType,
      jwttoken: localStorage.getItem('token'),
      userId: localStorage.getItem('userid'),
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

//http response
axios.interceptors.response.use(
  (response) => {
    console.log(response, '--response--')
    let data = response.data 
    if (data.statusCode == 401 || response.statusCode == 403) {
      localStorage.clear()
      setTimeout(() => {
        if(window.location.pathname.includes("/login")|| window.location.pathname.includes("/")){
          return response
        }

        window.location.reload()
      }, 1000)
    } else if(response.statusCode ==504){
      message.error('请求超时，请稍等后重试！');
    //   ElMessage({message:"请求超时，请稍等后重试！！",type:"error"})
    } else {
      return response
    }
  },
  (error) => {
    const { response } = error
    if (response) {

      if (response.status == 401 || response.status == 403) {
        // ElMessage({
        //   message: 'Please login again',
        //   type: 'warning',
        // })
        message.warning("请登录")
       
        localStorage.clear()
        setTimeout(() => {
          
         
          //window.location.reload()
        }, 1000)
        return
      }else if(response.status ==504){
        message.error("请求超时，请稍等！！")
        // ElMessage({message:"请求超时，请稍等！！",type:"error"})
      }
      // console.log('response.data.message：',response.data);
      if (response.data.message) {
        // ElMessage({
        //   message: response.data.message,
        //   type: 'error',
        // })
        message.error(response.data.message)
      } else {
        // ElMessage({
        //   message: showMessage(response.status),
        //   type: 'error',
        // })
        message.error(showMessage(response.status))
      }
      return Promise.reject(response.data)
    } else {
    //   ElMessage({
    //     message: 'error! again',
    //     type: 'error',
    //   })
    message.error("error! again")
    }
  }
)

//  GET POST
export function request(url = '', params = {}, type = 'POST',headers) {
    url=poxy_url+url
  //url params type
  return new Promise((resolve, reject) => {
    let promise
    if (type.toUpperCase() === 'GET') {
      promise = axios({
        url,
        params,
      })
    } else if (type.toUpperCase() === 'POST') {
      promise = axios({
        method: 'POST',
        url,
        data: params,
        headers
      })
    }
    promise
      .then((res) => {
        if (res && res.data) {
          resolve(res.data)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}
