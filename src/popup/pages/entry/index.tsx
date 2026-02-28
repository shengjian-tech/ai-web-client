import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import Header from '@/components/header'
// import { useSelector } from 'react-redux'
import { theme } from 'antd'

import Header from '../../components/header'

import './style.less'
// import { RootState } from '../../../store' // 假设 store 中的 root state 类型定义在这里

// 从 Ant Design 中导入主题算法
const { darkAlgorithm, defaultAlgorithm } = theme

const LiveConfig: React.FC = () => {


    // 获取当前路径
  
    return (
        <>
        <div style={{backgroundColor:"#000"}}>
            <Header />

        </div>
            

            
        </>

    )
}

export default LiveConfig
