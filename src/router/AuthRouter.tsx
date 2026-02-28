import { useLocation  ,Navigate} from 'react-router-dom';
import { ReactElement, useEffect,useState } from 'react';
import localforage from 'localforage';




  
// 路由守卫函数
export function PrivateRoute({ children}: { element: ReactElement | null; [key: string]: any }) {
    const location = useLocation();
    const [authStatus, setAuthStatus] = useState<boolean | null>(true);

    // 登录功能临时注释：当前版本所有用户默认放行，不再校验 token。
    // 添加异步验证
    // console.log("路由守卫：",children)
    // useEffect(() => {
    //     const checkAuth = () => {
    //         const isValid = authExp('token');
    //         setAuthStatus(isValid);
    //     };
    //     checkAuth();
    // }, [location]); // 监听路由变化

    // 保留路由变化监听，避免 location 变量未使用。
    useEffect(() => {
        setAuthStatus(true);
    }, [location]);

    // 主要问题修复：返回element而不是rest
    // if (authStatus === null) {
    //     return <div>权限验证中...</div>;
    // }

    // if (!authStatus) {
    //     console.log("未登录，跳转到登录页面");
    //     return <Navigate to="/login" state={{ from: location }} replace />;
    // }
    console.log("已登录，显示路由内容",children);
    // 正确返回路由元素
    return children;
}


// 获取缓存，检查是否过期(forage缓存)
async function getCache(key:string) {
    const cachedData = await localforage.getItem(key);

    if (!cachedData) {
        return null; // 缓存不存在
    }

    const now = Date.now(); // 获取当前时间戳
    // if (now > cachedData?.expiresAt) {
    //     await localforage.removeItem(key); // 如果已过期，删除缓存
    //     return null; // 返回 null 表示缓存已过期
    // }

    // return cachedData.value; // 返回未过期的数据
}

function authExp(key:string){
    const token=localStorage.getItem(key)
    const exp=localStorage.getItem("exp_token")
    if(token &&exp){
        const dateTime=Date.now()
        if(dateTime>=Number(exp)){
            //清空缓存
            localStorage.clear()
            return false
        }else{
            return true
        }
    }else{
        return false
    }
}