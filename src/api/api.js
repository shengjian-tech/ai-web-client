  
  import { request } from './axios'
  import { interfacePrefix } from '@/utils/config.js'
  
  export class landRelevant {

     //知识库登录
  static async loginApi(params) {
    return request(`${interfacePrefix}/api/system/login`, params, 'post')
  }

   //验证码
  static async verificationCode(params) {
    return request(`${interfacePrefix}/api/system/verificationCode?verType=${params}`, "", "post");
  }

  }
  
 