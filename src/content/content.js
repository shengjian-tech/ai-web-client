
const {  getPddCustomerInfo,
    getRandomEmoji,
    sleep,
    convertCookiesToJSON,
    setCookie,
    getCookie,
    copyText,
    extractVisibleText,
    getTextFromChildren,
    getAllTextNodeContent,
    sendGetRequest,
    sendAsyncAIQuestion,
    sendAsyncPostRequest,
    sendPostRequest,
    removeSlashes,
    removeHtmlTags,
    containsKeyword,
    splitStringByChunk} = require('./function.mjs');


const {  Coze,chatCozeAPI} = require('./coze.js');

  
  
  console.log("盛见AI客服插件加载成功");
  let isStarted = false;//是否运行
  let isLoopStarted=false;//循环发送是否运行
  
  var lastInvocationTime = 0;//记录上次的时间
  var timeLimit=parseInt(localStorage.getItem("timeLimit"))*1000;//请求接口的时间频率
  var apiBase=localStorage.getItem("apiBase");
  var hookBase=localStorage.getItem("hookBase");
  var audioBase=localStorage.getItem("audioBase");
  let sourceQuestion=localStorage.getItem("questions");
  var questions=sourceQuestion? sourceQuestion.replace(/^\s+|\s+$/g,'').replace("\r\n","\n").split("\n"):[];//循环话术文案
  console.log("处理循环后的结果:---",questions)
  var questionsQueue=[]
  var questionsQueue=deepCopy(questions);//循环话术队列
  var speakLimit=parseInt(localStorage.getItem("speakLimit"));//循环话术频率
  var speakBreak=parseInt(localStorage.getItem("speakBreak"));//每轮话术休息
  var openaiAPIToken=localStorage.getItem("openaiAPIToken");
  // var waitSendTime=10;//延迟回复
  var finalReplay=localStorage.getItem("finalReplay");
  var qaKeywords=localStorage.getItem("qaKeywords");
  var blackWords=localStorage.getItem("blackWords");
  var douyinNickname=localStorage.getItem("douyinNickname");
  var speakNum=parseInt(localStorage.getItem("speakNum"));//循环讲解几号产品
  var pushProduct=localStorage.getItem("pushProduct");//循环弹品
  var pushQuan=localStorage.getItem("pushQuan");//循环弹券
  var replyCommentStatus=localStorage.getItem("replyCommentStatus");//是否回复评论
  var insertPlaceholder=localStorage.getItem("insertPlaceholder");//是否随机插入表情
  var cozeBotid=localStorage.getItem("cozeBotid");//扣子机器人id
  var cozeApikey=localStorage.getItem("cozeApikey");//扣子机器人API_KEY
  var kefuBreak=parseInt(localStorage.getItem("kefuBreak"));//客服机器人间隔时间
  var feigeHumanWords=localStorage.getItem("feigeHumanWords");//飞鸽客服转人工关键词
  var feigeHumanAccount=localStorage.getItem("feigeHumanAccount");//飞鸽客服转人工员工账号

var yuanqiBotId=localStorage.getItem("yuanqiBotId"); //腾讯元器智能体id
var yuanqiUserId=localStorage.getItem("yuanqiUserId"); //腾讯元器用户id
var customHeader=localStorage.getItem("customHeader"); //用户自定义header头

const handledSessionMessages = new Map();
const HANDLED_MESSAGE_TTL_MS = 2 * 60 * 1000;

function normalizeSessionText(value) {
    if (value == null) return "";
    return String(value).replace(/\s+/g, " ").trim();
}

function cleanupHandledSessionMessages(nowTs) {
    handledSessionMessages.forEach((timestamp, key) => {
        if (nowTs - timestamp > HANDLED_MESSAGE_TTL_MS) {
            handledSessionMessages.delete(key);
        }
    });
    if (handledSessionMessages.size <= 5000) return;
    const entries = Array.from(handledSessionMessages.entries()).sort((a, b) => a[1] - b[1]);
    const removeCount = handledSessionMessages.size - 5000;
    for (let i = 0; i < removeCount; i++) {
        handledSessionMessages.delete(entries[i][0]);
    }
}

function buildHandledMessageKey(scene, roomId, message) {
    const normalizedMessage = normalizeSessionText(message);
    if (!normalizedMessage) return "";
    return `${scene || "default"}|${normalizeSessionText(roomId) || "anonymous"}|${normalizedMessage}`;
}

function shouldSkipHandledMessage(scene, roomId, message) {
    const key = buildHandledMessageKey(scene, roomId, message);
    if (!key) return false;
    const nowTs = Date.now();
    cleanupHandledSessionMessages(nowTs);
    const lastTs = Number(handledSessionMessages.get(key) || 0);
    return !!(lastTs && nowTs - lastTs < HANDLED_MESSAGE_TTL_MS);
}

function markHandledMessage(scene, roomId, message) {
    const key = buildHandledMessageKey(scene, roomId, message);
    if (!key) return;
    const nowTs = Date.now();
    handledSessionMessages.set(key, nowTs);
    cleanupHandledSessionMessages(nowTs);
}




  //回显数据
  
  // 构建消息对象
//   var message = {
//     type: "init_popupData",
//     data: {
//         "timeLimit":localStorage.getItem("timeLimit"),
//         "apiBase":localStorage.getItem("apiBase"),
//         "hookBase":localStorage.getItem("hookBase"),
//         "audioBase":localStorage.getItem("audioBase"),
//         "questions":localStorage.getItem("questions"),
  
//         "speakLimit":parseInt(localStorage.getItem("speakLimit")),//循环话术频率
//         "speakBreak":parseInt(localStorage.getItem("speakBreak")),//每轮话术休息
//         "openaiAPIToken":localStorage.getItem("openaiAPIToken"),
//         // var waitSendTime=10;//延迟回复
//         "finalReplay":localStorage.getItem("finalReplay"),
//         "qaKeywords":localStorage.getItem("qaKeywords"),
//         "blackWords":localStorage.getItem("blackWords"),
//         "douyinNickname":localStorage.getItem("douyinNickname"),
//         "speakNum":parseInt(localStorage.getItem("speakNum")),//循环讲解几号产品
//         "pushProduct":localStorage.getItem("pushProduct"),//循环弹品
//         "pushQuan":localStorage.getItem("pushQuan"),//循环弹券
//         "replyCommentStatus":localStorage.getItem("replyCommentStatus"),//是否回复评论
//         "insertPlaceholder":localStorage.getItem("insertPlaceholder"),//是否随机插入表情
//         "cozeBotid":localStorage.getItem("cozeBotid"),//扣子机器人id
//         "cozeApikey":localStorage.getItem("cozeApikey"),//扣子机器人API_KEY
//         "kefuBreak":localStorage.getItem("kefuBreak"),//客服机器人间隔时间
//         "feigeHumanWords":localStorage.getItem("feigeHumanWords"),//
//         "feigeHumanAccount":localStorage.getItem("feigeHumanAccount")
//     },
//   };
//   console.log("发送数据了")
  // 发送消息到 background.js
 
  
  chrome.runtime.onMessage.addListener((request,sender,callback)=>{
    console.log("request:",request)
    if(request.type=="save_data"){
        // console.log("获取popup的数据:-----",request.data)
        console.log("获取popup的数据:-----",request.tabs)
        console.log("获取popup的数据:-----",request.data)
        const jsonData= JSON.parse(request.data)

        for(var key in jsonData){
            localStorage.setItem(key,jsonData[key])
        }

        //再次初始化数据
        timeLimit=parseInt(localStorage.getItem("timeLimit"))*1000;//请求接口的时间频率
        apiBase=localStorage.getItem("apiBase");
        hookBase=localStorage.getItem("hookBase");
        audioBase=localStorage.getItem("audioBase");
        sourceQuestion=localStorage.getItem("questions");
        questions=sourceQuestion? sourceQuestion.replace(/^\s+|\s+$/g,'').replace("\r\n","\n").split("\n"):[];//循环话术文案
        console.log("处理循环后的结果:---",questions)
        questionsQueue=[]
        questionsQueue=deepCopy(questions);//循环话术队列
        speakLimit=parseInt(localStorage.getItem("speakLimit"));//循环话术频率
        speakBreak=parseInt(localStorage.getItem("speakBreak"));//每轮话术休息
        openaiAPIToken=localStorage.getItem("openaiAPIToken");
        // var waitSendTime=10;//延迟回复
        finalReplay=localStorage.getItem("finalReplay");
        qaKeywords=localStorage.getItem("qaKeywords");
        blackWords=localStorage.getItem("blackWords");
        douyinNickname=localStorage.getItem("douyinNickname");
        speakNum=parseInt(localStorage.getItem("speakNum"));//循环讲解几号产品
        pushProduct=localStorage.getItem("pushProduct");//循环弹品
        pushQuan=localStorage.getItem("pushQuan");//循环弹券
        replyCommentStatus=localStorage.getItem("replyCommentStatus");//是否回复评论
        insertPlaceholder=localStorage.getItem("insertPlaceholder");//是否随机插入表情
        cozeBotid=localStorage.getItem("cozeBotid");//扣子机器人id
        cozeApikey=localStorage.getItem("cozeApikey");//扣子机器人API_KEY
        kefuBreak=localStorage.getItem("kefuBreak");//客服机器人间隔时间
        feigeHumanWords=localStorage.getItem("feigeHumanWords");//
        feigeHumanAccount=localStorage.getItem("feigeHumanAccount");
        yuanqiBotId=localStorage.getItem("yuanqiBotId");
        yuanqiUserId=localStorage.getItem("yuanqiUserId");
        customHeader=JSON.parse(localStorage.getItem("customHeader")) //用户自定义header

        
        console.log("在content中保存缓存:",getLocalStoragValue())
        chrome.storage.local.set({"init_popupData":JSON.stringify(getLocalStoragValue())},()=>{
            // sendResponse("保存缓存")
            console.log("在content中保存缓存:",request.data)
        })
        

    }
    if(request.type=="start_shop" || request.type=="start_live"){


        try {

            if (request.tab.url.includes("im.jinritemai.com") || request.tab.url.includes("mms.pinduoduo.com")|| request.tab.url.includes("dongdong.jd.com")) {
              ///im.jinritemai.com
              ///mms.pinduoduo.com/chat-merchant/
              startDouyinFeige();
            } else {
              startListening();
              startLoopQuestions();
              startLoopSpeak();
            }

            // startLoopComment()
            console.log("成功启动：----")
            chrome.runtime.sendMessage({type:"isStart",message:"启动成功！",lpStart:true},(response)=>{
                console.log(response)
            })
          } catch (err) {
            console.log(err)
            chrome.runtime.sendMessage({type:"isStart",message:"启动失败！",lpStart:false},(response)=>{
               
            })
          }
      
    }
    // if(request.type=="start_live"){
    //     const data= request.data
    //     replyCommentStatus="yes"
    //     if(data?.type=="tanpin"){
        

    //         startLoopQuestions()
            
    //     }else{
           
    //         //
    //         //循环发送
    //         startListening();
    //         //循环发送
    //         // startLoopQuestions()
    //         //循环评论
    //         startLoopComment()
    //     }



    // }
  })
  
