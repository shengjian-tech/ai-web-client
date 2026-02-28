import React, { useEffect, useState } from 'react'

import { Space,Button, Switch,Form,Input,FormProps ,CollapseProps, Collapse} from 'antd';
import {LeftOutlined } from '@ant-design/icons';
import  './style.less';
import { Link } from 'react-router-dom';
import pddLogo from '@/public/images/pddlogo.png'




/***变量 */
type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
  };




function gotoPopup(){
    //将popup主页改为吓一跳的路由,避免用户关闭插件重新打开后返回"/"的页面
     chrome.action.setPopup({
        popup:`index.html`
     })
    
}


const KfConfig: React.FC = () => {

    /***变量 */
const [pddVis, setPddVis] = useState(false);
const [pddForm]=Form.useForm()

const [pddIsStart,setPddIsStart]=useState(false)




/***  生命周期 */


useEffect(()=>{

})
/*** */



function isStart(bol:boolean,form:string){

    //表单校验

    if(form==="pdd_Form"){
        pddForm.validateFields().then((values:any)=>{
            console.log("values:---",values)
            setPddIsStart(!pddIsStart)
           
            //开启/关闭pdd自动回复
            // 获取当前活动标签页
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const tabId = tabs[0].id as number;
                
                // 向 content.js 发送消息
                chrome.tabs.sendMessage(tabId, {type:"pddStart",data:bol}, function(response) {
                    console.log('pdd是否开启:', response);
                });
            });

        

           
        }).catch((info:any)=>{
            console.log("info:",info)
            setPddIsStart(false)
        })

    }

   

}





/***（* */

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
  };
  
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };





  

  const collItems:CollapseProps['items']=[

    {
        key: '1',
        label: <><div className='title-div'><img src={pddLogo}/> <span>拼多多回复配置</span></div></>,
        children: 
        <>
        <Form
            name="pddForm"
            form={pddForm}    
            layout="horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <div className='formItem'>
                <Form.Item<FieldType>
                label="机器人Id"
                name="username"
                rules={[{ required: true, message: '请输入机器人Id' }]}
                
                >
                <Input placeholder='请输入机器人Id'  />
                </Form.Item>

            </div>
              
        </Form>

        <div className='isStart-div'>
            <span>是否自动开启</span>
            <Switch checked={pddIsStart}  onChange={(check:boolean)=>{isStart(check,"pdd_Form")}}/>
        </div>
        
        </>,
      },
      {
        key: '2',
        label: <>淘宝回复配置</>,
        children: 
        <>
        <Form
            name="pddForm"
                        
            layout= "horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
                <Form.Item<FieldType>
                label="机器人Id"
                name="username"
                rules={[{ required: true, message: '请输入机器人Id' }]}
                
                >
                <Input placeholder='请输入机器人Id'  />
                </Form.Item>


                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    保存
                </Button>
                </Form.Item>
        </Form>
        
        </>,
      },
      {
        key: '3',
        label: <>京东回复配置</>,
        children: 
        <>
        <Form
            name="pddForm"
                        
            layout= "horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
                <Form.Item<FieldType>
                label="机器人Id"
                name="username"
                rules={[{ required: true, message: '请输入机器人Id' }]}
                
                >
                <Input placeholder='请输入机器人Id'  />
                </Form.Item>


                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    保存
                </Button>
                
                </Form.Item>
        </Form>
        
        </>,
      },

]



 
    return (
        <>
        <div className='main-div'>

          <div className="top-header">
            <div>
                
                <Link to="/"><LeftOutlined style={{fontSize:"20px"}}  onClick={()=>{gotoPopup()}}/></Link>
                
            </div>
            <span className='header-title'>客服配置</span>
          </div>

          <div className='main-body'>
       
            <Collapse items={collItems}/>
               

          </div>

        </div>

        </>

    )
}

export default KfConfig
