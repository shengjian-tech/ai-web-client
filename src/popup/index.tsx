import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@/public/assets/iconfont.css'
import { RouterProvider,BrowserRouter,HashRouter  } from 'react-router-dom';
import { globalRouters } from '@/router';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd'
import { store } from '@/store'
// import reportWebVitals from '../reportWebVitals';

// 引入Ant Design中文语言包
import zhCN from 'antd/locale/zh_CN'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
     <ConfigProvider theme={{components:{InputNumber:{colorBgContainer:"#1B1E1C",colorBorder:"#1B1E1C",colorText:"#FFF"}}}} locale={zhCN}>
     
        <RouterProvider router={globalRouters} />   
        </ConfigProvider>
  </Provider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