//   startDouyinFeige()
  
  
  //监听页面元素变化
//   startListening()
  function startListening(){
      console.log("盛见AI客服插件开始直播监听...");
      if(isStarted){
        //   alert("正在运行直播监听，请先刷新页面！");
        console.log("正在运行直播监听，请先刷新页面！")
          return;
      }
     // alert("盛见AI客服插件启动成功！");
    //   alert("盛见AI客服插件开始直播监听");
      isStarted=true;
      //防止多次重复
      let history={};
      let historyList=[];
      let weidianHistory=[];
      let taobaoHistory=[];
      let preContent="";
      // 创建 MutationObserver 实例
      var observer = new MutationObserver(function (mutations) {
  
              mutations.forEach(function (mutation) {
  
                  // console.log(mutation.target);	
                  //58同城微聊
                  let fivexpath='../span[contains(@class,"im-last-msg")]';
                  let fivenewMessage=getNode(mutation.target,fivexpath);
                  if(fivenewMessage){
                      simulateClick(fivenewMessage);
                      setTimeout(function(){
                          let lastMessage=getNode(document.body,"//li[contains(@class, 'im-session-active')]");
                          let nickname=getTextNodeContent(lastMessage,".//span[contains(@class,'im-session-username')]");
                          let content=getTextNodeContent(lastMessage,".//span[contains(@class,'im-last-msg')]");
                          let nickMessage=nickname+":"+content;
                          if(preContent!=nickMessage){
                              preContent=nickMessage;
                              console.log("58同城微聊-",nickMessage);
                              showNewMessageBox(nickMessage);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  preContent=nickname+":"+replyContent
                                      let fiveinput=getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-input-richtext']");
                                      simulateInput2(fiveinput,replyContent);
                                      simulateClick(getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-send']"));
                              }else{
                                      sendAIQuestion(nickname,"",content,function(replyContent){
                                          if(replyContent=="") return;
                                          preContent=nickname+":"+replyContent
                                          let fiveinput=getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-input-richtext']");
                                          simulateInput2(fiveinput,replyContent);
                                          simulateClick(getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-send']"));
                                      })
                              }
                          }
                      },1000)
                  }
                  
                  
                  //抖店飞鸽客服系统
                //   let pigeonChatScrollBox=getNode(mutation.target,'//div[@data-kora="conversation"]');
                //   if(pigeonChatScrollBox){
                //       let avatar="";
                //       let avatarNode=getNode(pigeonChatScrollBox,'//img[@alt="头像"]');
                //       if(avatarNode){
                //           avatar=avatarNode.getAttribute("src");
                //       }
                //       let flyNickname=getTextNodeContent(pigeonChatScrollBox,"//div[@title and string-length(@title) > 0]")
                //       let flyContent=getTextNodeContent(pigeonChatScrollBox,"//div[@title and string-length(@title) > 0]/following-sibling::*[1]")
                //       if(flyContent=="用户超时未回复，系统关闭会话") return;
                //       //防止多次执行
                //       console.log(flyNickname,flyContent);
                //       if(history["flyNickname"]!=flyNickname+flyContent){
                //           history["flyNickname"]=flyNickname+flyContent;
                //           simulateClick(pigeonChatScrollBox);
                //           //判断最新消息不是客服发出的
                //           if(flyContent.includes("机器人回复") || !getNode(mutation.target,'//div[@data-qa-id="qa-message-warpper"][last()]//div[contains(@style,"flex-direction: row-reverse")]')){
                //               console.log(flyNickname+":"+flyContent);
                //               showNewMessageBox(flyNickname+":"+flyContent);
                //               let randomMsg=getRandomElement();
                //               if(randomMsg!=""){
                //                   simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]'),randomMsg);
                //                   simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]'));
                //               }
                              
                //               //自动回复
                //               let replyContent=processQaKeywords(qaKeywords,flyContent);
                //               if(replyContent=="") replyContent=finalReplay;
                //               if(replyContent!=""){
                //                   setTimeout(function(){
                //                       simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]'),replyContent);
                //                       simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]'));
                //                   },1000)
              
                //               }else{
                //                   setTimeout(function(){
                //                       sendAIQuestion(flyNickname,avatar,flyContent,function(replyContent){
                //                           if(replyContent=="") return;
                //                           simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]'),replyContent);
                //                           simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]'));
                //                       })
                //                   },1000)
                //               }
  
                //           }
                //       }
                //       return;
                //   }
                  
                  
                      // 处理变动，可以在这里执行你想要的操作
                      mutation.addedNodes.forEach(function (addedNode) {
  
                          var douyinNicknames=douyinNickname.split("#");
                          var blackWordArr=blackWords.split("#");
                          
  
                          
                          //淘宝直播中控台
                          // console.log(addedNode);
                          let taobaoZhongkong=getNode(addedNode,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]');
                          if(taobaoZhongkong){
                              // console.log(addedNode);
                              let flyNickname=getTextNodeContent(document.body,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]//div[contains(@class,"tc-comment-item-userinfo-name")]');
                              let flyContent=getTextNodeContent(document.body,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]//div[@class="tc-comment-item-content"]/span');
                              if(!flyNickname || !flyContent) return;
                              if(!taobaoHistory.includes(flyNickname+":"+flyContent) && !douyinNickname.includes(flyNickname) && !containsKeyword(flyContent,blackWordArr)){
                                  taobaoHistory.push(flyNickname+":"+flyContent);
                                  console.log(flyNickname+":"+flyContent);
                                  showNewMessageBox(flyNickname+":"+flyContent);
                                  //自动回复
                                  let replyContent=searchKeywordReplys(qaKeywords,flyContent);
                                  if (replyContent == "") replyContent = finalReplay;
                                  console.log("淘宝直播中空台replyContent->", replyContent);
                                  if (replyContent != "" && replyContent != null) {
                                      console.log("---1---")
                                      if(audioBase!="") sendPlayVoice(replyContent);
                                      setTimeout(function(addedNode,replyContent){
                                          simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div'));
                                          tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
                                          simulateInput(tabaoTextArea,replyContent);
                                          simulateEnter(tabaoTextArea)
                                      }(addedNode,replyContent),3000);
                                  }else{
                                    console.log("---2---");
                                      async function delayLog(){
                                          const replyTrigger=getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div');
                                          if(replyTrigger) simulateClick(replyTrigger);
                                          const streamOptions=createStreamTypingOptions(function(fullText){
                                              const input=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
                                              if(input){
                                                  simulateInput(input,fullText);
                                              }
                                          });
                                          await sendAsyncAIQuestion(apiBase, flyNickname, "", flyContent, streamOptions).then(replyContent => {
                                              console.log("replyContent===>", replyContent);
                                              if (replyContent != "" && replyContent != undefined) {
                                                  console.log("回复" + nickname + ":" + replyContent);
                                                  simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div'));
                                                  tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
                                                  simulateInput(tabaoTextArea,replyContent);
                                                  simulateEnter(tabaoTextArea)
                                              }
                                          }).catch();
                                      }
                                      delayLog()
                                      // await sendAsyncAIQuestion(apiBase,flyNickname,"https://wwc.alicdn.com/avatar/getAvatar.do?userNick=t-2046462256-6&width=60&height=60&type=sns&_input_charset=UTF-8",flyContent).then(replyContent => {
                                      // 	if(replyContent=="") return;
                                      // 	setTimeout(function(addedNode,replyContent){
                                      // 		simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div'));
                                      // 		tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
                                      // 		simulateInput(tabaoTextArea,replyContent);
                                      // 		simulateEnter(tabaoTextArea)
                                      // 	}(addedNode,replyContent),3000);
                                      // }).catch();
                                      // sendAIQuestion(flyNickname,"https://wwc.alicdn.com/avatar/getAvatar.do?userNick=t-2046462256-6&width=60&height=60&type=sns&_input_charset=UTF-8",flyContent,function(replyContent){
                                      // 	if(replyContent=="") return;
                                      // 	setTimeout(function(addedNode,replyContent){
                                      // 		simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div'));
                                      // 		tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
                                      // 		simulateInput(tabaoTextArea,replyContent);
                                      // 		simulateEnter(tabaoTextArea)
                                      // 	}(addedNode,replyContent),3000);
                                      // })
                                  }
                              }
                              if(taobaoHistory.length>100){
                                  taobaoHistory.pop();
                              }
                          }
                          
                          //tiktok直播页面
                          // console.log(addedNode);
                          let tiktok=getNode(addedNode,'//div[@data-e2e="chat-message"]') || getNode(addedNode,'//div[@data-e2e="social-message"]');
                          if(tiktok){
                              // console.log(addedNode);
                              let nickname=getTextNodeContent(addedNode,'.//span[@data-e2e="message-owner-name"]');
                              let content=getTextNodeContent(addedNode,'./div[2]/div[2]') || getTextNodeContent(addedNode,'.//div[@data-e2e="social-message-text"]');
                              if(!nickname) return;
                              if(!content) content="已加入";
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              Hook(nickname,content,"");
                              requestBody=nickname+":"+content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  if(audioBase!="") sendPlayVoice(replyContent);
                                  var textarea=getNode(document,'//div[@contenteditable="plaintext-only"]');
                                  if(textarea){
                                      let replys=splitStringByChunk(replyContent,60);
                                      setTimeout(function(){
                                              simulateInput3(textarea,replys[0]);
                                              simulateEnter(textarea);
                                      },1000)
                                  }
                              }else{
                                  sendAIQuestion(nickname,"",content,function(replyContent){
                                      if(replyContent=="") return;
                                      if(audioBase!="") sendPlayVoice(replyContent);
                                      var textarea=getNode(document,'//div[@contenteditable="plaintext-only"]');
                                      if(textarea){
                                          let replys=splitStringByChunk(replyContent,60);
                                          setTimeout(function(){
                                                  simulateInput3(textarea,replys[0]);
                                                  simulateEnter(textarea);
                                          },1000)
                                      }
                                  })
                              }
                              return;
                          }
                          
                          //小红书直播中控后台
                          // console.log(addedNode);
                          let xiaohongshu=getNode(addedNode,'//div[@class="comment-list-item"]');
                          if(xiaohongshu){
                              let nickname=getTextNodeContent(addedNode,'./span[1]');
                              let content=getTextNodeContent(addedNode,'./span[2]');
                              console.log(nickname,content);
                              if(!nickname || nickname=="主播" || !content) return;
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  var textarea=getNode(document,'//textarea[contains(@class,"d-text")]');
                                  if(textarea){
                                      let replys=splitStringByChunk(replyContent,60);
                                      setTimeout(function(){
                                              replyContent=replys[0].replace("{nickname}",nickname);
                                              simulateInput(textarea,replyContent);
                                              setTimeout(function(){
                                                  simulateClick(getNode(document,'//span[text()="发送"]'));
                                              },1000);
                                      },1000)
                                  }
                              }else{
                                  sendAIQuestion(nickname,"",content,function(replyContent){
                                      if(replyContent=="") return;
                                      var textarea=getNode(document,'//textarea[contains(@class,"d-text")]');
                                      if(textarea){
                                          let replys=splitStringByChunk(replyContent,60);
                                          setTimeout(function(){
                                                  replyContent=replys[0].replace("{nickname}",nickname);
                                                  simulateInput(textarea,replyContent);
                                                  setTimeout(function(){
                                                      simulateClick(getNode(document,'//span[text()="发送"]'));
                                                  },1000);
                                          },1000)
                                      }
                                  })
                              }
                              return;
                          }
                          //抖音巨量百应后台
                          // console.log(addedNode);
                          let juliang=getNode(addedNode,'//div[contains(@class,"commentItem")]');
                          if(juliang){
                              let nickname=getTextNodeContent(addedNode,'.//div[contains(@class,"nickname")]');
                              let content=getTextNodeContent(addedNode,'.//div[contains(@class,"description")]');
                              if(!nickname || !content) return;
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              if(!historyList.includes(requestBody)){
                                  historyList.push(requestBody);
                                  showNewMessageBox(requestBody);
                                  console.log(requestBody);
                                  //自动回复
                                  let replyContent=searchKeywordReplys(qaKeywords,content);
                                  if(replyContent=="") replyContent=finalReplay;
                                  if(replyContent!=""){
                                      replyContent=replyContent.replace("{昵称}",nickname);
                                      var textarea=getNode(document,'//textarea[contains(@class,"auxo-input-borderless")]');
                                      if(textarea){
                                          let replys=splitStringByChunk(replyContent,50);
                                          setTimeout(function(){
                                                  replyContent=replys[0].replace("{nickname}",nickname);
                                                  simulateInput(textarea,replyContent);
                                                  simulateEnter(textarea);
                                                  // simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
                                          },1000)
                                      }
                                  }else{
                                      replyContent=replyContent.replace("{昵称}",nickname);
                                      sendAIQuestion(nickname,"",content,function(replyContent){
                                          if(replyContent=="") return;
                                          var textarea=getNode(document,'//textarea[contains(@class,"auxo-input-borderless")]');
                                          if(textarea){
                                              let replys=splitStringByChunk(replyContent,50);
                                              setTimeout(function(){
                                                      replyContent=replys[0].replace("{nickname}",nickname);
                                                      simulateInput(textarea,replyContent);
                                                      simulateEnter(textarea);
                                                      // simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
                                              },1000)
                                          }
                                      })
                                  }
                              }
                              if(historyList.length>200){
                                  historyList.pop();
                              }
                              return;
                          }
  
                          //抖音直播主播版后台
                          // console.log(addedNode);
                          // let douyinZhubo=getNode(addedNode,'//div[@elementtiming="element-timing"]');
                          // if(douyinZhubo){
                          // 	let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"chatItemNickName")]');
                          // 	let content=getTextNodeContent(addedNode,'.//span[contains(@class,"chatItemDesc")]');
                          // 	if(!nickname || !content) return;
                          // 	//判断黑名单
                          // 	if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                          // 	requestBody=nickname+":"+content;
                          // 	if(!historyList.includes(requestBody)){
                          // 		historyList.push(requestBody);
                          // 		showNewMessageBox(requestBody);
                          // 		console.log(requestBody);
                          // 		//自动回复
                          // 		let replyContent=searchKeywordReplys(qaKeywords,content);
                          // 		if(replyContent=="") replyContent=finalReplay;
                          // 		if(replyContent!=""){
                          // 			replyContent=replyContent.replace("{昵称}",nickname);
                          // 			var textarea=getNode(document,'//input[contains(@class,"sendInput")]');
                          // 			if(textarea){
                          // 				let replys=splitStringByChunk(replyContent,60);
                          // 				setTimeout(function(){
                          // 						replyContent=replys[0].replace("{nickname}",nickname);
                          // 						simulateInput(textarea,replyContent);
                          // 						simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
                          // 				},1000)
                          // 			}
                          // 		}else{
                          // 			replyContent=replyContent.replace("{昵称}",nickname);
                          // 			sendAIQuestion(nickname,"",content,function(replyContent){
                          // 				if(replyContent=="") return;
                          // 				var textarea=getNode(document,'//input[contains(@class,"sendInput")]');
                          // 				if(textarea){
                          // 					let replys=splitStringByChunk(replyContent,60);
                          // 					setTimeout(function(){
                          // 							replyContent=replys[0].replace("{nickname}",nickname);
                          // 							simulateInput(textarea,replyContent);
                          // 							simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
                          // 					},1000)
                          // 				}
                          // 			})
                          // 		}
                          // 	}
                          // 	if(historyList.length>200){
                          // 		historyList.pop();
                          // 	}
                          // 	return;
                          // }
  
                          //视频号直播中控后台
						// console.log(addedNode);
						let shipinhao=getNode(addedNode,'//div[contains(@class,"vue-recycle-scroller__item-view")]');
						if(shipinhao){
							let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"message-username-desc")]');
							let content=getTextNodeContent(addedNode,'.//span[contains(@class,"message-content")]');
							if(!nickname || !content) return;
							// 上墙
							if(douyinNicknames.includes(nickname)){
								let upreply=processQaKeywords(qaKeywords,content);
								if(upreply=="上墙"){
									simulateClick(getNode(addedNode,'.//span[contains(@class,"message-content")]'));
									setTimeout(function(){
										simulateClick(getNode(document,"//div[text()=' 上墙 ']"));
									},1000)
								}
							}
							//判断黑名单
							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
							requestBody=nickname+":"+content;
							showNewMessageBox(requestBody);
							console.log(requestBody);
							//自动回复
							let replyContent=processQaKeywords(qaKeywords,content);
							if(replyContent=="") replyContent=finalReplay;
							if(replyContent!=""){
								if(audioBase!="") sendPlayVoice(replyContent);
								//判断频率
								if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
								var textarea=getNode(document,'//textarea[@class="message-input"]');
								if(textarea){
									replyContent=replyContent.replace("{昵称}",nickname);
									let replys=splitStringByChunk(replyContent,60);
									simulateClick(getNode(addedNode,'.//span[contains(@class,"message-content")]'));
									setTimeout(function(){
										simulateClick(getNode(document,"//div[text()=' 回复 ']"));
										simulateInput(textarea,replys[0]);
										simulateEnter(textarea);
									},1000)

									lastInvocationTime = Date.now();
								}
							}else{
								sendAIQuestion(nickname,"",content,function(replyContent){
									if(replyContent=="") return;
									if(audioBase!="") sendPlayVoice(replyContent);
								    if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
									var textarea=getNode(document,'//textarea[@class="message-input"]');
									if(textarea){
										let replys=splitStringByChunk(replyContent,60);
										simulateClick(getNode(addedNode,'.//span[contains(@class,"message-content")]'));
										setTimeout(function(){
											simulateClick(getNode(document,"//div[text()=' 回复 ']"));
											simulateInput(textarea,replys[0]);
											simulateEnter(textarea);
										},1000)
										lastInvocationTime = Date.now();
					
									}
								})
							}
							return;
						}
						
                          
                          //支付宝直播中控后台
                          // console.log(addedNode);
                          let alipayCome=getNode(addedNode,'//div[contains(@class,"roomEvents")]');
                          if(alipayCome){
                              let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"roomUserStyle")]');
                              let content=getTextNodeContent(addedNode,'.//div[contains(@class,"eventItem")]');
                              if(!content) return;
                              requestBody=content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  setTimeout(function(){
                                      var textarea=getNode(document,'//textarea[@id="content"]');
                                      if(textarea){
                                          replyContent=replyContent.replace("{nickname}",nickname);
                                          simulateInput(textarea,replyContent);
                                          simulateEnter(textarea);
                                      }
                                  },1000)
                                          
                              }
                              return;
                          }
                          
                          let alipay=getNode(addedNode,'//div[contains(@class,"cmtItem")]');
                          if(alipay){
                              let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"userName")]');
                              let content=getTextNodeContent(addedNode,'.//span[contains(@class,"cmtContent")]');
                              if(!nickname || !content) return;
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  setTimeout(function(){
                                      var textarea=getNode(document,'//textarea[@id="content"]');
                                      if(textarea){
                                          simulateInput(textarea,replyContent);
                                          simulateEnter(textarea);
                                      }
                                  },1000)
                                          
                              }else{
                                  setTimeout(function(){
                                      sendAIQuestion(nickname,"",content,function(replyContent){
                                          if(replyContent=="") return;
                                          var textarea=getNode(document,'//textarea[@id="content"]');
                                          if(textarea){
                                              simulateInput(textarea,replyContent);
                                              simulateEnter(textarea);
                                          }
                                      })
                                  },1000)
                              }
                              return;
                          }
  
  
                          //淘宝直播间
                          let taobao=getNode(addedNode,'//div[contains(@class,"itemWrap")]');
                          if(taobao){
                            console.log("淘宝直播间：-------")
                              let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"author")]');
                              let content=getTextNodeContent(addedNode,'.//span[contains(@class,"content")]');
                              if(!nickname || !content) return;
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if (replyContent == "") replyContent = finalReplay;
                              console.log("淘宝直播回复：------",replyContent);
                              if(replyContent!=""){
                                  if(audioBase!=""){
                                      sendPlayVoice(replyContent);return;
                                  }
                                  var textarea=getNode(document,'//*[contains(@class,"chatInputCenterTextarea-")]');
                                  if(textarea){
                                      let replys=splitStringByChunk(replyContent,50);
                                      simulateInput(textarea,replys[0]);
                                      setTimeout(function(){
                                              simulateEnter(textarea);
                                      },2000)
                                  }
                              } else {
                                  console.log("淘宝直播回复ai：------")
                                  sendAIQuestion(nickname,"",content,function(replyContent){
                                      if(replyContent=="") return;
                                      if(audioBase!=""){
                                          sendPlayVoice(replyContent);return;
                                      }
                                      var textarea=getNode(document,'//*[contains@(class,"chatInputCenterTextarea-")]');
                                      if(textarea){
                                          let replys=splitStringByChunk(replyContent,50);
                                          simulateInput(textarea,replys[0]);
                                          setTimeout(function(){
                                                  simulateEnter(textarea);
                                          },2000)
                                      }
                                  })
                              }
                              return;
                          }
                          
  
                          //抖音私信回复
                          // let douyinSixinXpath='//div[@id="IMpushListBoxId"]/div';
                          // let douyinSixin=getNode(addedNode,douyinSixinXpath);
                          // if(douyinSixin){
                          // 	let nickname=getTextNodeContent(douyinSixin,"./div[2]/div[1]");
                          // 	let content=getTextNodeContent(douyinSixin,".//pre");
                          // 	if(!historyList.includes(nickname+":"+content)){
                          // 		historyList.push(nickname+":"+content);
                          // 		console.log("抖音私信-",nickname,content);
                          // 		showNewMessageBox(nickname+":"+content);
                          // 		simulateClick(getNode(douyinSixin,"./div"));
                          // 		//span[@data-offset-key and string-length(@data-offset-key) > 0]
                          // 		setTimeout(function(){
                          // 			simulateInput3(getNode(document.body,"//span[@data-offset-key and string-length(@data-offset-key) > 0]"),'<span data-text="true">22</span>');
                          // 			simulateClick(getNode(document.body,"//span[contains(@class,'e2e-send-msg-btn')]"));
                          // 		},1000);
                          // 	}
                          // 	if(historyList.length>100){
                          // 		historyList.pop();
                          // 	}
                          // 	return;
                          // }
                          
                          // //微店客服系统
                          // let weidian=getNode(addedNode,'//div[@class="msg-contact"][not(contains(text(),"暂无新消息"))]');
                          // if(weidian){
                          // 	//console.log(weidian);
                          // 	weidianNewMessage=weidian.textContent;
                          // 	if(!weidianHistory.includes(weidianNewMessage)){
                          // 		weidianHistory.push(weidianNewMessage);
                          // 		console.log("微店新消息:",weidianNewMessage);
                          // 		simulateClick(weidian);
                          // 			//判断最新消息不是客服发出的
                          // 			if(!getNode(mutation.target,'(//div[contains(@class, "im-cards-msg-wrap-box")])[last()][contains(@class, "im-cards-msg-wrap-send")]')){
                          // 				//自动回复
                          // 				let replyContent=processQaKeywords(qaKeywords,weidianNewMessage);
                          // 				if(replyContent=="") replyContent=finalReplay;
                          // 				if(replyContent!=""){
                          // 					weidianHistory.push(replyContent);
                          // 					setTimeout(function(){
                          // 						simulateInput2(getNode(document.body,'//div[@id="textInput"]'),replyContent);
                          // 						sendInputCmd(replyContent);
                          // 					},waitSendTime);
                          // 				}else{
                          // 					sendAIQuestion("微店访客","https://si.geilicdn.com/img-4182000001893dcf3b300a22d1c8-unadjust_64_64.png",weidianNewMessage,function(replyContent){
                          // 						if(replyContent=="") return;
                          // 						weidianHistory.push(replyContent);
                          // 						setTimeout(function(){
                          // 							simulateInput2(getNode(document.body,'//div[@id="textInput"]'),replyContent);
                          // 							sendInputCmd(replyContent);
                          // 						},waitSendTime);
                          // 					})
                          // 				}
                          // 			}
                          // 	}
                          // 	if(weidianHistory.length>10){
                          // 		weidianHistory.pop();
                          // 	}
                          // 	return;
                          // }
  
                          // console.log(addedNode);
                          //微信小店 
                          // console.log(addedNode);
                          let weixindian=getNode(addedNode,'//div[contains(@class,"session-list-card")]');
                          if(weixindian){
                              let nickname=getTextNodeContent(addedNode,'//div[@class="user-nickname"]');
                              let content=getTextNodeContent(addedNode,'//div[@class="summary-wrap"]');
                              if(!nickname || !content) return;
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              if(!historyList.includes(requestBody)){
                                  historyList.push(requestBody);
                                  showNewMessageBox(requestBody);
                                  console.log(requestBody);
                                  simulateClick(weixindian);
                                  //自动回复
                                  let replyContent=processQaKeywords(qaKeywords,content);
                                  if(replyContent=="") replyContent=finalReplay;
                                  if(replyContent!=""){
                                      historyList.push(nickname+":"+replyContent);
                                      var textarea=getNode(document,'//textarea[@class="text-area"]');
                                      if(textarea){
                                          
                                          setTimeout(function(){
                                              simulateInput(textarea,replyContent);
                                              simulateEnter(textarea);
                                              
                                          },1000);
  
                                      }
                                  }else{
                                      sendAIQuestion(nickname,"",content,function(replyContent){
                                          if(replyContent=="") return;
                                          historyList.push(nickname+":"+replyContent);
                                          var textarea=getNode(document,'//textarea[@class="text-area"]');
                                          if(textarea){
                                              
                                              setTimeout(function(){
                                                  simulateInput(textarea,replyContent);
                                                  simulateEnter(textarea);
                                              },1000);
                                          }
                                      })
                                  }
                              }
                              if(historyList.length>200){
                                  historyList.pop();
                              }
                              return;
                          }
                          //快手
                          let kuaishou=getNode(addedNode,'//img[contains(@class,"icon-extend")]');
                          if(kuaishou){
                              let nickname=getTextNodeContent(document.body,'//div[@class="ReactVirtualized__Grid__innerScrollContainer"]/div[last()]//span[contains(@class,"username")]');
                              let content=getTextNodeContent(document.body,'//div[@class="ReactVirtualized__Grid__innerScrollContainer"]/div[last()]//span[contains(@class,"replied-content")]');
                              if(!nickname || !content) return;
                              nickname=nickname.replace(":","");
                              //判断黑名单
                              if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
                              requestBody=nickname+":"+content;
                              showNewMessageBox(requestBody);
                              console.log(requestBody);
                              //自动回复
                              let replyContent=processQaKeywords(qaKeywords,content);
                              if(replyContent=="") replyContent=finalReplay;
                              if(replyContent!=""){
                                  if(audioBase!=""){
                                      sendPlayVoice(replyContent);return;
                                  }
                                  var textarea=getNode(document,'//input[@placeholder="一键回复观众或直接发评论"]');
                                  if(textarea){
                                      let replys=splitStringByChunk(replyContent,40);
                                      for(let item in replys){
                                          setTimeout(function(){
                                              simulateInput(textarea,replys[item]);
                                              simulateClick(getNode(document,"//span[text()='发送']"));
                                          },item*1000);
                                      }
  
                                  }
                              }else{
                                  sendAIQuestion(nickname,"",content,function(replyContent){
                                      if(replyContent=="") return;
                                      if(audioBase!=""){
                                          sendPlayVoice(replyContent);return;
                                      }
                                      var textarea=getNode(document,'//input[@placeholder="一键回复观众或直接发评论"]');
                                      if(textarea){
                                          let replys=splitStringByChunk(replyContent,40);
                                          for(let item in replys){
                                              setTimeout(function(){
                                                  simulateInput(textarea,replys[item]);
                                                  simulateClick(getNode(document,"//span[text()='发送']"));
                                              },item*1000);
                                          }
                                      }
                                  })
                              }
                              return;
                          }
                          // let tiktok=getNode(addedNode,'//div[@data-e2e="chat-message"]');
                          // if(tiktok){
                          // 	//获取昵称
                          // 	nickname=getTextNodeContent(tiktok,'.//span[@data-e2e="message-owner-name"]');
                          // 	commentInfo=getTextNodeContent(tiktok,"./div[2]/div[2]");
                          // 	if(!nickname || !commentInfo) return;
                          // 	requestBody=nickname+":"+commentInfo;
                          // 	showNewMessageBox(requestBody);
                          // 	console.log(requestBody);
                          // }
                          //抖音网页直播间
  
                          let douyin=getNode(addedNode,'//div[contains(@class,"webcast-chatroom___item")]');
                          if(!douyin) return;
  
                          var nickname;
                          var commentInfo;
                           //获取昵称
                           nickname=getTextNodeContent(addedNode,"./div/span[2]")
              
                          //获取内容
                          commentInfo=getTextNodeContent(addedNode,"./div/span[3]")
              
  
                          //判断
                          if(!nickname || !commentInfo) return;
                          // simulateClick(getNode(addedNode,'./div/span[2]'));
                          let sourceHtml=getHtmlNodeContent(addedNode,"./div/span[3]");
                          let gift=""
                          if (sourceHtml.includes("e9b7db267d0501b8963d8000c091e123")) gift="人气票";
                          if (sourceHtml.includes("7ef47758a435313180e6b78b056dda4e"))  gift="小心心";
                          if (sourceHtml.includes("96e9bc9717d926732e37351fae827813"))  gift="玫瑰";
                          if (sourceHtml.includes("722e56b42551d6490e5ebd9521287c67"))  gift="粉丝团灯牌";
                          if (sourceHtml.includes("34ca755520ab0ef2e67848c3f810550a"))  gift="粉丝团灯牌";
                          if (sourceHtml.includes("5ddfcd51beaa7cad1294a4e517bc80fb"))  gift="点亮粉丝团";
                          if (sourceHtml.includes("11bcb8bdc16b66fb330346cb478c1c98"))  gift="荧光棒";
                          if (sourceHtml.includes("0e176c2d0ac040ae0cad13d100f61b02"))  gift="热气球";
                          if (sourceHtml.includes("2756f07818a73a8c79f024e959665110"))  gift="棒棒糖";
                          if (sourceHtml.includes("8155c7cfcb680890bb1062fc664da3e7"))  gift="皇冠";
                          if (sourceHtml.includes("42d4cd329e5c01be43c3432567847507"))  gift="鲜花";
                          if (sourceHtml.includes("4960c39f645d524beda5d50dc372510e"))  gift="你最好看";
                          if (sourceHtml.includes("632fb87caf1844e8235462e3fd020b7f"))  gift="多元勋章";
                          if (sourceHtml.includes("71801c53df3977b1470ac2afb8250ac1"))  gift="大啤酒";
                          if (sourceHtml.includes("46c8e1f2f933d5af7c275b11decfb436"))  gift="妙手生花";
                          if (sourceHtml.includes("送出") && gift=="") console.log(sourceHtml);
                          if(gift!="") commentInfo+=" "+gift
                          //判断黑名单
                          if(douyinNicknames.includes(nickname) || containsKeyword(commentInfo,blackWordArr)) return;
                          requestBody=nickname+":"+commentInfo;
                          showNewMessageBox(requestBody);
                          console.log(requestBody);
                          //hook 消息
                          Hook(nickname,commentInfo,getHtmlNodeContent(addedNode,"./div/span[3]"));
  
                          //判断关键词回复话术
                          let replyContent=searchKeywordReplys(qaKeywords,commentInfo);
                          if(replyContent=="") replyContent=finalReplay;
                          if(replyContent){
                              //判断频率
                              if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
                              replyContent=replyContent.replace("{昵称}",nickname);
                              replyContent=replyContent.replace("{评论}",commentInfo);
                              console.log("关键词回复命中回复----",replyContent);
                              sendReplyContent(replyContent);
                              lastInvocationTime = Date.now();
                              
                              return;
                          }
                          //判断频率
                          if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
                          //判断AI
                          lastInvocationTime = Date.now();
                          sendAIQuestion(nickname,"",commentInfo,function(replyContent){
                              console.log("AI回复----",replyContent);
                              if(replyContent=="") return;
                              replyContent=replyContent.replace("{昵称}",nickname);
                              replyContent=replyContent.replace("{评论}",commentInfo);
                              sendReplyContent(replyContent);
                          })
                               
                      });
              });
      
      });
      // 配置观察选项
      var config = { childList: true,attributes:true,characterData:true,subtree:true };
      // 开始观察变化
      observer.observe(document.body, config);
  
  
      // 视频号助手-私信
      shipinSixin=getNode(document.body,'//ul[@class="weui-desktop-tab__navs__inner"]');
      if(shipinSixin){
          console.log("视频号助手-私信");
          setIntervalSync(function(){
              for(i=1;i<=2;i++){
                  simulateClick(getNode(document.body,'//ul[@class="weui-desktop-tab__navs__inner"]/li['+i+']/a'))
                  if(i==2){
                      moshengrens=getNodes(document.body,"//div[@class='session-wrap']");
                      for(index in moshengrens){
                          node=moshengrens[index];
                          simulateClick(node); 
                          console.log(node);
  
                              simulateInput(getNode(document.body, '//textarea[@class="edit_area"]'),"你好");
                              simulateEnter(getNode(document.body,'//textarea[@class="edit_area"]'));
                      }
                  }
              }
          }, 2000);
      }
  
  }
  function getNode(node, xpath) {
      var element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element : null;
  }
  function getNodes(node, xpath) {
     var nodes = [];
     var iterator = document.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
     var currentNode = iterator.iterateNext();
   
     while (currentNode) {
         nodes.push(currentNode);
         currentNode = iterator.iterateNext();
     }
     
     return nodes;
  }
  function getTextNodeContent(node, xpath) {
      var element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.textContent.replace("：", "").replace(":", "").trim() : null;
  }
  function getHtmlNodeContent(node, xpath) {
      var element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.innerHTML.trim(): null;
  }
  //获取node节点的属性
  function getHtmlNodeAttribute(node,xpath,attr){
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      // 获取匹配的第一个节点
      const divNode = result.singleNodeValue;
  
      if (divNode) {
      // 获取 div 节点的 data-random 属性
      return divNode.getAttribute(attr);
  
      console.log('Data-Random:', dataRandom); // 输出: Data-Random: 1382728819-0-reply
      } else {
      console.log('No matching div found.');
          return null
      }
      
  }
  // 自定义同步风格的setInterval实现
  function setIntervalSync(callback, time) {
      // 使用setTimeout来安排首次执行
      // 这里的函数内部递归调用自己以达到连续执行的目的
      function execute() {
        // 先执行传入的回调函数
        callback();
        // 在回调执行完毕后，判断是否需要继续执行
        // 如果需要，则按照指定间隔时间再次调用execute
        if (typeof time === 'number' && time >= 0) {
          setTimeout(execute, time);
        }
      }
      
      // 立即启动执行序列
      execute();
    }
  function syncTimeout(callback, delay) {
      callback();
      setTimeout(() => syncTimeout(callback, delay), delay);
  }
 

 
  
  function startDouyinFeige() {
      console.log("开启运行盛见AI客服客服插件...");
      if (isLoopStarted) {
        console.log("正在运行盛见AI客服客服插件，请先刷新页面！")
        //   alert("正在运行盛见AI客服客服插件，请先刷新页面！");
          return;
      }
      console.log("盛见AI客服抖音飞鸽客服 | 拼多多客服插件执行")
    //   alert("盛见AI客服抖音飞鸽客服 | 拼多多客服插件执行");
      isLoopStarted = true;
  
      //每秒执行
      async function delayLog() {
  
          //获取PDD商家信息
          const pddCustomer= await getPddCustomerInfo()
  
          while (true) {
              //抖店飞鸽客服
              let feigeDao = getNode(document, '//div[@data-qa-id="qa-conversation-chat-item"]//div[contains(text(), \'秒\') or contains(text(), \'分钟\')]');
              if (feigeDao) {
                  simulateClick(feigeDao);
                  let nickname = getTextNodeContent(document, "//div[@data-qa-id=\"qa-conversation-chat-item\"]//div[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/preceding-sibling::div[1]/div[1]")
                  let content = getTextNodeContent(document, "//div[@data-qa-id=\"qa-conversation-chat-item\"]//div[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/preceding-sibling::div[1]/div[2]")
                  let allMessage = nickname + ":" + content;
  
                  console.log(allMessage);
                  showNewMessageBox(allMessage);
                  const feigeRoomId = nickname || "feige";
                  if (shouldSkipHandledMessage("feige", feigeRoomId, content)) {
                      let sleepSecond=1000
                      if (kefuBreak) sleepSecond=kefuBreak*1000
                      console.log("客服休息" + sleepSecond);
                      await sleep(sleepSecond);
                      continue;
                  }
                  	// 转接会话
				let feigeHumanWordsArr=(feigeHumanWords || "").split("#").filter(item => item);
				if(feigeHumanWordsArr.length > 0 && (feigeHumanWordsArr.includes(content) || containsKeyword(content,feigeHumanWordsArr))){
                    markHandledMessage("feige", feigeRoomId, content);
					await sleep(1000);
					simulateClick(getNode(document.body,'//span[@data-qa-id="qa-transfer-conversation"]'))
					await sleep(1000);
					simulateClick(getNode(document.body,'//div[@data-qa-id="qa-transfer-customer"]//div[@title="'+feigeHumanAccount+'"]'));
					await sleep(1000);
					continue;
				}
  
                  //自动回复
                  let replyContent = processQaKeywords(qaKeywords, content);
                  if (replyContent == "") replyContent = finalReplay;
                  if (replyContent == "") replyContent = getRandomElement();
                  if (replyContent != "") {
  
                      if (speakLimit) await sleep(speakLimit * 1000);
                      console.log("回复" + nickname + ":" + replyContent);
                      simulateInput(getNode(document.body, '//textarea[@data-qa-id="qa-send-message-textarea"]'), replyContent);
                      simulateClick(getNode(document.body, '//div[@data-qa-id="qa-send-message-button"]'));
                  } else {
                      const streamOptions=createStreamTypingOptions(function(fullText){
                          const input=getNode(document.body, '//textarea[@data-qa-id="qa-send-message-textarea"]');
                          if(input){
                              simulateInput(input, fullText);
                          }
                      });
                      await sendAsyncAIQuestion(apiBase, nickname, "", content, streamOptions).then(replyContent => {
                          if (replyContent != "") {
                              console.log("回复" + nickname + ":" + replyContent);
                              simulateInput(getNode(document.body, '//textarea[@data-qa-id="qa-send-message-textarea"]'), replyContent);
                              simulateClick(getNode(document.body, '//div[@data-qa-id="qa-send-message-button"]'));
                          }
                      }).catch();
                  }
                  markHandledMessage("feige", feigeRoomId, content);
                  let sleepSecond=1000
                  if (kefuBreak) sleepSecond=kefuBreak*1000
                  console.log("客服休息" + sleepSecond);
                  await sleep(sleepSecond);
                  continue;
              }
  
              //拼多多客服
              
              let pinduoduo=getNode(document.body,"//div[@class='chat-time']/p[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/parent::div");
              if(pinduoduo) {
                  simulateClick2(pinduoduo);
                  let nickname=getTextNodeContent(document,'//div[@class=\'chat-time\']/p[contains(text(), \'秒\') or contains(text(), \'分钟\')]/parent::div/parent::div//div[@class="chat-nickname"]');
                  let content=getTextNodeContent(document,'//div[@class=\'chat-time\']/p[contains(text(), \'秒\') or contains(text(), \'分钟\')]/parent::div/parent::div//p[@class="chat-message-content"]');
                  //获取用户id
                  let userStr=pinduoduo.getAttribute("data-random")
          
                  if(userStr){
                      userStr=userStr.split("-")[0]
                  }
                  const roomId=(userStr || nickname || "pdd") + (pddCustomer?.mallId || "");
                  let allMessage=nickname+":"+content;
                  console.log(allMessage);
  
                  showNewMessageBox(allMessage);
                  if (shouldSkipHandledMessage("pdd", roomId, content)) {
                      let sleepSecond=1000
                      if (kefuBreak) sleepSecond=kefuBreak*1000
                      console.log("客服休息" + sleepSecond);
                      await sleep(sleepSecond);
                      continue;
                  }
      
                  //自动回复
                  console.log("finalReplay:",finalReplay)
                  let replyContent=processQaKeywords(qaKeywords,content);
                  if(replyContent=="") replyContent=finalReplay;
                  if(replyContent=="") replyContent= getRandomElement();
                  console.log("replyContent:", replyContent)
                  if (insertPlaceholder == "yes" && replyContent) replyContent += getRandomEmoji();
                  if(!!replyContent){
                      console.log("回复" + nickname + ":" + replyContent);
                      var textarea=getNode(document,'//textarea[@id="replyTextarea"]');
                      // history.push(nickname+":"+replyContent);
                      if(textarea){
                          simulateInput(textarea,replyContent);
                          simulateEnter(textarea);
                          if (speakLimit) await sleep(speakLimit * 1000);
                      }
  
                  }else{				
                      const streamOptions=createStreamTypingOptions(function(fullText){
                          const input=getNode(document,'//textarea[@id="replyTextarea"]');
                          if(input){
                              simulateInput(input,fullText);
                          }
                      });
                      await sendAsyncAIQuestion(apiBase,roomId,"",content,streamOptions).then(replyContent => {
                          if(replyContent!=""){
                              console.log("回复" + nickname + ":" + replyContent);
                              var textarea=getNode(document,'//textarea[@id="replyTextarea"]');
                              if(textarea){
                                  simulateInput(textarea,replyContent);
                                  simulateEnter(textarea);
                              }
                          }
                      })
                  }
                  markHandledMessage("pdd", roomId, content);
                  let sleepSecond=1000
				if (kefuBreak) sleepSecond=kefuBreak*1000
				console.log("客服休息" + sleepSecond);
				await sleep(sleepSecond);
				continue;
              }

                //京东客服
              //获取正在咨询的第一个会话
              let jdNode=getNode(document.body,"//div[@class='c_cas-head'][contains(text(),'最近联系人')]/following-sibling::*[2]//div[contains(@class, 'alluser-item') and contains(@class, 't-item-h') and contains(@class, 'alluser-item__normal ')]")
              //let jdNode=getNode(document.body,"//div[@class='c_cas-head'][contains(text(),'最近联系人')]/following-sibling::*[2]//div[@class='alluser-item t-item-h alluser-item__normal  ']")
              if (jdNode){
                console.log("jdNode:",jdNode)
                const textContent = jdNode.textContent || jdNode.innerText;
                if(textContent[5]>0){

                    simulateClick2(jdNode)

                   
                    //获取用户昵称
                    const nickName=getTextNodeContent(jdNode,".//div[@class='alluser-item-name-w']//span")
                    //获取会话内容

                    const content=getTextNodeContent(jdNode,".//span[last()]/span")
                    const roomId=jdNode.id || nickName || "jd";
                    let allMessage=nickName+":"+content
                    console.log("nickName"+":"+nickName+",询问 ：",content)
                    if (shouldSkipHandledMessage("jd", roomId, content)) {
                        let sleepSecond=1000
                        if (kefuBreak) sleepSecond=kefuBreak*1000
                        console.log("客服休息" + sleepSecond);
                        await sleep(sleepSecond);
                        continue;
                    }
                    

                    //自动回复
                    console.log("finalReplay:",finalReplay)
                    let replyContent=processQaKeywords(qaKeywords,content);
                    console.log("replyContent1111:", replyContent)
                    if(replyContent=="") replyContent=finalReplay;
                    if(replyContent=="" || replyContent==null) replyContent= getRandomElement();
                    console.log("replyContent:", replyContent)
                    if (insertPlaceholder == "yes" && replyContent) replyContent += getRandomEmoji();
                    if(!!replyContent){
                        console.log("回复" + nickName + ":" + replyContent);
                        var textarea=getNode(document,"//div[@class='EditorContent ']");
                        // history.push(nickname+":"+replyContent);
                        console.log("输入框：",textarea)
                        if(textarea){
                            console.log("text存在")
                             //去除所有的*
                            
                            simulateUserInput(textarea,replyContent)
                           
                            //模拟点击事件
                            // simulateClick(getNode("//span[@class='send-button']"))
                            if (speakLimit) await sleep(speakLimit * 1000);
                        }
    
                    }else{				
                        const streamOptions=createStreamTypingOptions(function(fullText){
                            const input=getNode(document,"//div[@class='EditorContent ']");
                            if(input){
                                simulateEditableReplaceInput(input,fullText);
                            }
                        },120);
                        await sendAsyncAIQuestion(apiBase,roomId,"",content,streamOptions).then(replyContent => {
                            if(replyContent!=""){
                                
                                var textarea=getNode(document,"//div[@class='EditorContent ']");
                                if(textarea){
                                    replyContent=replyContent.replace(/\*/g,"")
                                    console.log("回复" + nickName + ":" + replyContent);
                                    simulateUserInput(textarea,replyContent);
                                    //simulateEnter(textarea);

                                    //模拟点击事件
                                    // simulateClick(getNode("//span[@class='send-button']"))
                                }
                            }
                        })
                    }
                    markHandledMessage("jd", roomId, content);


                }
               
               
                let sleepSecond=1000
                if (kefuBreak) sleepSecond=kefuBreak*1000
                console.log("客服休息" + sleepSecond);
                await sleep(sleepSecond);
              }
              let sleepSecond=1000
              if (kefuBreak) sleepSecond=kefuBreak*1000
              console.log("客服休息" + sleepSecond);
              await sleep(sleepSecond);
          }
      }
      delayLog();
  }
  //开启循环弹窗
  isStartLoopSpeak=false
  function startLoopSpeak() {
      console.log("盛见AI客服循环弹窗...");
      if (isStartLoopSpeak) {
        console.log("正在运行盛见AI客服循环弹窗，请先刷新页面！")
         // alert("正在运行盛见AI客服循环弹窗，请先刷新页面！");
          return;
      }
    //   alert("盛见AI客服循环弹窗执行");
    console.log("盛见AI客服循环弹窗执行")
      isStartLoopSpeak = true;
      loopSpeakSecond=-1;
      //每秒执行
      async function delayLog() {
          while (true) {
              loopSpeakSecond++;
              console.log("循环讲解：",loopSpeakSecond);
              //循环弹品
              if(pushProduct){
                  pushArr=pushProduct.split("#");
                  console.log("字符串切割了：---",pushArr)
                  pushSec=10;
                  if(pushArr.length=2) pushSec=pushArr[1]
                  if(loopSpeakSecond%pushSec==0){
                      console.log("循环弹品:",pushProduct);
                      //淘宝中控,循环弹品
                      let taobao=getNode(document,'//div[@id="livePushed"]/div/div/div['+pushArr[0]+']//span[text()="弹品"]');
                      if(taobao){
                          simulateClick(taobao);
                      }
                  }
              }
  
              //循环弹券
              if(pushQuan){
                  pushQuanArr=pushQuan.split("#");
                  pushQuanSec=60;
                  if(pushQuanArr.length=2) pushQuanSec=pushQuanArr[1]
                  if(loopSpeakSecond%pushQuanSec==0){
                      console.log("循环弹券:",pushQuan);
                      //淘宝中控,循环弹券
                      let taobao=getNode(document,'//div[@id="livePushed"]/div/div/div['+pushQuanArr[0]+']//span[text()="弹券"]');
                      if(taobao){
                          simulateClick(taobao);
                      }
                  }
              }
  
              //循环讲解
              if (speakNum){
                  speakArr=speakNum.split("#");
                  speakSec=60;
                  if(speakArr.length=2) speakSec=speakArr[1]
  
  
                  if(loopSpeakSecond%speakSec==0){
                      //淘宝中控,循环讲解
                      let taobao=getNode(document,'//div[@id="livePushed"]/div/div/div['+speakArr[0]+']//span[text()="再次讲解"]');
                      if(taobao){
                          simulateClick(taobao);
                      }
  
                      //巨量
                      let juliang=getNode(document,'//div[contains(@class,"goodsItem")]['+speakArr[0]+']//button[text()="取消讲解"]');
                      if(juliang){
                          simulateClick(juliang);
                          setTimeout(function(){
                              let juliang=getNode(document,'//div[contains(@class,"goodsItem")]['+speakArr[0]+']//button[text()="讲解"]');
                              simulateClick(juliang);
                          },1000);
                      }
  
                      //快手
                      //div[@data-test-id="virtuoso-item-list"]/div[1]//button/span[text()='结束讲解']
                      let kuaishou=getNode(document,'//input[@value="'+speakArr[0]+'"]/parent::div//parent::div/button/span[text()="开始讲解"]');
                      if(kuaishou){
                          simulateClick(kuaishou);
                          console.log("快手循环讲解:",speakArr[0]);
                          setTimeout(function(){
                              let confirmBtn=getNode(document,"//button/span[text()='确 定']")
                              if(confirmBtn) simulateClick(confirmBtn)
                          },1000);
                      }
                  }
              }
              await sleep(1000);
          }
      }
      delayLog();
  }
  let isStartedLoopQuestions = false;
  //开始循环发送
  function startLoopQuestions(){
      console.log("盛见AI客服插件开始循环...");
      if(isStartedLoopQuestions){
        console.log("正在运行循环执行，请先刷新页面！")
        //   alert("正在运行循环执行，请先刷新页面！");
          return;
      }
    //   alert("盛见AI客服插件开始循环执行");
    console.log("盛见AI客服插件开始循环执行")
      isStartedLoopQuestions=true;
      loopSecond=-1;
      let history=[];
      //每秒执行
      async function delayLog() {
          while(true){
              loopSecond++;
              console.log("循环发送：",loopSecond);
  
              // 微信小店客服
              let weixinxiaodian=getNode(document,'//span[contains(@class,"unread-badge")]');
              if(weixinxiaodian){
                  simulateClick(weixinxiaodian);
  
                  let nickname=getTextNodeContent(document,'//span[contains(@class,"unread-badge")]/parent::div/following-sibling::div//div[@class="user-nickname"]');
                  let content=getTextNodeContent(document,'//span[contains(@class,"unread-badge")]/parent::div/following-sibling::div//div[@class="summary-wrap"]');
                  let allMessage=nickname+":"+content;
                  // if(history.includes(allMessage)) continue;
                  // history.push(allMessage)
                  // if(history.length>200){
                  // 	history.pop();
                  // }
                  console.log(allMessage);
                  showNewMessageBox(allMessage);
                  //自动回复
                  let replyContent=processQaKeywords(qaKeywords,content);
                  if(replyContent=="") replyContent=finalReplay;
                  if(replyContent=="") replyContent=getRandomElement();
                  if(replyContent!=""){
                      var textarea=getNode(document,'//textarea[@class="text-area"]');
                      // history.push(nickname+":"+replyContent);
                      simulateInput(textarea,replyContent);
                      simulateEnter(textarea);
  
                  }else{
  
                      const streamOptions=createStreamTypingOptions(function(fullText){
                          const input=getNode(document,'//textarea[@class="text-area"]');
                          if(input){
                              simulateInput(input,fullText);
                          }
                      });
                      await sendAsyncAIQuestion(apiBase,nickname,"",content,streamOptions).then(replyContent => {
                          if(replyContent!=""){
                              var textarea=getNode(document,'//textarea[@class="text-area"]');
                              simulateInput(textarea,replyContent);
                              simulateEnter(textarea);
                          }
                      })
                  }
                  await sleep(1000);
                  continue;
              }
              //抖音私信创作者中心
              let sixin = getNode(document, '//div[text()="朋友私信"]');
              if (sixin) {
                  simulateClick(sixin);
                  let weidu=getNode(document,'//div[contains(@class,"semi-tabs-pane-active")]//span[contains(@class,"semi-badge-count")]')
                  if(weidu){
                      simulateClick(weidu);
                      let nickname=getTextNodeContent(document,'//div[contains(@class,"semi-tabs-pane-active")]//li[contains(@class,"active")]//span[contains(@class,"item-header-name")]');
                      let content=getTextNodeContent(document,'//div[contains(@class,"semi-tabs-pane-active")]//li[contains(@class,"active")]//div[contains(@class,"text")]');
                      let allMessage=nickname+":"+content;
                      console.log(allMessage);
                      showNewMessageBox(allMessage);
                      //自动回复
                      let replyContent=processQaKeywords(qaKeywords,content);
                      if(replyContent=="") replyContent=finalReplay;
                      if(replyContent=="") replyContent=getRandomElement();
                      if(replyContent!=""){
                          simulateInput3(getNode(document.body,'//div[@contenteditable="true"]'),replyContent);
                          simulateEnter(getNode(document.body,'//div[@contenteditable="true"]'));
                      }else{
                          const streamOptions=createStreamTypingOptions(function(fullText){
                              const input=getNode(document.body,'//div[@contenteditable="true"]');
                              if(input){
                                  simulateEditableReplaceInput(input,fullText);
                              }
                          },120);
                          await sendAsyncAIQuestion(apiBase,nickname,"",content,streamOptions).then(replyContent => {
                              if(replyContent!=""){
                                  simulateInput3(getNode(document.body,'//div[@contenteditable="true"]'),replyContent);
                                  simulateEnter(getNode(document.body,'//div[@contenteditable="true"]'));
                              }
                          })
                      }
                  }
                  await sleep(1000);
                  let moshengren = getNode(document, '//div[text()="陌生人私信"]');
                  if(moshengren){
                      simulateClick(moshengren);
                      //div[contains(@class,"semi-tabs-tab-active")][text()="陌生人私信"]/parent::div/parent::div//div[contains(@class,"semi-tabs-pane-active")]//div[contains(@class,"text")]
                      let weidu=getNode(document,'//div[contains(@class,"semi-tabs-pane-active")]//span[contains(@class,"semi-badge-count")]')
                      if(weidu){
                          simulateClick(weidu);
                          let nickname=getTextNodeContent(document,'//div[contains(@class,"semi-tabs-pane-active")]//li[contains(@class,"active")]//span[contains(@class,"item-header-name")]');
                          let content=getTextNodeContent(document,'//div[contains(@class,"semi-tabs-pane-active")]//li[contains(@class,"active")]//div[contains(@class,"text")]');
                          let allMessage=nickname+":"+content;
                          console.log(allMessage);
                          showNewMessageBox(allMessage);
                          //自动回复
                          let replyContent=processQaKeywords(qaKeywords,content);
                          if(replyContent=="") replyContent=finalReplay;
                          if(replyContent=="") replyContent=getRandomElement();
                          if(replyContent!=""){
                              simulateInput3(getNode(document.body,'//div[@contenteditable="true"]'),replyContent);
                              simulateEnter(getNode(document.body,'//div[@contenteditable="true"]'));
                          }else{
                              const streamOptions=createStreamTypingOptions(function(fullText){
                                  const input=getNode(document.body,'//div[@contenteditable="true"]');
                                  if(input){
                                      simulateEditableReplaceInput(input,fullText);
                                  }
                              },120);
                              await sendAsyncAIQuestion(apiBase,nickname,"",content,streamOptions).then(replyContent => {
                                  if(replyContent!=""){
                                      simulateInput3(getNode(document.body,'//div[@contenteditable="true"]'),replyContent);
                                      simulateEnter(getNode(document.body,'//div[@contenteditable="true"]'));
                                  }
                              })
                          }
                      }
                  }
                  //返回按钮
                  let fanhui=getNode(document,'//div[contains(@class,"semi-tabs-pane-active")]//button[contains(@class,"semi-button-with-icon-only")]')
                  if(fanhui) simulateClick(fanhui);
  
                  await sleep(1000);
                  continue;
              }
              //快手小店循环发送
              var textarea=getNode(document,'//input[@placeholder="一键回复观众或直接发评论"]');
              if(textarea && speakLimit && loopSecond%speakLimit==0){
                  if(questionsQueue.length<=0){
                      questionsQueue=deepCopy(questions);
                      console.log("每轮休息：",speakBreak);
                      if(speakBreak) await sleep(1000*speakBreak);
                  }
                  let randomElement = questionsQueue.shift();
                  let replys=splitStringByChunk(randomElement,40);
                  for(let item in replys){
                      setTimeout(function(){
                          let reply=replys[item];
                          if(insertPlaceholder=="yes") reply+=getRandomEmoji();
                          console.log("回复评论：",reply);
                          simulateInput(textarea,reply);
                          simulateClick(getNode(document,"//span[text()='发送']"));
                      },item*1000);
                  }
  
                  await sleep(1000);
                  continue;
              }
  
              //抖音循环发送
              var textareaElement=getNode(document.body,'//textarea[@class="webcast-chatroom___textarea"]');
              console.log("抖音直播间:-----------------")
              if(textareaElement && speakLimit && loopSecond%speakLimit==0 && replyCommentStatus=="yes"){
                  if(questionsQueue.length<=0){
                      questionsQueue=deepCopy(questions);
                      console.log("每轮休息：",speakBreak);
                      if(speakBreak) await sleep(1000*speakBreak);
                  }
                  let reply = questionsQueue.shift();
                  if(insertPlaceholder=="yes") reply+=getRandomEmoji();
                  console.log("回复评论：",reply);
                  simulateInput(textareaElement,reply);
                  var btn=document.querySelector(".webcast-chatroom___send-btn");
                  if(btn) simulateClick(btn);
  
                  await sleep(1000);
                  continue;
              }
              //视频号循环
              var textarea=getNode(document,'//textarea[@class="message-input"]');
              if(textarea && speakLimit && loopSecond%speakLimit==0){
                  if(questionsQueue.length<=0){
                      questionsQueue=deepCopy(questions);
                      console.log("每轮休息：",speakBreak);
                      if(speakBreak) await sleep(1000*speakBreak);
                  }
                  let reply = questionsQueue.shift();
                  if(insertPlaceholder=="yes") reply+=getRandomEmoji();
                  console.log("回复评论：",reply);
                  simulateInput(textarea,reply);
                  simulateEnter(textarea);
  
                  await sleep(1000);
                  continue;
              }
              // b站循环发送
              var textarea=getNode(document,'//textarea[@placeholder="发个弹幕呗~"]');
              if(textarea && speakLimit && loopSecond%speakLimit==0){
                  if(questionsQueue.length<=0){
                      questionsQueue=deepCopy(questions);
                      console.log("每轮休息：",speakBreak);
                      if(speakBreak) await sleep(1000*speakBreak);
                  }
                  let reply = questionsQueue.shift();
                  if(insertPlaceholder=="yes") reply+=getRandomEmoji();
                  console.log("回复评论：",reply);
                  simulateInput(textarea,reply);
                  simulateEnter(textarea);
  
                  await sleep(1000);
                  continue;
              }
  
              //淘宝直播中控循环主动发送
              tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
              if(tabaoTextArea && speakLimit && loopSecond%speakLimit==0){
                  if(questionsQueue.length<=0){
                      questionsQueue=deepCopy(questions);
                      console.log("每轮休息：",speakBreak);
                      if(speakBreak) await sleep(1000*speakBreak);
                  }
                  let reply = questionsQueue.shift();
                  if(insertPlaceholder=="yes") reply+=getRandomEmoji();
                  console.log("回复评论：",reply);
                  simulateInput(tabaoTextArea,reply);
                  simulateEnter(tabaoTextArea);
  
                  await sleep(1000);
                  continue;
              }
  
              //循环自动发送
              if(speakLimit){
                  if(loopSecond%speakLimit==0) startLoopComment();
              }else{
                  startLoopComment();
              }
  
  
  
  
              await sleep(1000); // 等待2秒
          }
  
      }
      delayLog();
  
  
  }
  //开始循环评论
  function startLoopComment(){
  
      var m=getRandomElement();
      if(!m) return;
      if(insertPlaceholder=="yes") m+=getRandomEmoji();
      //抖音直播间
      // sendReplyContent(m);
      console.log("循环评论开启。。。。。。")
  
      //百度直播循环发送
      var baidutextarea=getNode(document,'//*[contains(@class,"chat-input")]');
      if(baidutextarea){
          simulateInput(baidutextarea,m);
          var baidubtn=getNode(document,'//*[contains(@class,"chat-btn")]');
          if(baidubtn) simulateClick(baidubtn);
      }
  
      //淘宝直播循环主动发送
      var textarea=getNode(document,'//*[contains(@class,"chatInputCenterTextarea-")]');
      if(textarea){
          simulateInput(textarea,m);
          // var btn=getNode(document,'//*[contains(@class,"chatInputCenterBtnSend-")]');
          // console.log(btn);
          setTimeout(function(textarea){
              simulateEnter(textarea);
          }(textarea),2000);
      }
  
      //淘宝直播中控循环主动发送
      // tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
      // if(tabaoTextArea){
      // 	simulateInput(tabaoTextArea,m);
      // 	simulateEnter(tabaoTextArea);
      // }
  
      //支付宝直播后台
      var textarea=getNode(document,'//textarea[@id="content"]');
      if(textarea){
          simulateInput(textarea,m);
          simulateEnter(textarea);
      }
  
      //视频号直播中控台
      // var textarea=getNode(document,'//textarea[@class="message-input"]');
      // if(textarea){
      // 	simulateInput(textarea,m);
      // 	simulateEnter(textarea);
      // }
  
      //抖音直播主播版
      var textarea=getNode(document,'//input[contains(@class,"sendInput")]');
      if(textarea){
          simulateInput(textarea,m);
          simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
      }
  
  
      //小红书直播中控
      var textarea=getNode(document,'//textarea[contains(@class,"d-text")]');
      if(textarea){
          simulateInput(textarea,m);
          setTimeout(function(){
              simulateClick(getNode(document,'//span[text()="发送"]'));
          },1000);
      }
  
      //tiktok
      var textarea=getNode(document,'//div[@contenteditable="plaintext-only"]');
      if(textarea){
          simulateInput3(textarea,m);
          setTimeout(function(){
              simulateEnter(textarea);
          },1000);
      }
  
      //酷狗直播
      var textarea=getNode(document,'//input[@id="inputChatMessage"]');
      if(textarea){
          simulateInput(textarea,m);
          setTimeout(function(){
              simulateEnter(textarea);
          },1000);
      }
  
      // 百应循环发送
      var textarea=getNode(document,'//textarea[contains(@class,"auxo-input-borderless")]');
      if(textarea){
          setTimeout(function(){
                  simulateInput(textarea,m);
                  simulateEnter(textarea);
          },1000)
      }
  
  }
  //发送回复内容
  function sendReplyContent(replyContent){
      if(audioBase!=""){
          sendPlayVoice(replyContent);
      }
      if(replyCommentStatus!="yes") return;
      if(insertPlaceholder=="yes") replyContent+=getRandomEmoji();
  
      let replys=splitStringByChunk(replyContent,50);
      for(let index in replys){
          var textareaElement=getNode(document.body,'//textarea[@class="webcast-chatroom___textarea"]');
          if(textareaElement){
              simulateInput(textareaElement,replys[index]);
              var btn=document.querySelector(".webcast-chatroom___send-btn");
              if(btn) simulateClick(btn);
          }
      }
  
  }
  
  function simulateTextInput2(element, text) {
           // 确保元素是可编辑的
           if (element.contentEditable === "true") {
             // 设置焦点到元素
             element.focus();
           
             // 模拟按键事件
             text.split('').forEach(function(char) {
               // 创建一个合成事件
               var event = new Event('textInput', { bubbles: true, cancelable: true });
               // 设置event的data属性为当前字符
               event.data = char;
           
               // 触发事件
               element.dispatchEvent(event);
           
               // 直接插入文本到元素中
               element.textContent += char;
             });
           } else {
             console.error('Element is not contenteditable');
           }
  }
  // 辅助函数，模拟鼠标悬停事件
  function simulateHover(element) {
    var event = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }
  
  // 辅助函数，模拟点击事件
  function simulateClick(element) {
    var event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }
  // 辅助函数，模拟输入事件
  function simulateInput(element, text) {
      if(!element || !text) return;
    element.value = text;
    var event = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
    console.log("输入事件:------")
  }
      // 辅助函数，模拟输入事件
  function simulateInput2(element, text) {
      if (!element || !text) return;
   
       // 创建一个临时的input元素来模拟输入
       var tempInput = document.createElement('input');
       tempInput.type = 'text';
       tempInput.value = text;
       
       // 同步input值到目标元素
       element.textContent = text;
       element.focus();
       // 触发input事件
       var event = new InputEvent('input', {
         bubbles: true,
         cancelable: true,
         view: window
       });
       element.dispatchEvent(event);
  }
      // 辅助函数，模拟输入事件
  function simulateInput3(element, html) {
      if (!element || !html) return;
       // 同步input值到目标元素
       element.innerHTML = html;
  }
  // 覆盖 contenteditable 内容（用于流式打字预览）
  function simulateEditableReplaceInput(element, text) {
      if (!element || text == null) return;
      element.focus();
      element.textContent = text;
      var inputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);
  }
  // 流式分片渲染输入框，避免过于频繁的 DOM 更新
  function createStreamTypingOptions(renderFn, minInterval=80) {
      let lastText = "";
      let lastTime = 0;
      return {
          onChunk: function(_chunk, fullText) {
              if (!fullText || fullText === lastText) return;
              const now = Date.now();
              if (now - lastTime < minInterval && fullText.length - lastText.length < 2) {
                  return;
              }
              lastTime = now;
              lastText = fullText;
              renderFn(fullText);
          }
      }
  }
  function simulateEditableInput(xpath,input) {
      chrome.runtime.sendMessage({action: "simulateInput",xpath:xpath,input:input});
  }
  // 辅助函数，模拟键盘输入事件
  function simulateEnter(element) {
      // 创建一个新的键盘事件（回车键）
      const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          code: 'Enter',
          which: 13,
          bubbles: true,
          cancelable: true
      });
      console.log("回车发送:------")
       element.dispatchEvent(enterEvent);
  }
  function simulateClick2(element) {
      var mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
      var mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      var clickEvent = new MouseEvent('click', { bubbles: true });
  
      element.dispatchEvent(mouseDownEvent);
      element.dispatchEvent(mouseUpEvent);
      element.dispatchEvent(clickEvent);
  }
  
  function getRandomElement() {
      if(questionsQueue.length<=0){
          questionsQueue=deepCopy(questions);
      }
      let randomElement = questionsQueue.shift();
      if(randomElement==null) return "";
  
      return randomElement;
  }
  //关键词自动回复的匹配内容
  function processQaKeywords(qaKeywords, commentInfo) {
      console.log("qaKeywords:",qaKeywords)
      console.log("commentInfo:",commentInfo)
      if (!qaKeywords || !commentInfo) {
          return "";
      }
      let qaKeywordsArr = qaKeywords.split("\n");
      let bestReplies = []; // 用于存储所有可能的最佳回复
      for (let index in qaKeywordsArr) {
          let row = qaKeywordsArr[index];
          let qa = row.split("#");
          if (qa.length !== 2) {
              continue;
          }
          let keywords = qa[0].split("|");
          if (containsKeyword(commentInfo, keywords)) {
              // 将所有可能的回复添加到数组中
              bestReplies.push(qa[1].split("|"));
          }
      }
      console.log("bestReplies:",bestReplies)
      if (bestReplies.length === 0) {
          return "";
      } else {
          // 随机选择一个回复
          let randomIndex = Math.floor(Math.random() * bestReplies.length);
          return bestReplies[randomIndex][Math.floor(Math.random() * bestReplies[randomIndex].length)];
      }
  }
  // searchKeywordReplys 搜索关键词并返回对应的回复内容
  function searchKeywordReplys(replys, keyword) {
      if (replys === "" || keyword === "") {
          return "";
      }
      const replyLines = replys.split("\n");
      let bestReplies = []; // 用于存储所有可能的最佳回复
      for (const reply of replyLines) {
          const qa = reply.split("#");
          if (qa.length === 2) {
              const questions = qa[0].split("|");
              const matchCount = countMatchingKeywords(keyword, questions);
              if (matchCount > 0) {
                  // 如果匹配成功，将所有可能的回复添加到数组中
                  const possibleReplies = qa[1].split("|");
                  bestReplies.push(...possibleReplies);
              }
          }
      }
      if (bestReplies.length === 0) {
          return "";
      } else {
          // 随机选择一个回复
          const randomIndex = Math.floor(Math.random() * bestReplies.length);
          return bestReplies[randomIndex];
      }
  }
  
  // countMatchingKeywords 计算字符串包含的关键词数量
  function countMatchingKeywords(inputString, keywords) {
      let count = 0;
      for (const kw of keywords) {
          if (kw === "") {
              continue;
          }
          if (inputString.includes(kw)) {
              count++;
          }
      }
      return count;
  }
  
  //是否在评论频率范围内
  function isWithinTimeLimit(lastInvocationTime, timeLimit) {
      return (Date.now() - lastInvocationTime) > timeLimit;
  }
  
  function deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj));
  }
  
  
  //发送AI问答
