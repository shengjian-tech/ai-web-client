import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import Header from '@/components/header'
import { useSelector } from 'react-redux'
import { Space, theme,ThemeConfig,Button, Switch, Select  } from 'antd'

import {
    CaretDownOutlined, 
    UserOutlined,
    SettingOutlined
  } from '@ant-design/icons';

import  './style.less';



// 从 Ant Design 中导入主题算法
const TagMenu: React.FC<{ tag: (va: string) => void; selectedTag: string; showIgnoreRule?: boolean;}> = ({ tag, selectedTag, showIgnoreRule }) => {


    const currentRouter=useLocation()
    // 处理选择事件



      // 组件初始化完成之后，进行一次查询  初始化搜索。
      
    useEffect(() => {
      (async () => {
        // await getCurrRouter()
      })();

    
    }, []);


    const userSelect=(va:string)=>{
      tag(va)
    }

    //判断选中的是哪个按钮
    const isActive = (tagValue: string) => {
      return selectedTag === tagValue ? 'active' : '';
    };
  

    return (
        <>
        <div className='tag-menu-div'>
          <div className={`tag-menu-item ${isActive('wenben')}`}  onClick={()=>{userSelect("wenben")}}>
            <i className="iconfont icon-W i-div" ></i>
            <span className='menu-item-title'>文本配置</span>
          </div>

          <div className={`tag-menu-item ${isActive('pinlv')}`}  onClick={()=>{userSelect("pinlv")}}>
            <i className="iconfont icon-fenzutongji i-div" ></i>
            <span className='menu-item-title'>频率配置</span>
          </div>
          {showIgnoreRule && (
            <div className={`tag-menu-item ${isActive('hulve')}`}  onClick={()=>{userSelect("hulve")}}>
              <i className="iconfont icon-hulve i-div " ></i>
              <span className='menu-item-title'>忽略规则</span>
            </div>
          )}
          
        </div>

        </>

    )
}

export default TagMenu
