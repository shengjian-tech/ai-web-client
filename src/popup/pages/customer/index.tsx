import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button, theme, Collapse,  InputNumber , message, Form, Input, } from 'antd'
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import logo from '@/public/images/ketou.png'

import './style.less';
import FormList from '../../components/formList'
import Header from '../../components/header'
import Content from '../../components/content'
import Footer from '../../components/footer'
import TagMenu from '@/popup/components/tagMenu';

// 从 Ant Design 中导入主题算法
const { darkAlgorithm, defaultAlgorithm } = theme

const Customer: React.FC = () => {

    const [isSave,setIsSave] =useState<boolean>(false)

    const [timeout,setTime]=useState<number>(1)
    const [messageApi, contextHolder] = message.useMessage();

    //文本配置和频率配置
    const [tag, setTag] = useState<string>('wenben')
    // 控制是否显示“忽略规则”
    const showIgnoreRule = false; // 当前页面不需要显示“忽略规则”
    const userSelectTag = (va:string)=>{
        setTag(va)
    }

    //关键词回复
    const { TextArea } = Input;

    const [form] = Form.useForm(); // 初始化 form 实例

    const onFinish = (values: any) => {
        console.log('Received values of form:', values);
    };

    const [keywordData, setKeywordData] = useState<any[]>([]);    //关键词回复数据
    const [emojiAndReply, setEmojiAndReply] = useState<[boolean, boolean, string]>([false, false, ""]);    //表情和兜底回复数据
    const [feedbackKeywordData, setFeedbackKeywordData] = useState<any[]>([]);    //回显关键词回复
    const [feedbackEmoji, setFeedbackEmoji] = useState<boolean>(false);    //回显表情
    const [feedbackReply, setFeedbackReply] = useState<string>("");    //回显最终回复
    const [customDelays,setCustomDelays]=useState<number>(0); //客服延迟
    const [feigeArtific,setFeigeArtific]=useState<string>();//飞鸽转接人工关键词(多个以#分隔)
    const [feigeManual,setFeigeManual]=useState<string>();//飞鸽转接人工客服账号



    const [isListter,setIsLister]=useState(false)


    // let isListenerRegistered = false; // 全局变量，标记监听器是否已注册

    if (!isListter) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     
        if(request.type=="isStart"){
        
            if(request.lpStart){
                messageApi.open({type:"success",content:"启动成功"})
            }else{
                messageApi.open({type:"error",content:"启动失败"})
            }
           
        }
        sendResponse({ success: true });
        return true; // 确保异步响应
      });

      setIsLister(true)
    //   isListenerRegistered = true; // 标记为已注册
    }

    //*************************生命周期********************************** */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 从本地存储中读取数据
        const result:any = await new Promise((resolve, reject) => {
          chrome.storage.local.get(["init_popupData"], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else {
              resolve(result);
            }
          });
        });
        const initDatas= JSON.parse(result.init_popupData)
        console.log("initDatas:---",initDatas)
        //关键词回复数据
        let qaKeywords = initDatas.qaKeywords
        if (qaKeywords) {
            const qakws = qaKeywords.includes('\n') ? qaKeywords.split('\n') : [qaKeywords];
            let qs:any=[]
            qakws.forEach((element:string) => {
                const data=element.split("#")
                qs.push({question:data[0],answer:data[1]})
            });
            setFeedbackKeywordData(qs)
        }
        //表情数据
        let emoji = initDatas.insertPlaceholder
        if (emoji != null && emoji != undefined) {
            if (emoji === 'yes') {
                setFeedbackEmoji(true)
            } else { 
                setFeedbackEmoji(false)
            }
        }
        //兜底回复数据
        let reply = initDatas.finalReplay
        if (reply) {
            setFeedbackReply(reply)
        }
        //频率配置
        let conversation = initDatas.questions
        let frequency = initDatas.speakLimit
        if (conversation && conversation != '') { 
            let speakArr = conversation.trimEnd('\n').split('\n')
            
            let res:any=[]
            speakArr.forEach((element:any) => {
                res.push({script:element})
            });
            form.setFieldsValue({loop_list:res})
        }
        if (frequency) { 
            setTime(frequency)
        }
        //客服延迟
        const kefuBreak=initDatas.kefuBreak
        if(kefuBreak){
            setCustomDelays(kefuBreak)
        }
        //飞鸽转接人工关键词
        const feigeHumanWords= initDatas.feigeHumanWords
        if(feigeHumanWords){
            setFeigeArtific(feigeHumanWords)
        }
        //飞鸽转接人工账号
        const feigeHumanAccount= initDatas.feigeHumanAccount
        if(feigeHumanAccount){
            setFeigeManual(feigeHumanAccount)
        }

      } catch (error) {
        console.error("Error fetching or parsing data:", error);
      }
    };

    fetchData();
  }, []);



    //********************************************** */

    //文本配置-保存按钮
    const saveTextConfig = () => {
        let qas=""
        const map=new Map()
        const keywordSource = Array.isArray(keywordData) && keywordData.length > 0
            ? keywordData
            : (Array.isArray(feedbackKeywordData) ? feedbackKeywordData : []);

        const normalizedKeywords = keywordSource
            .map((item: any) => ({
                question: (item?.question ?? "").toString().trim(),
                answer: (item?.answer ?? "").toString().trim(),
            }))
            .filter((item: { question: string; answer: string }) => item.question !== "" && item.answer !== "");

        qas = normalizedKeywords.map((item: { question: string; answer: string }) => `${item.question}#${item.answer}`).join("\n");
        map.set("qaKeywords", qas)

        //随机表情以及兜底回复
        const [emoj, isRep, fallbackReply] = Array.isArray(emojiAndReply) ? emojiAndReply : [false, false, ""];
      
       if(emoj){
        map.set("insertPlaceholder","yes")
       }else{
        map.set("insertPlaceholder","no")
       }
        if (isRep && fallbackReply) {
            map.set("finalReplay", fallbackReply)
        } else { 
            map.set("finalReplay", "")
        }

       const obj = Object.fromEntries(map);
       console.log("qas:---",qas)
       chrome.runtime.sendMessage({type:"save_data",data:JSON.stringify(obj)},(resp)=>{
            console.log("content的回复1111:", resp);
            messageApi.open({
                type: 'success',
                content: '保存成功，正在开启，请稍等...',
            });
       })

       setTimeout(() => {
      //开始执行
      chrome.runtime.sendMessage({type:"start_shop"},(resp)=>{
        console.log("电商客服：",resp)
      })
      }, 1000);

        console.log("关键词回复的数据:", keywordData)
        console.log("表情和兜底回复的数据:", emojiAndReply)

    }

    //获取FormList组件的数据
    const getQaKeyWords= async(va:any[])=>{
        // console.log("关键话术:----", va)
        setKeywordData(va)
    
    }

    //获取Content组件的数据
    const getEmojiAndReply = async (va: any[]) => { 
        const normalizedValue: [boolean, boolean, string] = [
            !!va?.[0],
            !!va?.[1],
            (va?.[2] ?? "").toString(),
        ];
        setEmojiAndReply(normalizedValue)
    }


    // 处理循环话术时间，只能输入数字，不能输入其他字符
    const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, ''); // 移除所有非数字字符

        // 如果 numericValue 为空字符串，直接设置为 0 或保留为空字符串
        const numericIntValue = numericValue === '' ? 0 : parseInt(numericValue, 10);

        // 更新状态
        setTime(numericIntValue);
    };

    //****************频率相关的逻辑**************** */
    
    // 频率配置页面，初始化时添加一个默认的字段
    React.useEffect(() => {
        if (!form.getFieldsValue().loop_list || form.getFieldsValue().loop_list.length === 0) {
            form.setFieldsValue({
                loop_list: [{ question: '', answer: '', questionVisible: false, answerVisible: false }]
            });
        }
    }, [form]);

    //获取客服延迟
    function getCustomDepays(value:any){
      
        setCustomDelays(value)
 
   
    }
    //获取飞鸽客服转接关键词
    function getFeigeActiclKeyWord(element:any){
        console.log("转接:----",element.target.value)
        setFeigeArtific(element.target.value)
    }
    //获取 飞鸽人工账号
    function getFeigeManAccount(element:any){
        setFeigeManual(element.target.value)
    }

    //频率配置-保存按钮
    function saveConfig(){
        setIsSave(!isSave)
        const speakList = form.getFieldValue("loop_list") || []
        console.log("循环话术：", speakList)
        const map =new Map()
        if(Array.isArray(speakList)){
                //保存循环话术到缓存
              let questions:string=""

              speakList.forEach((element:any) => {
                if(element?.script){
                    const va=element.script.replace(/^\s+|\s+$/g,'').replace("\r\n","")+"\n"
                    questions=questions+va
                }
              });
              
              map.set("questions",questions)
              //保存频率
              map.set("speakLimit",timeout)
    
        }
        if(customDelays){
            map.set("kefuBreak",customDelays)
        }
        if(feigeArtific){
            map.set("feigeHumanWords",feigeArtific)
        }
        if(feigeManual){
            map.set("feigeHumanAccount",feigeManual)
        }
        
        const obj = Object.fromEntries(map);
        chrome.runtime.sendMessage({ type: "save_data" ,data:JSON.stringify(obj)}, (response) => {
            console.log("循环话术: ", response);
            messageApi.open({
                type: 'success',
                content: '保存成功，正在开启，请稍等...',
            });
        });

        setTimeout(() => {
            //开始执行
            chrome.runtime.sendMessage({type:"start_shop"},(resp)=>{
              console.log("电商客服：",resp)
            })
            }, 1000);
    }

    return (
        <>
        {contextHolder}
        <div className='customer-div'>
            <Header />
            {/* selectedTag:选中的按钮变色, showIgnoreRule:是否显示忽略规则 */}
            <TagMenu tag={userSelectTag} selectedTag={tag} showIgnoreRule={showIgnoreRule}/>
            
            {/* 文本配置页面 */}
            {tag === 'wenben' && (
                <div className='wenben comm-pb'>
                    <div className='text-content-div'>
                        <div className='content-div'>
                            <div className='textContent-div'>
                                <div className='keyword-desc-div'>
                                    <span className='keyword-title'>关键词回复</span>
                                    <span className='keyword-expm'>匹配到关键词触发回复；例如：你是谁 #  我是盛见AI</span>
                                </div>
                                <FormList
                                    getQaKeyWords={getQaKeyWords}
                                    isSave={isSave}
                                    feedbackKeywordData={feedbackKeywordData}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="divider"></div>
                        </div>
                        
                        <Content
                            getEmojiAndReply={getEmojiAndReply}
                            feedbackEmoji={feedbackEmoji}
                            feedbackReply={feedbackReply}
                        />
                    </div>
                    <div className='su-div comm-btn'>
                        <Button className='start-use' onClick={()=>{saveTextConfig()}}>一键开启</Button>
                    </div>
                    <Footer/>
                </div>
            )}

            {/* 频率配置页面 */}
            {tag === 'pinlv' && (
                <div className='pinlv comm-pb'>
                    <div className='frequency-content-div'>
                        <div className='loop-from-div'>
                            <Form
                                form={form}
                                name="loop_form"
                                onFinish={onFinish}
                                style={{ maxWidth: 600 }}
                                autoComplete="off"
                            >
                                <Form.List name="loop_list">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <div key={key} style={{ marginBottom: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'time']}
                                                            rules={[{ required: true, message: '请输入时间' }]}
                                                        >
                                                            <span className="custom-label">循环话术</span>
                                                            <Input
                                                                value={timeout}
                                                                size='small'
                                                                onChange={handleTimeoutChange} 
                                                                style={{ backgroundColor: '#1b1e1c', color: '#707271', borderColor: '#1b1e1c', width: '20%', marginLeft: '8px' }}
                                                            />
                                                            <span style={{ color: '#707271', marginLeft: '8px' }}>秒/次</span>
                                                        </Form.Item>
                                                        {index > 0 && 
                                                            <MinusCircleOutlined
                                                                className='remove-svg'
                                                                style={{ color: '#707271', fontSize: '20px', marginLeft: '8px' }}
                                                                onClick={() => remove(name)}
                                                            />
                                                        }
                                                    </div>
                                                    <div>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'script']}
                                                            rules={[{ required: true, message: '请输入固定话术' }]}
                                                        >
                                                            <TextArea
                                                                className='textArea-div'
                                                                placeholder="请输入固定的话术......"
                                                                style={{ width: '271px' }}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    form.setFieldsValue({ [`${name}.script`]: value }); // 更新表单值
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button
                                                    type="text"
                                                    className='button-div'
                                                    size="small"
                                                    onClick={() => add()}
                                                    icon={<PlusOutlined />}
                                                >
                                                    新增
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Form>
                        </div>
                    </div>
                    <div className='sleep-div' style={{marginTop:25,marginLeft:14}}>
                        <div className='coll-title-div'>
                            <span className='coll-title'>抖店|拼多多客服延迟(秒)</span>
                        </div>
                        <div className='input-number-div' style={{marginTop:15}}>
                            <InputNumber style={{width:130}} onChange={getCustomDepays} value={customDelays}/>

                        </div>

                    </div>
                    <div className='dou-tran-cuslist-div'>
                        
                        <Collapse  defaultActiveKey={['1']} ghost items={[{
                          
                            label:<><div className='coll-title'>飞鸽客服</div></>,
                            children:
                            <>
                            <div className='coll-item'>
                                <div className='coll-title-div'>
                                    <span className='coll-item-title'>转接人工关键词</span>
                                </div>
                                {/* <div className='text-div'>未能匹配到关键词时将使用兜底回复</div> */}
                                <div className='input-div'>
                                    <Input 
                                        placeholder='请在这里输入人工转接关键词(多个以#分隔)' 
                                        size='small'
                                        value={feigeArtific} 
                                        onChange={getFeigeActiclKeyWord} 
                                    />
                                </div>
                            </div>
                            <div className='coll-item' style={{marginTop:15}}>
                                <div className='coll-title-div'>
                                    <span className='coll-item-title'>转接人工客服账号</span>
                                </div>
                                {/* <div className='text-div'>未能匹配到关键词时将使用兜底回复</div> */}
                                <div className='input-div'>
                                    <Input 
                                        placeholder='请在这里输入人工转接客服的账号' 
                                        size='small'
                                        value={feigeManual} 
                                        onChange={getFeigeManAccount} 
                                    />
                                </div>
                            </div>

                            </>
                        }]}/>
                    </div>

                    <div className='su-div comm-btn'>
                        <Button className='start-use' onClick={()=>{saveConfig()}}>一键开启</Button>
                    </div>
                    <Footer/>    
                </div>
            )}


        


        </div>

        </>

    )
}
export default Customer