//   function sendAIQuestion(nickname,avatar,question,callback) {
//       // 调用coze
//       console.log("cozeBotid:",cozeBotid)
// 	console.log("cozeApikey:",cozeApikey)
//       if(cozeBotid && cozeApikey){
//           replyContent=chatCozeAPI(cozeBotid, cozeApikey,question);
//           callback(replyContent);
//           return
//       }
//       if(apiBase=="") return;
//       let url=removeSlashes(apiBase)
//       sendPostRequest(url,{
//           "type":"question",
//           "visitor_id":nickname,
//           "visitor_name":nickname,
//           "avatar":avatar,
//           "content": question
//       },function(message){
//           var messageResult=JSON.parse(message);
//           replyContent = removeHtmlTags(messageResult.result.content);
//           callback(replyContent);
//       })
//   }
  //发送Hook
  function Hook(nickname,content,html) {
      if(hookBase=="") return;
      sendPostRequest(hookBase,{
          "type":"question",
          "nickname":nickname,
          "content":content,
          "html":html,
      },function(message){
      })
  }
  //发送AI生成语音
  function sendPlayVoice(content){
      if(audioBase=="") return;
      sendPostRequest(audioBase,{"type":"answer","nickname":douyinNickname,"content":content,"html":content},function(res){
          console.log(res);
      });
  }
  //发送输入命令
  function sendInputCmd(content){
      sendPostRequest("http://127.0.0.1:8089/input",{"message":content},function(res){
          console.log(res);
      });
  }
  
  function showNewMessageBox(msg){
      let obj=document.getElementById('newMessageBox');
      if(!obj) return;
      document.getElementById('newMessageBox').innerHTML=msg;
  }
  

  //获取pdd商家信息以及当前聊天人信息
