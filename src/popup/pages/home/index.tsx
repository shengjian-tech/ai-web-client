import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import Header from '@/components/header'
import { useSelector } from 'react-redux'
import { ConfigProvider, theme,ThemeConfig,Button, Switch  } from 'antd'

import logo from '@/public/images/logo.png'

import backlogo from '@/public/images/backimg-top.png'

import  './style.less';
import { Link } from 'react-router-dom'
import { request } from 'http'



import Footer from '@/popup/components/footer'

// 从 Ant Design 中导入主题算法
const { darkAlgorithm, defaultAlgorithm } = theme

const Home: React.FC = () => {
    // 获得路由钩子
    const location = useLocation()

    // 获取store中的主题配置
    const globalTheme = useSelector((state:any) => state.theme)

     // Ant Design 主题变量
     let antdTheme: ThemeConfig = {
        // 亮色/暗色配置
        algorithm: globalTheme.dark ? darkAlgorithm : defaultAlgorithm,
    }

    // 应用自定义主题色
    if (globalTheme.colorPrimary) {
        antdTheme.token = {
            colorPrimary: globalTheme.colorPrimary,
        }
    }

    function openWin(){
         //开启/关闭pdd自动回复
         console.log("打开天窗")
            // 获取当前活动标签页
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const tabId = tabs[0].id as number;
                
                // 向 content.js 发送消息
                chrome.tabs.sendMessage(tabId, {type:"openWindow"}, function(response) {
                    console.log('pdd是否开启:', response);
                });
            });
    }

    function gotoPopup(router:string){
        //将popup主页改为吓一跳的路由,避免用户关闭插件重新打开后返回"/"的页面
         chrome.action.setPopup({
            popup:`index.html#/${router}`
         })
        console.log("跳转:---",router)
    }

    return (
        <>
        <div className='main-div container'>
            <img className='back-top-img' src={require('@/public/images/backimg-top.png')}/>
            <div className="logo-title-div" >
                <img className="logo-img" src={logo} alt=""/>
                <span className='main-title' >盛见AI客服</span>
            </div>

            <div className='title-div'> <img className="title-img" src={require('@/public/images/bo.png')} alt="" /><span className='title-span'>直播&客服工具</span>&nbsp;&nbsp;<span className='plat-num'>14+</span></div>
            
            <div className='platums-div'>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo' src={require('@/public/images/douyin.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>抖音</div>
                            <div className='platum-t-low'>直播后台</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo' src={require('@/public/images/douyin.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>抖音巨量</div>
                            <div className='platum-t-low'>直播后台</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo' src={require('@/public/images/xiaohongshu.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>小红书</div>
                            <div className='platum-t-low'>直播中控台</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo' src={require('@/public/images/weixin.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>微信小店</div>
                            <div className='platum-t-low'>客服-网页端</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo' src={require('@/public/images/douyin.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>抖音小店</div>
                            <div className='platum-t-low'>飞鸽客服</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-item-cont'>
                        <img className='platum-logo kuaishou-logo' src={require('@/public/images/kuaishou.png')}/>
                        <div className='platum-t'>
                            <div className='platum-t-top'>快手小店</div>
                            <div className='platum-t-low'>直播中控台</div>
                        </div>
                    </div>
                </div>
                <div className='platum-item-div'>
                    <div className='platum-more'>...</div>
                </div>
            </div>
            <div style={{flex:1}}>
                <div className="divider"></div>
            </div>
            <img className='back-low-img' src={require('@/public/images/back-bottom.png')}/>
            <div className='su-div' style={{marginBottom:40}}>
                    <Link to='/customer'><Button className='start-use'>开始使用</Button></Link>
                    {/* <Link to='/liveConfig'><Button>跳转</Button></Link> */}
                
            </div>
            <Footer/>
        </div>

        </>

    )
}

export default Home
