import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
// import Header from '@/components/header'
import { useSelector } from 'react-redux'
import { Space, theme, ThemeConfig, Button, Switch, Select } from 'antd'

import {
    CaretDownOutlined, 
    UserOutlined,
    SettingOutlined
  } from '@ant-design/icons';

import  './style.less';



interface OptionType {
    value: string;
    label: string;
    icon: JSX.Element;
  }

// 从 Ant Design 中导入主题算法
const Header: React.FC = () => {

    const [selectValue,setSelectValue]=useState('电商客服')

    const currentRouter = useLocation()
    const navigate = useNavigate();
    
    // 处理选择事件
    const handleSelectChange = (val: string) => {
      setSelectValue(val);
      console.log("选择vcal：",val)
      if (val === '电商客服') {
        navigate('/customer');
      } else if (val === '直播互动') {
        navigate('/liveConfig');
      }
    };



      // 组件初始化完成之后，进行一次查询  初始化搜索。
      
    useEffect(() => {
      (async () => {
        await getCurrRouter()
      })();

    
    }, []);

    async function getCurrRouter() {
      console.log("当前路由：-------",currentRouter)
      if (currentRouter.pathname === "/liveConfig") {
        setSelectValue("直播互动")
      } else if (currentRouter.pathname === "/customer") { 
        setSelectValue("电商客服")
      }
    }
  
    
  // const getPrefixIcon = (value:string) => {
  //       switch (value) {
  //         case '电商客服':
  //           return <img/>;
  //         case '直播互动':
  //           return <img/>;
          
  //       }
  //     };
  function linkTorag(){
    chrome.runtime.sendMessage({ type: "openTab", url: "https://www.shengjian.net/front_coze/" });
    // window.open('https://www.shengjian.net/front_coze/', '_blank',"noopener,noreferrer");
  }
     

    return (
        <>
        <div className='header-main-div'>

            <div className='left-header'>
               <img onClick={linkTorag} className="logo-img" src={require('@/public/images/logo.png')} alt=""/> 
          
                <span className='main-title' >盛见AI客服</span>
            </div>

            <div className='right-header'>
              <Link to='/interfaceConfig'><i className="iconfont icon-shezhi shezhi-icon" ></i></Link>

                <Select className='top-select'
                  value={selectValue}
                  placeholder={"请选择配置"}
                  onSelect={handleSelectChange}
                  options={[{label:"电商客服",value:"电商客服"},{label:"直播互动",value:"直播互动"}]}
                  suffixIcon={<CaretDownOutlined style={{color:"#FFF",pointerEvents: "none"}}/>}
                  />
                   


            </div>
          
          
        </div>

        </>

    )
}

export default Header