// async function getPddCustomerInfo() {

//     const originalFetch = window.fetch;
    
//     const response = await originalFetch("https://mms.pinduoduo.com/janus/api/customService/queryCustomServiceInfo",{
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",  
//       },
//       body: JSON.stringify(
//         {needCustomServiceInfo: true, needMallInfo: true}
//       ),
//     });
//     const clonedResponse = await response.clone();
  
//     const data=  await clonedResponse.json();
  
//       return data?.result?.mallInfoResult || {}
  
   
//   }


function getLocalStoragValue(){
    return{
        timeLimit:parseInt(localStorage.getItem("timeLimit"))*1000,//请求接口的时间频率
        apiBase:localStorage.getItem("apiBase"),
        hookBase:localStorage.getItem("hookBase"),
        audioBase:localStorage.getItem("audioBase"),
        questions:localStorage.getItem("questions"),

        speakLimit:parseInt(localStorage.getItem("speakLimit")),//循环话术频率
        speakBreak:parseInt(localStorage.getItem("speakBreak")),//每轮话术休息
        openaiAPIToken:localStorage.getItem("openaiAPIToken"),
        // var waitSendTime=10;//延迟回复
        finalReplay:localStorage.getItem("finalReplay"),
        qaKeywords:localStorage.getItem("qaKeywords"),
        blackWords:localStorage.getItem("blackWords"),
        douyinNickname:localStorage.getItem("douyinNickname"),
        speakNum:parseInt(localStorage.getItem("speakNum")),//循环讲解几号产品
        pushProduct:localStorage.getItem("pushProduct"),//循环弹品
        pushQuan:localStorage.getItem("pushQuan"),//循环弹券
        replyCommentStatus:localStorage.getItem("replyCommentStatus"),//是否回复评论
        insertPlaceholder:localStorage.getItem("insertPlaceholder"),//是否随机插入表情
        cozeBotid:localStorage.getItem("cozeBotid"),//扣子机器人id
        cozeApikey:localStorage.getItem("cozeApikey"),//扣子机器人API_KEY
        kefuBreak:localStorage.getItem("kefuBreak"),//客服机器人间隔时间
        feigeHumanWords:localStorage.getItem("feigeHumanWords"),//
        feigeHumanAccount:localStorage.getItem("feigeHumanAccount"),
        yuanqiBotId:localStorage.getItem("yuanqiBotId"),
        yuanqiUserId:localStorage.getItem("yuanqiUserId"),
        customHeader:localStorage.getItem("customHeader"),

    }
}





