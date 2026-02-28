import { createHashRouter , createBrowserRouter,Navigate } from 'react-router-dom'

import Home from '@/popup/pages/home'

import KfConfig from '@/popup/pages/kfConfig'
import LiveConfig from '../popup/pages/liveConfig'
import Customer from '../popup/pages/customer'
import Login  from '../popup/pages/login'
import InterfaceConfig from "../popup/pages/interfaceConfig";
import Index from "../popup/pages/index";
import { globalConfig } from '@/globalConfig'

import {PrivateRoute} from './AuthRouter'

// 全局路由
const routeConfigs  = [
    // 对精确匹配"/login"，跳转Login页面
    // {
    //     path: '/login',
    //     element: <Login />,
    // },
    // 登录页功能临时注释，保留原配置方便后续恢复
    // {
    //     path: '/login',
    //     component:Login ,
    //     auth:false
    // },
    {
        path: '/login',
        component: () => <Navigate to="/customer" replace />, // 兼容旧地址，直接进入主页面
        auth: false

        // element: <Home />,
        // 定义entry二级路由
        // children: [
        //     {
        //         path: '/kfConfig',
        //         element: <KfConfig />,
        //     },

        // ],
    },
    {
        path: '/',
        component: Index, 
        auth: true,
        children:[
            {
                index: true,
                element: <Navigate to="/customer" replace />,  // 改用绝对路径
                auth: null  // 跳过二级路由守卫
            },
            {
         
                path: 'customer',
                component: Customer, 
                auth: true,
            },
            {
                path: 'liveConfig',
                component: LiveConfig ,
                auth: true,
            },
            {
                path: 'interfaceConfig',
                component: InterfaceConfig,
                auth: true,
            }
        ]
    },
    {
        path: '*',
        // component: () => <Navigate to="/login" />, // 404 路由重定向到登录页
        component: () => <Navigate to="/customer" replace />, // 登录关闭后统一进入主页面
        auth: false
    },
    
]
console.log("路由----")

  // 新增高阶组件
//   const withAuth = (Component: ReactElement) => {
//     return <PrivateRoute>{Component}</PrivateRoute>;
//   };

// 生成路由规则
// export const globalRouters = createHashRouter(
//     routeConfigs.map(config => ({
//         path: config.path,
//         element: config.auth ? (
//             <PrivateRoute>
//                 <config.component />
//             </PrivateRoute>
//         ) : (
//             <config.component />  // 移除行末多余逗号
//         ),  // 保持对象属性分隔逗号
//         children: config.children?.map(child => ({
//             path: child.path.replace(/^\//, ''),
//             element: child.auth ? (
//                 <PrivateRoute>
//                     <child.component />
//                 </PrivateRoute>
//             ) : (
//                 <child.component />
//             )
//         }))
//     }))
// );
// 修改子路由处理逻辑

// export const globalRouters = createHashRouter(
//     routeConfigs.map(config => ({
//         path: config.path,
//         element: config.auth ? (
//             <PrivateRoute>
//                 <config.component />
//             </PrivateRoute>
//         ) : (
//             <config.component />
//         ),
//         children: config.children?.map(child => ({
//             path: child.path,
//             element: (child.auth !== null && config.auth) ? (  // 新增空值判断
//                 <PrivateRoute>
//                     {child.element || <child.component />}
//                 </PrivateRoute>
//             ) : (
//                 child.element || <child.component />
//             )
//         }))
//     }))
// );
export const globalRouters = createHashRouter(
    routeConfigs.map(config => ({
      path: config.path,
      element: config.auth ? (
        <PrivateRoute>
          <config.component />
        </PrivateRoute>
      ) : (
        <config.component />
      ),
      children: config.children?.map(child => ({
        // 如果 child.index 为 true，则添加 index 属性，并且不设置 path
        ...(child.index ? { index: true } : { path: child.path }),
        element: child.element ? (
          child.auth ? (
            <PrivateRoute>
              {child.element}
            </PrivateRoute>
          ) : child.element
        ) : (
          child.auth ? (
            <PrivateRoute>
              <child.component />
            </PrivateRoute>
          ) : (
            <child.component />
          )
        )
      }))
    }))
  );