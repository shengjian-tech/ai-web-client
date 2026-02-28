import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import MainModal from './components/MainModal'
import logo from '@/content/components/images/content-icon.png'

import './style.less'



interface ContentProps {}

function Content(props: ContentProps) {
    const [mainModalVisible, setMainModalVisible] = useState(false);

    chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
        if(request.type==="openWindow"){
            setMainModalVisible(true)
        }
        sendResponse({message:"打开cros弹窗"})
    })



    return (
        <div className="CRX-content">
            <div
                className="content-entry" 
                // style={{position:"fixed",zIndex:999999,bottom:"100px",right:"20px",width:50,height:50,background:`url(${logo})`,backgroundSize:"100% 100%",cursor:"pointer"}}
                onClick={() => setMainModalVisible(true)}
            >
                {/* 这里可以添加触发点击事件的UI元素，例如按钮或图标 */}
               
            </div>
            {/* <ul className="fiexdBut-Menu-div">
                <li>关闭悬浮球</li>
            </ul> */}
            {mainModalVisible && (
                <MainModal
                    onClose={() => setMainModalVisible(false)}
                />
            )}
        </div>
    );
}

// 创建id为CRX-container的div
// const app = document.createElement('div');
// app.id = 'CRX-container';

// // 将刚创建的div插入body最后
// document.body.appendChild(app);

// // 检查容器是否存在，再创建root
// const container = document.getElementById('CRX-container');
// if (container) {
//     const crxContainer = ReactDOM.createRoot(container);
//     crxContainer.render(<Content />);
// } else {
//     console.error('Failed to create root: Container not found.');
// }

// 向目标页面驻入js
try {
    const insertScript = document.createElement('script');
    insertScript.type = 'text/javascript';
    insertScript.src = chrome.runtime.getURL('insert.js');
    document.body.appendChild(insertScript);
} catch (error) {
    console.error('Error inserting script:', error);
}