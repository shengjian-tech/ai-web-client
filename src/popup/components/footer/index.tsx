import React, { useEffect, useState } from 'react'
import {  useLocation } from 'react-router-dom'
// import Header from '@/components/header'
import { useSelector } from 'react-redux'






import  './style.less';
import { Button } from 'antd';
import { Link } from 'react-router-dom';





const Footer: React.FC = () => {

    const currentRouter=useLocation()

    useEffect(() => {
        (async () => {
           await getCurrRouter()
        })();
  
      
      }, []);
  
      //获取当前路由
     async function getCurrRouter() {
        console.log("当前路由：-------",currentRouter)
      if(currentRouter.pathname!="=/"){
            
      }
     }

    return (
        <>

        <div className='footer-div'>
            
            <div>版本号 v1.0.1&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; <a className='pho-me-div' href='https://shengjian.net/front_coze/' target='_blank'>联系我们</a> </div>


        </div>
             
        </>

    )
}

export default Footer
