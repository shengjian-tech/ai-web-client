import React, { useEffect, useState } from 'react'
import { Button, Form,Input ,message  } from 'antd'

import type { FormProps } from 'antd';

import Footer from '@/popup/components/footer'
import { SHA3 } from 'sha3';  // 引入 sha3.js
import  './style.less';
import { landRelevant } from '@/api/api';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { jwtDecode } from 'jwt-decode';

type FieldType = {
    username: string;
    password: string;
    code: string;
  };




const Login: React.FC = () => {


const [imageUrl,setImageUrl] =useState<string>('')
const [messageApi, contextHolder] = message.useMessage();

const navigate = useNavigate();
      
const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const sha3 = new SHA3(512);  // 创建 SHA3 实例，选择位数(224, 256, 384, 512)
     //加密用户的输入密码
     
     sha3.update(values.password,"utf-8");  // 更新待哈希字符串
     //获取加密后的密码
     const hashPassword=sha3.digest('hex')
    console.log('Success:', values);
    let par={
        account:values.username,
        password:hashPassword,
        code:values.code
    }
    landRelevant.loginApi(par).then((res)=>{
        console.log("res:---->",res)
        const data=res.data
        // const userinfo = data.user
        if(res.statusCode==200){
 
            localStorage.setItem('token', data.jwttoken.access_token)
            const token =data.jwttoken.access_token

            const decodedToken = jwtDecode(token);
            console.log("decodedToken:---->",decodedToken)
            
            const expirationTime = decodedToken.exp ? decodedToken.exp * 1000 : Date.now() + 9 * 60 * 60 * 1000;
            localStorage.setItem('exp_token', String(expirationTime))
            
            localStorage.setItem('userInfo', JSON.stringify(data.user))
            messageApi.success(res.message)
            setTimeout(() => {
                navigate('/customer', { replace: false });
            }, 1200);
           
        }else{
            messageApi.error(res.message)
        }
        
    }
    ).catch((e)=>{
        console.log("errorrrrr:---->",e)
    })
};

// 设置缓存，包含过期时间
async function setCache(key:string, value:string, ttl = 60 * 60 * 1000) { // 默认过期时间为 1 小时（毫秒）
    const now = Date.now(); // 获取当前时间戳
    const expiresAt = now + ttl; // 计算过期时间

    // 将数据和过期时间一起存储
    await localforage.setItem(key, { value, expiresAt });
}
      
const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
console.log('Failed:', errorInfo);
};

const linkToForgetPass=()=>{
    window.open('https://shengjian.net/front_coze/', '_blank');
}
    
const linkToRegister=()=>{
    window.open('https://shengjian.net/front_coze/', '_blank');
}

  //获取验证码
  const getCode = () => { 
    
    landRelevant.verificationCode(0).then((res) => { 
      // 更新 Vue 组件中的图片 URL
      setImageUrl('data:image/png;base64,'+res.data) ;
    }).catch(e=>{
        messageApi.error(e)
    })
  }

  
  useEffect(()=>{
    getCode()
  },[])// 空数组表示只在组件挂载时运行一次


   

    return (
        <>
        {contextHolder}
        <div className='main-div container'>
            <img className='back-top-img' src={require('@/public/images/backimg-top.png')}/>

            <div className='login-box'>
                <div className='lo-title'>账号登录</div>
                <div className='login-form'>
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item<FieldType>
                        // label={<><div className='formItem_title'>账号</div></>}
                        name="username"
                        rules={[{ required: true, message: '请输入账号!' }]}
                        >
                        
                        <Input className='form-input' size="large"  prefix={<><div className='formItem_title'>账号：</div></>} placeholder='请输入账号'/>
                        </Form.Item>

                        <Form.Item<FieldType>
                        // label={<><div className='formItem_title'>密码</div></>}
                        name="password"
                        rules={[{ required: true, message: '请输入密码！' }]}
                        >
                        <Input.Password className='form-input' size="large"  prefix={<><div className='formItem_title'>密码：</div></>} placeholder='请输入密码'/>
                        </Form.Item>

                        <Form.Item<FieldType>
                        // label={<><div className='formItem_title'>密码</div></>}
                        name="code"
                        rules={[{ required: true, message: '请输入验证码！' }]}
                        >
                            <div className='code-div'>
                                <Input className='form-input' size="large"  prefix={<><div className='formItem_title'>验证码：</div></>} placeholder='请输入验证码'/>

                                <img  src={imageUrl} alt="验证码" onClick={()=>getCode()} title="点击刷新验证码"/>
                            </div>
                       
                        </Form.Item>




                        <Form.Item >
                        <Button className='login-button' type="primary" htmlType="submit">
                            立即登录
                        </Button>
                        </Form.Item>
                    </Form>

                </div>
                <div className='login-ot-div'>
                    <div className='ot-sp' onClick={linkToForgetPass}>忘记密码？</div>
                    <div className='ot-sp' onClick={linkToRegister}>我要注册？</div>

                </div>

            </div>

           
            <Footer/>
        </div>

        </>

    )
}

export default Login