//如果input框是div的情况
function simulateUserInput(editableDiv, text) {
    // 创建一个 Range 对象
    var range = document.createRange();
    // 创建一个 Selection 对象
    var selection = window.getSelection();

    // 将光标移动到末尾
    if (editableDiv.childNodes.length > 0) {
        // 如果有子节点，找到最后一个文本节点或包含文本的元素
        var lastChild = editableDiv.lastChild;
        while (lastChild && lastChild.nodeType !== Node.TEXT_NODE && !lastChild.textContent.trim()) {
            lastChild = lastChild.previousSibling;
        }

        if (lastChild) {
            // 确保偏移量不超过文本内容的长度
            var offset = lastChild.nodeType === Node.TEXT_NODE 
                ? lastChild.textContent.length 
                : lastChild.childNodes.length;

            range.setStart(lastChild, offset);
            range.setEnd(lastChild, offset);
        } else {
            // 如果没有找到合适的文本节点，直接设置为 div 的末尾
            range.setStart(editableDiv, editableDiv.childNodes.length);
            range.setEnd(editableDiv, editableDiv.childNodes.length);
        }
    } else {
        // 如果没有子节点，直接设置为 div 的末尾
        range.setStart(editableDiv, 0);
        range.setEnd(editableDiv, 0);
    }

    // 移除当前的选择并添加新的范围
    selection.removeAllRanges();
    selection.addRange(range);

    // 插入文本
    document.execCommand('insertText', false, text);

    // 触发 input 事件
    var inputEvent = new Event('input', { bubbles: true });
    editableDiv.dispatchEvent(inputEvent);
}





