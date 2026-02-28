import { Outlet } from 'react-router-dom';

// 必须包含子路由出口
export default function Index() {
    return (
        <div className="main-container">
            {/* <div style={{backgroundColor:"#000"}}>你好顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶</div> */}
            <Outlet />
        </div>
    );
}
