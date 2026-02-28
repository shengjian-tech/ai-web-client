import React, { useState, useEffect } from 'react'
import { Button, theme, message,  Input,Collapse,Form,Space} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import logo from '@/public/images/ketou.png'

import './style.less';
import FormList from '../../components/formList'
import Header from '../../components/header'
import Content from '../../components/content'
import Footer from '../../components/footer'


// 从 Ant Design 中导入主题算法
const { darkAlgorithm, defaultAlgorithm } = theme

// 定义表单字段的类型
interface FormData {
    openai_url: string;
    openai_token: string;
    coze_id: string;
    coze_api_key: string;
    comment_webhook: string;
    reply_webhook: string;
    yuanqi_bot_id:string;
    yuanqi_user_id:string;
    customHeader:Array<any>
}

const InterfaceConfig: React.FC = () => {
    const [messageApi,contextHolder]=message.useMessage()

    //接口配置
    const [activeButton, setActiveButton] = useState<string>('interface'); // 初始状态，默认选中 "接口配置" 按钮
    const [customForm]=Form.useForm()

    const handleButtonClick = (buttonKey: string) => {
        setActiveButton(buttonKey);
    };

    const getButtonClassName = (buttonKey: string) => {
        return buttonKey === activeButton ? 'text-button active' : 'text-button';
    };

    //Input框
    const [formData, setFormData] = useState<FormData>({
        openai_url: '',
        openai_token: '',
        coze_id: '',
        coze_api_key: '',
        comment_webhook: '',
        reply_webhook: '',
        yuanqi_user_id:'',
        yuanqi_bot_id:'',
        customHeader:[]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
        setFormData({
            ...formData,
            [fieldName]: e.target.value
        });
    };


    useEffect(() => {
        initData();
    }, []); // 空的依赖数组确保只在首次渲染时运行

    function initData(){

        chrome.storage.local.get(["init_popupData"],(result)=>{
            let data = result.init_popupData
            //数据回显
            console.log("接口配置->", result)
            if (result.init_popupData) {
                data =JSON.parse(data)
                // formData.openai_url="https://shengjian.net/coze/agent/v1/chat/completions"
                // formData.openai_token = data?.openaiAPIToken || ""
                // formData.coze_id = data?.cozeBotid || ""
                // formData.coze_api_key = data?.cozeApikey || ""
                // formData.coze_api_key = data?.comment_webhook || ""
                // formData.coze_api_key = data?.reply_webhook || ""
                const customHeader= data.customHeader
               

                const data1 = {
                    openai_url: data?.apiBase || "https://shengjian.net/coze/agent/v1/chat/completions",
                    openai_token: data?.openaiAPIToken || "",
                    coze_id: data?.cozeBotid || "",
                    coze_api_key: data?.cozeApikey || "",
                    comment_webhook: data?.hookBase || "",
                    reply_webhook: data?.audioBase || "",
                    yuanqi_bot_id:data?.yuanqiBotId || "",
                    yuanqi_user_id:data?.yuanqiUserId || "",
                    customHeader:[] as { key: string; value: any }[]
                }
                if(customHeader?.length>0){
                    customForm.setFieldValue("customHeader",mapForList(JSON.parse(customHeader )))
                    // customForm.customHeader=mapForList(JSON.parse(customHeader ))
                }
                setFormData(data1)
            }
        })
    }

    //list转map
    function listForMap(list:Array<any>) {
        if(list.length>0){
            
            const result = list.reduce((cuMap, item) => {
                cuMap[item.key] = item.value;
                return cuMap;
            }, {});
            return result
        }else{
            return {}
        }
    }
    //map传list
    function mapForList(map:any){
       return Object.entries(map).map(([key, value]) => ({ key, value }));
    }

    //获取表单数据
    const handleSubmit = () => {
        console.log('Form values:', formData);
        const openai_token=formData.openai_token
        const header=customForm.getFieldsValue()
        console.log("自定义header：--",header)
        const map=new Map()
        if(header.customHeader?.length>=0){
            map.set("customHeader",JSON.stringify(listForMap(header.customHeader)))
            
        }
        map.set("openaiAPIToken",openai_token)
        map.set("apiBase",formData.openai_url)
        map.set("cozeBotid",formData.coze_id)
        map.set("cozeApikey",formData.coze_api_key)
        map.set("hookBase",formData.comment_webhook)
        map.set("audioBase",formData.reply_webhook)
        map.set("yuanqiBotId",formData.yuanqi_bot_id)
        map.set("yuanqiUserId",formData.yuanqi_user_id)
        const obj=Object.fromEntries(map)

        chrome.runtime.sendMessage({type:"save_data",data:JSON.stringify(obj)},(resp)=>{
            console.log("数据发送：----",resp)
            messageApi.open({
                type: 'success',
                content: '保存成功，正在开启，请稍等...',
            });
            setTimeout(() => {
                //开始执行
                chrome.runtime.sendMessage({type:"start_shop"},(resp)=>{
                    console.log("接口配置：",resp)
            })}, 1000);
        })
    };

    //回显赋值
    // 从 API 获取数据并设置 formData
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = {
                    openai_url: 'https://ai.shengjian.net/coze/api/v1/chat/completions',
                    openai_token: '',
                    coze_id: '',
                    coze_api_key: '',
                    comment_webhook: '',
                    reply_webhook: '',
                    yuanqi_user_id:'',
                    yuanqi_bot_id:'',
                    customHeader:[],
                };
                setFormData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>{contextHolder}
        <div className='interfaceConfig-div'>
            <Header/>    

            <div className='navigation-div'>
                {/* <Button
                    type="text"
                    className={getButtonClassName('interface')}
                    onClick={() => handleButtonClick('interface')}
                >
                    接口配置
                </Button> */}
            </div>

            <div className='list-div comm-pb'>
                <div className='item-div'>
                    <span>OpenAI地址</span>
                        <Input
                            key={"openai_url"}
                            value={formData.openai_url}
                            onChange={(e) => handleInputChange(e, 'openai_url')}
                        />
                </div>
                <div className='item-div'>
                    <span>OpenAI Token</span>
                        <Input
                            key={"openai_token"}
                            placeholder='请填写ragkb官网自己创建的agentId或OPAI TOKEN'
                            value={formData.openai_token}
                            onChange={(e) => handleInputChange(e, 'openai_token')}
                        />
                </div>
                <div className='item-div'>
                    <span>自定义header头</span>
                    <div className='formlist'>
                    <Form
                        name="custom-form"
                        style={{ maxWidth: 600 }}
                        autoComplete="off"
                        form={customForm}
                    >
                        <Form.List name="customHeader">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                    {...restField}
                                    name={[name, 'key']}
                                    rules={[{ required: true, message: '请填写key' }]}
                                >
                                    <Input placeholder="key" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'value']}
                                    rules={[{ required: true, message: '请填写value' }]}
                                >
                                    <Input placeholder="value" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" className='addHearder' onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加请求头
                                </Button>
                            </Form.Item>
                            </>
                        )}
                        </Form.List>
                    </Form>

                    </div>
                    
                </div>
                <div className='item-div'>
                    <span>评论消息WebHook接口</span>
                        <Input
                        key={"comment_webhook"}
                            value={formData.comment_webhook}
                            onChange={(e) => handleInputChange(e, 'comment_webhook')}
                        />
                </div>
                <div className='item-div'>
                    <span>回复内容WebHook接口</span>
                        <Input
                        key={"reply_webhook"}
                            value={formData.reply_webhook}
                            onChange={(e) => handleInputChange(e, 'reply_webhook')}
                        />
                </div>
                <div className='con-ag-div'>
                <Collapse ghost items={[
                    {
                        key:1,
                        label:<><div>Coze扣子智能体</div></>,
                        children:
                        <>
                            <div className='item-div'>
                                <span>Coze扣子智能体ID</span>
                                    <Input
                                    key={"coze_id"}
                                        value={formData.coze_id}
                                        onChange={(e) => handleInputChange(e, 'coze_id')}
                                    />
                            </div>
                            <div className='item-div'>
                                <span>Coze扣子智能体API Key</span>
                                    <Input
                                        key={"coze_api_key"}
                                        value={formData.coze_api_key}
                                        onChange={(e) => handleInputChange(e, 'coze_api_key')}
                                    />
                             </div>
                        
                        </>
                    },
                    {
                        key:2,
                        label:<><div>腾讯元器智能体</div></>,
                        children:
                        <>
                            <div className='item-div'>
                                <span>腾讯元器智能体ID</span>
                                    <Input
                                    key={"yuanqi_bot_id"}
                                        value={formData.yuanqi_bot_id}
                                        onChange={(e) => handleInputChange(e, 'yuanqi_bot_id')}
                                    />
                            </div>
                            <div className='item-div'>
                                <span>腾讯元器智能体用户ID</span>
                                    <Input
                                        key={"yuanqi_user_id"}
                                        value={formData.yuanqi_user_id}
                                        onChange={(e) => handleInputChange(e, 'yuanqi_user_id')}
                                    />
                             </div>
                        
                        </>
                    }
                ]}>
                
                </Collapse>

                </div>
            

            
            </div>
            
            <div className='su-div comm-btn'>
                <Button type="primary" onClick={handleSubmit} className='start-use'>
                    一键开启
                </Button>
            </div>
            <Footer/>  

        </div>
        </>
    )
}
export default InterfaceConfig