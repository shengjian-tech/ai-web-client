import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import Header from '../../components/header';
import './style.less';
import TagMenu from '@/popup/components/tagMenu';
import FormList  from '@/popup/components/formList'

import Footer from '@/popup/components/footer'
import Loop from '@/popup/components/frequencyAllocation'

import Content from '@/popup/components/content'

import IgnoreRule from '@/popup/components/ignoreRule'
import { combineSlices } from '@reduxjs/toolkit';

const LiveConfig: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [inputs, setInputs] = useState<string[]>([]);

    const [tag,setTag]=useState<string>('wenben')
    // 控制是否显示“忽略规则”
    const showIgnoreRule = true; // 当前页面需要显示“忽略规则”
    const [ignDatas,setIgnDatas]=useState()
   

    const userSelectTag=(va:string)=>{
        console.log("用户的选择:",va)
        setTag(va)
    }
 
    const [keywordData, setKeywordData] = useState<any>([]);    //关键词回复数据
    const [emojiAndReply, setEmojiAndReply] = useState<any>({});    //表情和兜底回复数据
    const [huaShu, setHuaShu] = useState<any[]>([ {seconds: 60,content: ''}]);    //循环话术
    const [jaingJie, setJaingJie] = useState<any[]>([{shop:1,seconds:60}]);    //循环讲解
    const [tanPin, setTanPin] = useState<any[]>([{shop:1,seconds:60}]);    //循环弹品
    const [tanJuan, setTanJuan] = useState<any[]>([{shop:1,seconds:60}]);    //循环弹卷
    const ignroeRef=useRef<{ getValue: () => any } | null>()
    const frequenRef=useRef<{ getValue: () => any } | null>()

    const [ignoreNick,setIgnoreNick]=useState([])
    const [ignoreWord,setIgnoreWord]=useState([])
    const [feedbackKeywordData, setFeedbackKeywordData] = useState<any>(null);    //回显关键词回复
    const [isSave, setIsSave] = useState<boolean>(false)
    const [feedbackEmoji, setFeedbackEmoji] = useState<any>();    //回显表情
    const [feedbackReply, setFeedbackReply] = useState<any>();    //回显最终回复

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
    
    // chrome.runtime.onMessage.addListener((request,sender,response)=>{
    //     console.log("isStart:---",request)
    //     if(request.type=="isStart"){
        
    //         if(request.lpStart){
    //             messageApi.open({type:"success",content:"启动成功"})
    //         }else{
    //             messageApi.open({type:"error",content:"启动失败"})
    //         }
           
    //     }

    // })

    useEffect(() => {
        (async () => {
          await getInitData()
        })();

  
      
    }, []);
    
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

            //关键词回复数据
            let qaKeywords = JSON.parse(result.init_popupData).qaKeywords
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
            let emoji = JSON.parse(result.init_popupData).insertPlaceholder
            if (emoji != null && emoji != undefined) {
                if (emoji === 'yes') {
                    setFeedbackEmoji(true)
                } else { 
                    setFeedbackEmoji(false)
                }
            }
            //兜底回复数据
            let reply = JSON.parse(result.init_popupData).finalReplay
            if (reply) {
                setFeedbackReply(reply)
            }

        } catch (error) {
          console.error("Error fetching or parsing data:", error);
        }
      };

      fetchData();
    }, []);


      const getInitData=async ()=>{
        chrome.storage.local.get(["init_popupData"],(popData)=>{
            console.log("popData",popData)
            console.log("解析后：——————",popData?.init_popupData)
            if(popData?.init_popupData){
                const init_popupData=JSON.parse(popData?.init_popupData)
                console.log("解析后：——————",init_popupData)
                formDatas(init_popupData)
            }
            
        })
       
      }

      function formDatas(popData:any){

        //关键词回复
        if(popData.qaKeywords.length>0){
            console.log()
            const qakws=popData.qaKeywords.split("\n")
            let qs:any=[]
            qakws.forEach((element:string) => {
                const data=element.split("#")
                qs.push({question:data[0],answer:data[1]})
            });
            setKeywordData(qs)
        }


        //循环话术
        const qas=popData.questions as string
        console.log("qas,",qas)
        if(qas&& qas.length>0){
            const qalist=qas.split("\n")
            let qasList:any=[]
            qalist.forEach((item:string)=>{
                console.log("回显循环话术：",item)
                qasList.push({content:item, seconds:popData?.speakLimit|| 60})
            })
            
            setHuaShu(qasList)
        }

        if(popData.pushQuan&&popData.pushQuan.length>0){
            const data=popData.pushQuan.split("#")
            
            setTanJuan([{shop:data[0],seconds:data[1]}])
            console.log("tanjuan:",{shop:data[0],seconds:data[1]})
        }
        if(popData.pushProduct&&popData.pushProduct.length>0){
            const data=popData.pushProduct.split("#")
                setTanPin([{shop:data[0],seconds:data[1]}])
                console.log("tanjuan:",{shop:data[0],seconds:data[1]})
        }
        if(popData.speakNum&&popData.speakNum.length>0){
            const data=popData.speakNum.split("#")
            if(data.length==1){
                setJaingJie([{shop:data[0],seconds:60}])
                console.log("tanjuan:",{shop:data[0],seconds:60})
            }else{
                setJaingJie([{shop:data[0],seconds:data[1]}])
                console.log("tanjuan:",{shop:data[0],seconds:data[1]})
            }

           
        }
        //随机em表情
        if(popData.insertPlaceholder.length>0){

        }

        //忽略名称
        if(popData.douyinNickname.length>0){
            const data=popData.douyinNickname.split("#")
            setIgnoreNick(data)
        }
        //忽略关键词
        if(popData.blackWords.length>0){
            const data=popData.blackWords.split("#")
            setIgnoreWord(data)
        }
      }

    //获取FormList组件的数据
    const getQaKeyWords = (va: any) => {
        console.log("关键词回复", va)
        setKeywordData(va)
    }

    //获取Content组件的数据
    const getEmojiAndReply = (va: any) => {
        console.log("关键词回复", va)
        setEmojiAndReply(va)
    }

    //保存配置
    const saveTextConfig = () => { 

       
        console.log("Hello, Ant Design----")
        if (tag === "wenben") { //文本配置
            // console.log("关键词回复的数据:", keywordData)
            // console.log("表情和兜底回复的数据:", emojiAndReply)
            
            //整理关键词回复数据
            let qas = ""
            const map = new Map()
            if(keywordData?.length>0){
                for (let i = 0; i < keywordData.length; i++) {
                    const item = keywordData[i];
                    qas += item.question + "#" + item.answer;
                    if (i < keywordData.length - 1) {
                        qas += "\n";
                    }
                }
                map.set("qaKeywords", qas)
            } else { 
                for (let i = 0; i < feedbackKeywordData.length; i++) {
                    const item = feedbackKeywordData[i];
                    qas += item.question + "#" + item.answer;
                    if (i < feedbackKeywordData.length - 1) {
                        qas += "\n";
                    }
                }
                map.set("qaKeywords", qas)
            }
            //整理随机表情以及兜底回复数据
            const emoj = emojiAndReply[0]
            const isRep = emojiAndReply[1]
            if (emoj) {
                map.set("insertPlaceholder", "yes")
            } else {
                map.set("insertPlaceholder", "no")
            }
            if (isRep) {
                map.set("finalReplay", emojiAndReply[2])
            } else { 
                map.set("finalReplay", "")
            }
            //发送数据
            const obj = Object.fromEntries(map);
            chrome.runtime.sendMessage({type:"save_data",data:JSON.stringify(obj)},(resp)=>{
                console.log("content的回复:", resp);
                if(resp.status=="success"){
                    messageApi.open({
                        type: 'success',
                        content: resp.message,
                      });
                }
                console.log("resp:",resp)
               
            })
            messageApi.open({
                type: 'success',
                content: '保存成功，正在开启，请稍等...',
              });

            setTimeout(() => {
                //开始执行
                chrome.runtime.sendMessage({type:"start_live",data:{type:"wenben",isStart:true}},(resp)=>{
                  console.log("直播互动：",resp)
                //   if(resp.type=="error"){
                //     messageApi.open({type:"error",content:resp.message})
                //   }else{
                //     messageApi.open({
                //         type: 'success',
                //         content: resp.message,
                //       });
                //   }
                })
                }, 1000);
    

        } else if (tag === "pinlv") {   //频率配置
            console.log("话术:", huaShu)
            console.log("讲解:", jaingJie)
            console.log("弹品:", tanPin)
            console.log("弹卷:", tanJuan)

            if(frequenRef){
                const va= frequenRef.current?.getValue()
                console.log("频率：------",va)
                const map=new Map()
                if(va.verbalTrickList.length>0){
                    const verbals=va.verbalTrickList
                    let balstr=verbals[0].content
                   for(let i=1;i<=verbals.length-1;i++){
                     balstr=balstr+"\n"+verbals[i].content
                   }
              
                   map.set("questions",balstr)
                   map.set("speakLimit",verbals[0].seconds)
                }else if(va.verbalTrickList.length==0){
                    map.set("questions","")
                    map.set("speakLimit",0)
                }
                if(va.explainList.length>=0){
                    const explain=va.explainList[0]
                    map.set("speakNum",`${explain.shop}#${explain.seconds}`)

                }
                if(va.productList.length>=0){
                    const product=va.productList[0]
                    map.set("pushProduct",`${product.shop}#${product.seconds}`)

                }
                if(va.vouchersList.length>=0){
                    const voucher=va.vouchersList[0]
                    map.set("pushQuan",`${voucher.shop}#${voucher.seconds}`)

                }
                const obj=Object.fromEntries(map)
                chrome.runtime.sendMessage({ type: "save_data" ,data:JSON.stringify(obj)}, (response) => {
                    console.log("直播间循环功能: ", response);
                });
                
            }

            setTimeout(() => {
                //开始执行
                chrome.runtime.sendMessage({type:"start_live",data:{type:"tanpin",isStart:true}},(resp)=>{
                  console.log("直播互动：",resp)
                })
                // messageApi.open({
                //     type: 'success',
                //     content: '保存成功，正在开启，请稍等...',
                //   });
                }, 1000);
    

        } else if (tag === "hulve") {
            //获取自组建的值
            if(ignroeRef){
                const va=ignroeRef?.current?.getValue()
                console.log("ignore",va)
                const igNickName=va.igNick
                const igKeyWord=va.igKeyWord
                const map=new Map()
                if(igNickName?.length>=0){
                    const ignoreList=igNickName.join("#")

                    map.set("douyinNickname",ignoreList)   
                if(igKeyWord.length>=0){
                    const igoreList=igKeyWord.join("#")
                    map.set("blackWords",igoreList)
                }

                const obj=Object.fromEntries(map)
                chrome.runtime.sendMessage({ type: "save_data" ,data:JSON.stringify(obj)}, (response) => {
                    console.log("直播间忽略昵称: ", response);
                });
            }
            }

            setTimeout(() => {
                //开始执行
                chrome.runtime.sendMessage({type:"start_live",data:{type:"hulve",isStart:true}},(resp)=>{
                  console.log("直播互动：",resp)
                })
                // messageApi.open({
                //     type: 'success',
                //     content: '保存成功，正在开启，请稍等...',
                //   });
                }, 1000);
    
         
           
        }
    }

    //直播互动-频率配置
    const getPinlv = async(va:any)=>{
        console.log("频率配置子组件的值:", va)
        console.log("频率配置子组件key的值:", va.key)
        if (va.key === 'hs') {
            setHuaShu(va.value)
        } else if (va.key === 'jj') {
            setJaingJie(va.value)
        } else if (va.key === 'tp') {
            setTanPin(va.value)
        } else if (va.key === 'tj') {
            setTanJuan(va.value)
        }
    }

    //获取忽略规则的数据

 
    return (
        <>{contextHolder}
            <div className='main-div comm-pb'>
                <Header />
                {/* selectedTag:选中的按钮变色, showIgnoreRule:是否显示忽略规则 */}
                <TagMenu tag={userSelectTag} selectedTag={tag} showIgnoreRule={showIgnoreRule}/>

                <div className='live-body-div'>
                    {
                        tag==="wenben" ? 
                        <>
                          <div className='keyword-div'>
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
                            <div  style={{flex:1,marginTop:10}}>
                                    <div className="divider"></div>
                            </div>

                            <div className='cont-div'>
                            <Content
                                getEmojiAndReply={getEmojiAndReply}
                                feedbackEmoji={feedbackEmoji}
                                feedbackReply={feedbackReply}
                            />
                            </div>
                        
                        </>: tag==="pinlv" ? 
                        <>
                            <Loop key={"pinlve"} questions={huaShu} pushQuan={tanJuan} speakNum={jaingJie} pushProduct={tanPin}  ref={frequenRef}/>
                        </>:<><IgnoreRule key={"hulv"} ignoreWord={ignoreWord} ignoreNick={ignoreNick} ref={ignroeRef}/></>

                    }

              
    
                </div>
            
                <div className='save-but-div comm-btn'>
                    <Button className='save-butto' onClick={()=>{saveTextConfig()}}>一键开启</Button>
                </div>
                
                <Footer/>
            </div>
        </>
    );
};

export default LiveConfig;