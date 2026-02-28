// import {sendPostRequest,removeHtmlTags,removeSlashes,chatCozeAPI,splitStringByChunk,getRandomEmoji,sendAsyncAIQuestion,getPddCustomerInfo,sleep} from './function'

// type NodeType = Node | HTMLElement | null;

// interface XpathResult {
//     singleNodeValue: NodeType;
//     iterateNext(): NodeType;
// }



// console.log("盛见AI客服插件加载成功");
// let isStarted = false; // 是否运行
// let isLoopStarted = false; // 循环发送是否运行

// var lastInvocationTime = 0; // 记录上次的时间
// var timeLimit = parseInt(localStorage.getItem("timeLimit") || '0') * 1000; // 请求接口的时间频率
// var apiBase = localStorage.getItem("apiBase") || '';
// var hookBase = localStorage.getItem("hookBase") || '';
// var audioBase = localStorage.getItem("audioBase") || '';
// let sourceQuestion = localStorage.getItem("questions") || '';
// var questions = sourceQuestion ? sourceQuestion.replace(/^\s+|\s+$/g, '').replace("\r\n", "\n").split("\n") : []; // 循环话术文案
// console.log("处理循环后的结果:---", questions)
// var questionsQueue = deepCopy(questions); // 循环话术队列
// var speakLimit = parseInt(localStorage.getItem("speakLimit") || '0'); // 循环话术频率
// var speakBreak = parseInt(localStorage.getItem("speakBreak") || '0'); // 每轮话术休息
// var openaiAPIToken = localStorage.getItem("openaiAPIToken") || '';
// // var waitSendTime=10;//延迟回复
// var finalReplay = localStorage.getItem("finalReplay") || '';
// var qaKeywords = localStorage.getItem("qaKeywords") || '';
// var blackWords = localStorage.getItem("blackWords") || '';
// var douyinNickname = localStorage.getItem("douyinNickname") || '';
// var speakNum = parseInt(localStorage.getItem("speakNum") || '0'); // 循环讲解几号产品
// var pushProduct = localStorage.getItem("pushProduct") || ''; // 循环弹品
// var pushQuan = localStorage.getItem("pushQuan") || ''; // 循环弹券
// var replyCommentStatus = localStorage.getItem("replyCommentStatus") || ''; // 是否回复评论
// var insertPlaceholder = localStorage.getItem("insertPlaceholder") || ''; // 是否随机插入表情
// var cozeBotid = localStorage.getItem("cozeBotid") || ''; // 扣子机器人id
// var cozeApikey = localStorage.getItem("cozeApikey") || ''; // 扣子机器人

// //监听页面元素变化
// function startListening(){
// 	console.log("盛见AI客服插件开始直播监听...");
// 	if(isStarted){
// 		alert("正在运行直播监听，请先刷新页面！");
// 		return;
// 	}
// 	alert("盛见AI客服插件开始直播监听");
// 	isStarted=true;
// 	//防止多次重复
// 	let history : any={};
// 	let historyList:any[]=[];
// 	let weidianHistory=[];
// 	let taobaoHistory:any[]=[];
// 	let preContent="";
// 	// 创建 MutationObserver 实例
// 	var observer = new MutationObserver(function (mutations) {

// 			mutations.forEach(function (mutation) {

// 				// console.log(mutation.target);

				
// 				//58同城微聊
// 				let fivexpath='../span[contains(@class,"im-last-msg")]';
// 				let fivenewMessage=getNode(mutation.target,fivexpath);
// 				if(fivenewMessage){
// 					simulateClick(fivenewMessage  as any);
// 					setTimeout(function(){
// 						let lastMessage=getNode(document.body,"//li[contains(@class, 'im-session-active')]");
// 						let nickname=getTextNodeContent(lastMessage as any,".//span[contains(@class,'im-session-username')]");
// 						let content=getTextNodeContent(lastMessage as any,".//span[contains(@class,'im-last-msg')]");
// 						let nickMessage=nickname+":"+content;
// 						if(preContent!=nickMessage){
// 							preContent=nickMessage;
// 							console.log("58同城微聊-",nickMessage);
// 							showNewMessageBox(nickMessage);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								preContent=nickname+":"+replyContent
// 									let fiveinput=getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-input-richtext']");
// 									simulateInput2(fiveinput as any,replyContent);
// 									simulateClick(getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-send']") as any);
// 							}else{
// 									sendAIQuestion(nickname,"",content,function(replyContent){
// 										if(replyContent=="") return;
// 										preContent=nickname+":"+replyContent
// 										let fiveinput=getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-input-richtext']");
// 										simulateInput2(fiveinput as any,replyContent);
// 										simulateClick(getNode(document.body,"//div[@class='im-chatwindow']//div[@class='im-send']") as any);
// 									})
// 							}
// 						}
// 					},1000)
// 				}
				
				
// 				//抖店飞鸽客服系统
// 				let pigeonChatScrollBox=getNode(mutation.target,'//div[@data-kora="conversation"]');
// 				if(pigeonChatScrollBox){
// 					let avatar="";
// 					let avatarNode=getNode(pigeonChatScrollBox,'//img[@alt="头像"]') as any;
// 					if(avatarNode){
// 						avatar=avatarNode.getAttribute("src") as any;
// 					}
// 					let flyNickname=getTextNodeContent(pigeonChatScrollBox,"//div[@title and string-length(@title) > 0]")
// 					let flyContent=getTextNodeContent(pigeonChatScrollBox,"//div[@title and string-length(@title) > 0]/following-sibling::*[1]")
// 					if(flyContent=="用户超时未回复，系统关闭会话") return;
// 					//防止多次执行
// 					console.log(flyNickname,flyContent);
// 					if(history["flyNickname"]!=flyNickname+flyContent){
// 						history["flyNickname"]=flyNickname+flyContent;
// 						simulateClick(pigeonChatScrollBox as any);
// 						//判断最新消息不是客服发出的
// 						if(flyContent.includes("机器人回复") || !getNode(mutation.target,'//div[@data-qa-id="qa-message-warpper"][last()]//div[contains(@style,"flex-direction: row-reverse")]')){
// 							console.log(flyNickname+":"+flyContent);
// 							showNewMessageBox(flyNickname+":"+flyContent);
// 							let randomMsg=getRandomElement();
// 							if(randomMsg!=""){
// 								simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]') as any,randomMsg as any);
// 								simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]') as any);
// 							}
							
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,flyContent);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								setTimeout(function(){
// 									simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]') as any,replyContent);
// 									simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]') as any);
// 								},1000)
			
// 							}else{
// 								setTimeout(function(){
// 									sendAIQuestion(flyNickname,avatar,flyContent,function(replyContent){
// 										if(replyContent=="") return;
// 										simulateInput(getNode(document.body,'//textarea[@data-qa-id="qa-send-message-textarea"]') as any,replyContent);
// 										simulateClick(getNode(document.body,'//div[@data-qa-id="qa-send-message-button"]') as any);
// 									})
// 								},1000)
// 							}

// 						}
// 					}
// 					return;
// 				}
				
				
// 					// 处理变动，可以在这里执行你想要的操作
// 					mutation.addedNodes.forEach(function (addedNode) {

// 						var douyinNicknames=douyinNickname.split("#");
// 						var blackWordArr=blackWords.split("#");
// 						var tabaoTextArea;
// 						//淘宝直播中控台
// 						// console.log(addedNode);
// 						let taobaoZhongkong=getNode(addedNode,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]');
// 						if(taobaoZhongkong){
// 							// console.log(addedNode);
// 							let flyNickname=getTextNodeContent(document.body,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]//div[contains(@class,"tc-comment-item-userinfo-name")]');
// 							let flyContent=getTextNodeContent(document.body,'//section[@class="tc-comment-list"]/div[1]/div[1]/div[1]/div[last()]//div[@class="tc-comment-item-content"]/span');
// 							if(!flyNickname || !flyContent) return;
// 							if(!taobaoHistory.includes(flyNickname+":"+flyContent) && !douyinNickname.includes(flyNickname) && !containsKeyword(flyContent,blackWordArr)){
// 								taobaoHistory.push(flyNickname+":"+flyContent);
// 								console.log(flyNickname+":"+flyContent);
// 								showNewMessageBox(flyNickname+":"+flyContent);
// 								//自动回复
// 								let replyContent=searchKeywordReplys(qaKeywords,flyContent);
// 								if(replyContent=="") replyContent=finalReplay;
// 								if(replyContent!=""){
// 									if(audioBase!="") sendPlayVoice(replyContent);
// 									setTimeout(function(addedNode : any,replyContent:any){
// 										simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div') as any);
										
//                                          tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]') as any;
// 										simulateInput(tabaoTextArea,replyContent);
// 										simulateEnter(tabaoTextArea)
// 									},3000);
// 								}else{
// 									async function delayLog(){
// 										await sendAsyncAIQuestion(apiBase, flyNickname, "", flyContent).then(replyContent => {
// 											if (replyContent != "") {
// 												console.log("回复" + nickname  + ":" + replyContent);
// 												simulateClick(getNode(addedNode,'//div[@class="tc-comment-item"][last()]//div[@class="tbla-space-item"][3]/div/div'));
// 												tabaoTextArea=getNode(document.body,'//textarea[@placeholder="回复观众或直接enter发评论，输入/可快捷回复"]');
// 												simulateInput(tabaoTextArea,replyContent);
// 												simulateEnter(tabaoTextArea)
// 											}
// 										}).catch();
// 									}
// 									delayLog()
									
// 								}
// 							}
// 							if(taobaoHistory.length>100){
// 								taobaoHistory.pop();
// 							}
// 						}
						
// 						//tiktok直播页面
// 						// console.log(addedNode);
// 						let tiktok=getNode(addedNode,'//div[@data-e2e="chat-message"]') || getNode(addedNode,'//div[@data-e2e="social-message"]');
// 						if(tiktok){
// 							// console.log(addedNode);
// 							let nickname=getTextNodeContent(addedNode,'.//span[@data-e2e="message-owner-name"]');
// 							let content=getTextNodeContent(addedNode,'./div[2]/div[2]') || getTextNodeContent(addedNode,'.//div[@data-e2e="social-message-text"]');
// 							if(!nickname) return;
// 							if(!content) content="已加入";
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							Hook(nickname,content,"");
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								if(audioBase!="") sendPlayVoice(replyContent);
// 								var textarea=getNode(document,'//div[@contenteditable="plaintext-only"]');
// 								if(textarea){
// 									let replys=splitStringByChunk(replyContent,60);
// 									setTimeout(function(){
// 											simulateInput3(textarea,replys[0]);
// 											simulateEnter(textarea);
// 									},1000)
// 								}
// 							}else{
// 								sendAIQuestion(nickname,"",content,function(replyContent){
// 									if(replyContent=="") return;
// 									if(audioBase!="") sendPlayVoice(replyContent);
// 									var textarea=getNode(document,'//div[@contenteditable="plaintext-only"]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,60);
// 										setTimeout(function(){
// 												simulateInput3(textarea,replys[0]);
// 												simulateEnter(textarea);
// 										},1000)
// 									}
// 								})
// 							}
// 							return;
// 						}
						
// 						//小红书直播中控后台
// 						// console.log(addedNode);
// 						let xiaohongshu=getNode(addedNode,'//div[@class="comment-list-item"]');
// 						if(xiaohongshu){
// 							let nickname=getTextNodeContent(addedNode,'./span[1]');
// 							let content=getTextNodeContent(addedNode,'./span[2]');
// 							console.log(nickname,content);
// 							if(!nickname || nickname=="主播" || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								var textarea=getNode(document,'//textarea[contains(@class,"d-text")]');
// 								if(textarea){
// 									let replys=splitStringByChunk(replyContent,60);
// 									setTimeout(function(){
// 											replyContent=replys[0].replace("{nickname}",nickname);
// 											simulateInput(textarea,replyContent);
// 											setTimeout(function(){
// 												simulateClick(getNode(document,'//span[text()="发送"]'));
// 											},1000);
// 									},1000)
// 								}
// 							}else{
// 								sendAIQuestion(nickname,"",content,function(replyContent){
// 									if(replyContent=="") return;
// 									var textarea=getNode(document,'//textarea[contains(@class,"d-text")]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,60);
// 										setTimeout(function(){
// 												replyContent=replys[0].replace("{nickname}",nickname);
// 												simulateInput(textarea,replyContent);
// 												setTimeout(function(){
// 													simulateClick(getNode(document,'//span[text()="发送"]'));
// 												},1000);
// 										},1000)
// 									}
// 								})
// 							}
// 							return;
// 						}
// 						//抖音巨量百应后台
// 						// console.log(addedNode);
// 						let juliang=getNode(addedNode,'//div[contains(@class,"commentItem")]');
// 						if(juliang){
// 							let nickname=getTextNodeContent(addedNode,'.//div[contains(@class,"nickname")]');
// 							let content=getTextNodeContent(addedNode,'.//div[contains(@class,"description")]');
// 							if(!nickname || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							if(!historyList.includes(requestBody)){
// 								historyList.push(requestBody);
// 								showNewMessageBox(requestBody);
// 								console.log(requestBody);
// 								//自动回复
// 								let replyContent=searchKeywordReplys(qaKeywords,content);
// 								if(replyContent=="") replyContent=finalReplay;
// 								if(replyContent!=""){
// 									replyContent=replyContent.replace("{昵称}",nickname);
// 									var textarea=getNode(document,'//textarea[contains(@class,"auxo-input-borderless")]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,50);
// 										setTimeout(function(){
// 												replyContent=replys[0].replace("{nickname}",nickname);
// 												simulateInput(textarea,replyContent);
// 												simulateEnter(textarea);
// 												// simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
// 										},1000)
// 									}
// 								}else{
// 									replyContent=replyContent.replace("{昵称}",nickname);
// 									sendAIQuestion(nickname,"",content,function(replyContent){
// 										if(replyContent=="") return;
// 										var textarea=getNode(document,'//textarea[contains(@class,"auxo-input-borderless")]');
// 										if(textarea){
// 											let replys=splitStringByChunk(replyContent,50);
// 											setTimeout(function(){
// 													replyContent=replys[0].replace("{nickname}",nickname);
// 													simulateInput(textarea,replyContent);
// 													simulateEnter(textarea);
// 													// simulateClick(getNode(document,'//div[contains(@class,"sendBtn")]'));
// 											},1000)
// 										}
// 									})
// 								}
// 							}
// 							if(historyList.length>200){
// 								historyList.pop();
// 							}
// 							return;
// 						}

					
// 						//视频号直播中控后台
// 						// console.log(addedNode);
// 						let shipinhao=getNode(addedNode,'//div[contains(@class,"vue-recycle-scroller__item-view")]');
// 						if(shipinhao){
// 							let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"message-username-desc")]');
// 							let content=getTextNodeContent(addedNode,'.//span[contains(@class,"message-content")]');
// 							if(!nickname || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								if(audioBase!="") sendPlayVoice(replyContent);
// 								//判断频率
// 								if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
// 								var textarea=getNode(document,'//textarea[@class="message-input"]');
// 								if(textarea){
// 									let replys=splitStringByChunk(replyContent,60);
// 									simulateInput(textarea,replys[0]);
// 									simulateEnter(textarea);
// 									lastInvocationTime = Date.now();
// 								}
// 							}else{
// 								sendAIQuestion(nickname,"",content,function(replyContent){
// 									if(replyContent=="") return;
// 									if(audioBase!="") sendPlayVoice(replyContent);
// 								    if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
// 									var textarea=getNode(document,'//textarea[@class="message-input"]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,60);
// 										simulateInput(textarea,replys[0]);
// 										simulateEnter(textarea);
// 										lastInvocationTime = Date.now();
					
// 									}
// 								})
// 							}
// 							return;
// 						}
						
// 						//支付宝直播中控后台
// 						// console.log(addedNode);
// 						let alipayCome=getNode(addedNode,'//div[contains(@class,"roomEvents")]');
// 						if(alipayCome){
// 							let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"roomUserStyle")]');
// 							let content=getTextNodeContent(addedNode,'.//div[contains(@class,"eventItem")]');
// 							if(!content) return;
// 							requestBody=content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								setTimeout(function(){
// 									var textarea=getNode(document,'//textarea[@id="content"]');
// 									if(textarea){
// 										replyContent=replyContent.replace("{nickname}",nickname);
// 										simulateInput(textarea,replyContent);
// 										simulateEnter(textarea);
// 									}
// 								},1000)
										
// 							}
// 							return;
// 						}
						
// 						let alipay=getNode(addedNode,'//div[contains(@class,"cmtItem")]');
// 						if(alipay){
// 							let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"userName")]');
// 							let content=getTextNodeContent(addedNode,'.//span[contains(@class,"cmtContent")]');
// 							if(!nickname || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								setTimeout(function(){
// 									var textarea=getNode(document,'//textarea[@id="content"]');
// 									if(textarea){
// 										simulateInput(textarea,replyContent);
// 										simulateEnter(textarea);
// 									}
// 								},1000)
										
// 							}else{
// 								setTimeout(function(){
// 									sendAIQuestion(nickname,"",content,function(replyContent){
// 										if(replyContent=="") return;
// 										var textarea=getNode(document,'//textarea[@id="content"]');
// 										if(textarea){
// 											simulateInput(textarea,replyContent);
// 											simulateEnter(textarea);
// 										}
// 									})
// 								},1000)
// 							}
// 							return;
// 						}


// 						//淘宝直播间
// 						let taobao=getNode(addedNode,'//div[contains(@class,"itemWrap")]');
// 						if(taobao){
// 							let nickname=getTextNodeContent(addedNode,'.//span[contains(@class,"author")]');
// 							let content=getTextNodeContent(addedNode,'.//span[contains(@class,"content")]');
// 							if(!nickname || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								if(audioBase!=""){
// 									sendPlayVoice(replyContent);return;
// 								}
// 								var textarea=getNode(document,'//*[contains(@class,"chatInputCenterTextarea-")]');
// 								if(textarea){
// 									let replys=splitStringByChunk(replyContent,50);
// 									simulateInput(textarea,replys[0]);
// 									setTimeout(function(){
// 											simulateEnter(textarea);
// 									},2000)
// 								}
// 							}else{
// 								sendAIQuestion(nickname,"",content,function(replyContent){
// 									if(replyContent=="") return;
// 									if(audioBase!=""){
// 										sendPlayVoice(replyContent);return;
// 									}
// 									var textarea=getNode(document,'//*[contains@(class,"chatInputCenterTextarea-")]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,50);
// 										simulateInput(textarea,replys[0]);
// 										setTimeout(function(){
// 												simulateEnter(textarea);
// 										},2000)
// 									}
// 								})
// 							}
// 							return;
// 						}
						

					
// 						//微信小店 
// 						// console.log(addedNode);
// 						let weixindian=getNode(addedNode,'//div[contains(@class,"session-list-card")]');
// 						if(weixindian){
// 							let nickname=getTextNodeContent(addedNode,'//div[@class="user-nickname"]');
// 							let content=getTextNodeContent(addedNode,'//div[@class="summary-wrap"]');
// 							if(!nickname || !content) return;
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							if(!historyList.includes(requestBody)){
// 								historyList.push(requestBody);
// 								showNewMessageBox(requestBody);
// 								console.log(requestBody);
// 								simulateClick(weixindian);
// 								//自动回复
// 								let replyContent=processQaKeywords(qaKeywords,content);
// 								if(replyContent=="") replyContent=finalReplay;
// 								if(replyContent!=""){
// 									historyList.push(nickname+":"+replyContent);
// 									var textarea=getNode(document,'//textarea[@class="text-area"]');
// 									if(textarea){
										
// 										setTimeout(function(){
// 											simulateInput(textarea,replyContent);
// 											simulateEnter(textarea);
											
// 										},1000);

// 									}
// 								}else{
// 									sendAIQuestion(nickname,"",content,function(replyContent){
// 										if(replyContent=="") return;
// 										historyList.push(nickname+":"+replyContent);
// 										var textarea=getNode(document,'//textarea[@class="text-area"]');
// 										if(textarea){
											
// 											setTimeout(function(){
// 												simulateInput(textarea,replyContent);
// 												simulateEnter(textarea);
// 											},1000);
// 										}
// 									})
// 								}
// 							}
// 							if(historyList.length>200){
// 								historyList.pop();
// 							}
// 							return;
// 						}
// 						//快手
// 						let kuaishou=getNode(addedNode,'//img[contains(@class,"icon-extend")]');
// 						if(kuaishou){
// 							let nickname=getTextNodeContent(document.body,'//div[@class="ReactVirtualized__Grid__innerScrollContainer"]/div[last()]//span[contains(@class,"username")]');
// 							let content=getTextNodeContent(document.body,'//div[@class="ReactVirtualized__Grid__innerScrollContainer"]/div[last()]//span[contains(@class,"replied-content")]');
// 							if(!nickname || !content) return;
// 							nickname=nickname.replace(":","");
// 							//判断黑名单
// 							if(douyinNicknames.includes(nickname) || containsKeyword(content,blackWordArr)) return;
// 							requestBody=nickname+":"+content;
// 							showNewMessageBox(requestBody);
// 							console.log(requestBody);
// 							//自动回复
// 							let replyContent=processQaKeywords(qaKeywords,content);
// 							if(replyContent=="") replyContent=finalReplay;
// 							if(replyContent!=""){
// 								if(audioBase!=""){
// 									sendPlayVoice(replyContent);return;
// 								}
// 								var textarea=getNode(document,'//input[@placeholder="一键回复观众或直接发评论"]');
// 								if(textarea){
// 									let replys=splitStringByChunk(replyContent,40);
// 									for(let item in replys){
// 										setTimeout(function(){
// 											simulateInput(textarea,replys[item]);
// 											simulateClick(getNode(document,"//span[text()='发送']"));
// 										},item*1000);
// 									}

// 								}
// 							}else{
// 								sendAIQuestion(nickname,"",content,function(replyContent){
// 									if(replyContent=="") return;
// 									if(audioBase!=""){
// 										sendPlayVoice(replyContent);return;
// 									}
// 									var textarea=getNode(document,'//input[@placeholder="一键回复观众或直接发评论"]');
// 									if(textarea){
// 										let replys=splitStringByChunk(replyContent,40);
// 										for(let item in replys){
// 											setTimeout(function(){
// 												simulateInput(textarea,replys[item]);
// 												simulateClick(getNode(document,"//span[text()='发送']"));
// 											},item*1000);
// 										}
// 									}
// 								})
// 							}
// 							return;
// 						}
// 						// let tiktok=getNode(addedNode,'//div[@data-e2e="chat-message"]');
// 						// if(tiktok){
// 						// 	//获取昵称
// 						// 	nickname=getTextNodeContent(tiktok,'.//span[@data-e2e="message-owner-name"]');
// 						// 	commentInfo=getTextNodeContent(tiktok,"./div[2]/div[2]");
// 						// 	if(!nickname || !commentInfo) return;
// 						// 	requestBody=nickname+":"+commentInfo;
// 						// 	showNewMessageBox(requestBody);
// 						// 	console.log(requestBody);
// 						// }
// 						//抖音网页直播间

// 						let douyin=getNode(addedNode,'//div[contains(@class,"webcast-chatroom___item")]');
// 						if(!douyin) return;

// 						var nickname : string;
// 						var commentInfo:any;
// 						 //获取昵称
// 						 nickname=getTextNodeContent(addedNode,"./div/span[2]")
			
// 						//获取内容
// 						commentInfo=getTextNodeContent(addedNode,"./div/span[3]")
			

// 						//判断
// 						if(!nickname || !commentInfo) return;
// 						// simulateClick(getNode(addedNode,'./div/span[2]'));
// 						let sourceHtml=getHtmlNodeContent(addedNode,"./div/span[3]");
// 						let gift=""
// 						if (sourceHtml.includes("e9b7db267d0501b8963d8000c091e123")) gift="人气票";
// 						if (sourceHtml.includes("7ef47758a435313180e6b78b056dda4e"))  gift="小心心";
// 						if (sourceHtml.includes("96e9bc9717d926732e37351fae827813"))  gift="玫瑰";
// 						if (sourceHtml.includes("722e56b42551d6490e5ebd9521287c67"))  gift="粉丝团灯牌";
// 						if (sourceHtml.includes("34ca755520ab0ef2e67848c3f810550a"))  gift="粉丝团灯牌";
// 						if (sourceHtml.includes("5ddfcd51beaa7cad1294a4e517bc80fb"))  gift="点亮粉丝团";
// 						if (sourceHtml.includes("11bcb8bdc16b66fb330346cb478c1c98"))  gift="荧光棒";
// 						if (sourceHtml.includes("0e176c2d0ac040ae0cad13d100f61b02"))  gift="热气球";
// 						if (sourceHtml.includes("2756f07818a73a8c79f024e959665110"))  gift="棒棒糖";
// 						if (sourceHtml.includes("8155c7cfcb680890bb1062fc664da3e7"))  gift="皇冠";
// 						if (sourceHtml.includes("42d4cd329e5c01be43c3432567847507"))  gift="鲜花";
// 						if (sourceHtml.includes("4960c39f645d524beda5d50dc372510e"))  gift="你最好看";
// 						if (sourceHtml.includes("632fb87caf1844e8235462e3fd020b7f"))  gift="多元勋章";
// 						if (sourceHtml.includes("71801c53df3977b1470ac2afb8250ac1"))  gift="大啤酒";
// 						if (sourceHtml.includes("46c8e1f2f933d5af7c275b11decfb436"))  gift="妙手生花";
// 						if (sourceHtml.includes("送出") && gift=="") console.log(sourceHtml);
// 						if(gift!="") commentInfo+=" "+gift
// 						//判断黑名单
// 						if(douyinNicknames.includes(nickname) || containsKeyword(commentInfo,blackWordArr)) return;
// 						requestBody=nickname+":"+commentInfo;
// 						showNewMessageBox(requestBody);
// 						console.log(requestBody);
// 						//hook 消息
// 						Hook(nickname,commentInfo,getHtmlNodeContent(addedNode,"./div/span[3]"));

// 						//判断关键词回复话术
// 						let replyContent=searchKeywordReplys(qaKeywords,commentInfo);
// 						if(replyContent=="") replyContent=finalReplay;
// 						if(replyContent){
// 							//判断频率
// 							if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
// 							replyContent=replyContent.replace("{昵称}",nickname);
// 							replyContent=replyContent.replace("{评论}",commentInfo);
// 							console.log("关键词回复命中回复----",replyContent);
// 							sendReplyContent(replyContent);
// 							lastInvocationTime = Date.now();
							
// 							return;
// 						}
// 						//判断频率
// 						if(timeLimit && !isWithinTimeLimit(lastInvocationTime,timeLimit)) return;
// 						//判断AI
// 						lastInvocationTime = Date.now();
// 						sendAIQuestion(nickname,"",commentInfo,function(replyContent){
// 							console.log("AI回复----",replyContent);
// 							if(replyContent=="") return;
// 							replyContent=replyContent.replace("{昵称}",nickname);
// 							replyContent=replyContent.replace("{评论}",commentInfo);
// 							sendReplyContent(replyContent);
// 						})
							 
// 					});
// 			});
	
// 	});
// 	// 配置观察选项
// 	var config = { childList: true,attributes:true,characterData:true,subtree:true };
// 	// 开始观察变化
// 	observer.observe(document.body, config);


// 	// 视频号助手-私信
// 	shipinSixin=getNode(document.body,'//ul[@class="weui-desktop-tab__navs__inner"]');
// 	if(shipinSixin){
// 		console.log("视频号助手-私信");
// 		setIntervalSync(function(){
// 			for(i=1;i<=2;i++){
// 				simulateClick(getNode(document.body,'//ul[@class="weui-desktop-tab__navs__inner"]/li['+i+']/a'))
// 				if(i==2){
// 					moshengrens=getNodes(document.body,"//div[@class='session-wrap']");
// 					for(index in moshengrens){
// 						node=moshengrens[index];
// 						simulateClick(node); 
// 						console.log(node);

// 							simulateInput(getNode(document.body, '//textarea[@class="edit_area"]') as any,"你好");
// 							simulateEnter(getNode(document.body,'//textarea[@class="edit_area"]') as any);
// 					}
// 				}
// 			}
// 		}, 2000);
// 	}

// }





// //抖音

// function startDouyinFeige() {
// 	console.log("开启运行盛见AI客服客服插件...");
// 	if (isLoopStarted) {
// 		alert("正在运行盛见AI客服客服插件，请先刷新页面！");
// 		return;
// 	}
// 	alert("盛见AI客服抖音飞鸽客服 | 拼多多客服插件执行");
// 	isLoopStarted = true;

// 	//每秒执行
// 	async function delayLog() {

// 		//获取PDD商家信息
// 		const pddCustomer= await getPddCustomerInfo()

// 		while (true) {
// 			//抖店飞鸽客服
// 			let feigeDao = getNode(document, '//div[@data-qa-id="qa-conversation-chat-item"]//div[contains(text(), \'秒\') or contains(text(), \'分钟\')]') as any;
// 			if (feigeDao) {
// 				simulateClick(feigeDao);
// 				let nickname = getTextNodeContent(document, "//div[@data-qa-id=\"qa-conversation-chat-item\"]//div[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/preceding-sibling::div[1]/div[1]")
// 				let content = getTextNodeContent(document, "//div[@data-qa-id=\"qa-conversation-chat-item\"]//div[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/preceding-sibling::div[1]/div[2]")
// 				let allMessage = nickname + ":" + content;

// 				console.log(allMessage);
// 				showNewMessageBox(allMessage);

// 				//自动回复
// 				let replyContent = processQaKeywords(qaKeywords, content);
// 				if (replyContent == "") replyContent = finalReplay;
// 				if (replyContent == "") replyContent = getRandomElement() as any;
// 				if (replyContent != "") {

// 					if (speakLimit) await sleep(speakLimit * 1000);
// 					console.log("回复" + nickname + ":" + replyContent);
// 					simulateInput(getNode(document.body, '//textarea[@data-qa-id="qa-send-message-textarea"]') as any, replyContent);
// 					simulateClick(getNode(document.body, '//div[@data-qa-id="qa-send-message-button"]') as any);
// 				} else {
// 					await sendAsyncAIQuestion(apiBase, nickname, "", content).then(replyContent => {
// 						if (replyContent != "") {
// 							console.log("回复" + nickname + ":" + replyContent);
// 							simulateInput(getNode(document.body, '//textarea[@data-qa-id="qa-send-message-textarea"]')  as any, replyContent  as any);
// 							simulateClick(getNode(document.body, '//div[@data-qa-id="qa-send-message-button"]') as any) ;
// 						}
// 					}).catch();
// 				}
// 				await sleep(1000);
// 				continue;
// 			}

// 			//拼多多客服
			
// 			let pinduoduo=getNode(document.body,"//div[@class='chat-time']/p[contains(text(), '秒') or contains(text(), '分钟')]/parent::div/parent::div") as any;
// 			if(pinduoduo) {
// 				simulateClick2(pinduoduo);
// 				let nickname=getTextNodeContent(document,'//div[@class=\'chat-time\']/p[contains(text(), \'秒\') or contains(text(), \'分钟\')]/parent::div/parent::div//div[@class="chat-nickname"]');
// 				let content=getTextNodeContent(document,'//div[@class=\'chat-time\']/p[contains(text(), \'秒\') or contains(text(), \'分钟\')]/parent::div/parent::div//p[@class="chat-message-content"]');
// 				//获取用户id
// 				let userStr=pinduoduo.getAttribute("data-random")
		
// 				if(userStr){
// 					userStr=userStr.split("-")[0]
// 				}
// 				let allMessage=nickname+":"+content;
// 				console.log(allMessage);

// 				showNewMessageBox(allMessage);
	
// 				//自动回复
// 				console.log("finalReplay:",finalReplay)
// 				let replyContent=processQaKeywords(qaKeywords,content);
// 				if(replyContent=="") replyContent=finalReplay;
// 				if(replyContent=="") replyContent= getRandomElement() as any;
// 				console.log("replyContent:",replyContent)
// 				if(!!replyContent){
// 					console.log("回复" + nickname + ":" + replyContent);
// 					var textarea=getNode(document,'//textarea[@id="replyTextarea"]');
// 					// history.push(nickname+":"+replyContent);
// 					if(textarea){
// 						simulateInput(textarea as any,replyContent);
// 						simulateEnter(textarea as any);
// 						if (speakLimit) await sleep(speakLimit * 1000);
// 					}

// 				}else{				
// 					const roomId=userStr+pddCustomer.mallId

// 					await sendAsyncAIQuestion(apiBase,roomId,"",content).then(replyContent => {
// 						if(replyContent!=""){
// 							console.log("回复" + nickname + ":" + replyContent);
// 							var textarea=getNode(document,'//textarea[@id="replyTextarea"]');
// 							if(textarea){
// 								simulateInput(textarea as any,replyContent as any);
// 								simulateEnter(textarea as any);
// 							}
// 						}
// 					})
// 				}
// 				await sleep(1000);
// 				continue;
// 			}
// 			await sleep(1000);
// 		}
// 	}
// 	delayLog();
// }




// function getNode(node: Node, xpath: string): NodeType {
//     const element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//     return element ? element : null;
// }

// function getNodes(node: Node, xpath: string): HTMLElement[] {
//     const nodes: HTMLElement[] = [];
//     const iterator = document.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
//     let currentNode: NodeType = iterator.iterateNext();

//     while (currentNode) {
//         nodes.push(currentNode as HTMLElement);
//         currentNode = iterator.iterateNext();
//     }

//     return nodes;
// }

// function getTextNodeContent(node: Node, xpath: string): any {
//     const element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//     return element ? element.textContent?.replace("：", "").replace(":", "").trim() : null;
// }

// function getHtmlNodeContent(node: Node, xpath: string): any {
//     const element = document.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as any;
//     return element ? element.innerHTML.trim() : null;
// }

// function getHtmlNodeAttribute(node: Node, xpath: string, attr: string): string | null {
//     const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
//     const divNode = result.singleNodeValue as HTMLElement;

//     if (divNode) {
//         const attributeValue = divNode.getAttribute(attr);
//         console.log(`${attr}:`, attributeValue);
//         return attributeValue;
//     } else {
//         console.log('No matching div found.');
//         return null;
//     }
// }

// function setIntervalSync(callback: () => void, time: number): void {
//     function execute(): void {
//         callback();
//         if (typeof time === 'number' && time >= 0) {
//             setTimeout(execute, time);
//         }
//     }
//     execute();
// }

// function syncTimeout(callback: () => void, delay: number): void {
//     callback();
//     setTimeout(() => syncTimeout(callback, delay), delay);
// }






// // 发送回复内容
// function sendReplyContent(replyContent: string): void {
//     if (audioBase !== "") {
//       sendPlayVoice(replyContent);
//     }
//     if (replyCommentStatus !== "yes") return;
//     if (insertPlaceholder === "yes") replyContent += getRandomEmoji();
  
//     const replys = splitStringByChunk(replyContent, 50);
//     for (const index in replys) {
//       const textareaElement = getNode(document.body, '//textarea[@class="webcast-chatroom___textarea"]') as any;
//       if (textareaElement) {
//         simulateInput(textareaElement, replys[index]);
//         const btn = document.querySelector(".webcast-chatroom___send-btn") as any;
//         if (btn) simulateClick(btn);
//       }
//     }
//   }
  
//   // 模拟文本输入
//   function simulateTextInput2(element: HTMLElement, text: string): void {
//     // 确保元素是可编辑的
//     if (element.contentEditable === "true") {
//       // 设置焦点到元素
//       element.focus();
  
//       // 模拟按键事件
//       text.split('').forEach(function (char) {
//         // 创建一个合成事件
//         const event = new Event('textInput', { bubbles: true, cancelable: true }) as any;
//         // 设置event的data属性为当前字符
//         event.data = char;
  
//         // 触发事件
//         element.dispatchEvent(event);
  
//         // 直接插入文本到元素中
//         element.textContent += char;
//       });
//     } else {
//       console.error('Element is not contenteditable');
//     }
//   }
  
//   // 辅助函数，模拟鼠标悬停事件
//   function simulateHover(element: HTMLElement): void {
//     const event = new MouseEvent('mouseover', {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     });
//     element.dispatchEvent(event);
//   }
  
//   // 辅助函数，模拟点击事件
//   function simulateClick(element: any): void {
//     const event = new MouseEvent('click', {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     });
//     element.dispatchEvent(event);
//   }
  
//   // 辅助函数，模拟输入事件
//   function simulateInput(element: HTMLInputElement | HTMLTextAreaElement, text: string): void {
//     if (!element || !text) return;
//     element.value = text;
//     const event = new InputEvent('input', {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     });
//     element.dispatchEvent(event);
//     console.log("输入事件:------");
//   }
  
//   // 辅助函数，模拟输入事件
//   function simulateInput2(element: HTMLElement, text: string): void {
//     if (!element || !text) return;
  
//     // 创建一个临时的input元素来模拟输入
//     const tempInput = document.createElement('input');
//     tempInput.type = 'text';
//     tempInput.value = text;
  
//     // 同步input值到目标元素
//     element.textContent = text;
//     element.focus();
//     // 触发input事件
//     const event = new InputEvent('input', {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     });
//     element.dispatchEvent(event);
//   }
  
//   // 辅助函数，模拟输入事件
//   function simulateInput3(element: HTMLElement, html: string): void {
//     if (!element || !html) return;
//     // 同步input值到目标元素
//     element.innerHTML = html;
//   }
  
//   function simulateEditableInput(xpath: string, input: string): void {
//     chrome.runtime.sendMessage({ action: "simulateInput", xpath: xpath, input: input });
//   }
  
//   // 辅助函数，模拟键盘输入事件
//   function simulateEnter(element: HTMLElement): void {
//     // 创建一个新的键盘事件（回车键）
//     const enterEvent = new KeyboardEvent('keydown', {
//       key: 'Enter',
//       keyCode: 13,
//       code: 'Enter',
//       which: 13,
//       bubbles: true,
//       cancelable: true,
//     });
//     console.log("回车发送:------");
//     element.dispatchEvent(enterEvent);
//   }
  
//   function simulateClick2(element: HTMLElement): void {
//     const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
//     const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
//     const clickEvent = new MouseEvent('click', { bubbles: true });
  
//     element.dispatchEvent(mouseDownEvent);
//     element.dispatchEvent(mouseUpEvent);
//     element.dispatchEvent(clickEvent);
//   }
  
//   function getRandomElement(): string | undefined {
//     if (questionsQueue.length <= 0) {
//       questionsQueue = deepCopy(questions);
//     }
//     const randomElement = questionsQueue.shift();
//     return randomElement;
//   }
  







// // 关键词自动回复的匹配内容
// function processQaKeywords(qaKeywords: string, commentInfo: string): string {
//     console.log("qaKeywords:", qaKeywords);
//     console.log("commentInfo:", commentInfo);
  
//     if (!qaKeywords || !commentInfo) {
//       return "";
//     }
  
//     const qaKeywordsArr = qaKeywords.split("\n");
//     const bestReplies: string[][] = []; // 用于存储所有可能的最佳回复
  
//     for (const row of qaKeywordsArr) {
//       const qa = row.split("#");
//       if (qa.length !== 2) {
//         continue;
//       }
  
//       const keywords = qa[0].split("|");
//       if (containsKeyword(commentInfo, keywords)) {
//         // 将所有可能的回复添加到数组中
//         bestReplies.push(qa[1].split("|"));
//       }
//     }
  
//     console.log("bestReplies:", bestReplies);
  
//     if (bestReplies.length === 0) {
//       return "";
//     } else {
//       // 随机选择一个回复
//       const randomIndex = Math.floor(Math.random() * bestReplies.length);
//       return bestReplies[randomIndex][Math.floor(Math.random() * bestReplies[randomIndex].length)];
//     }
//   }
  
//   // searchKeywordReplys 搜索关键词并返回对应的回复内容
//   function searchKeywordReplys(replys: string, keyword: string): string {
//     if (replys === "" || keyword === "") {
//       return "";
//     }
  
//     const replyLines = replys.split("\n");
//     const bestReplies: string[] = []; // 用于存储所有可能的最佳回复
  
//     for (const reply of replyLines) {
//       const qa = reply.split("#");
//       if (qa.length === 2) {
//         const questions = qa[0].split("|");
//         const matchCount = countMatchingKeywords(keyword, questions);
//         if (matchCount > 0) {
//           // 如果匹配成功，将所有可能的回复添加到数组中
//           const possibleReplies = qa[1].split("|");
//           bestReplies.push(...possibleReplies);
//         }
//       }
//     }
  
//     if (bestReplies.length === 0) {
//       return "";
//     } else {
//       // 随机选择一个回复
//       const randomIndex = Math.floor(Math.random() * bestReplies.length);
//       return bestReplies[randomIndex];
//     }
//   }
  
//   // countMatchingKeywords 计算字符串包含的关键词数量
//   function countMatchingKeywords(inputString: string, keywords: string[]): number {
//     let count = 0;
//     for (const kw of keywords) {
//       if (kw === "") {
//         continue;
//       }
//       if (inputString.includes(kw)) {
//         count++;
//       }
//     }
//     return count;
//   }
  
//   // 是否在评论频率范围内
//   function isWithinTimeLimit(lastInvocationTime: number, timeLimit: number): boolean {
//     return (Date.now() - lastInvocationTime) > timeLimit;
//   }
  
//   // 深拷贝对象
//   function deepCopy<T>(obj: T): T {
//     return JSON.parse(JSON.stringify(obj));
//   }
  
//   // 判断是否包含关键词
//   function containsKeyword(commentInfo: string, keywords: string[]): boolean {
//     for (const keyword of keywords) {
//       if (commentInfo.includes(keyword)) {
//         return true;
//       }
//     }
//     return false;
//   }
  




// // 发送AI问答
// function sendAIQuestion(
//     nickname: string,
//     avatar: string,
//     question: string,
//     callback: (replyContent: string) => void
//   ): void {
//     // 调用coze
//     if (cozeBotid && cozeApikey) {
//       const replyContent = chatCozeAPI(cozeBotid, cozeApikey, question) as any;
//       callback(replyContent);
//       return;
//     }
  
//     if (apiBase === "") return;
  
//     const url = removeSlashes(apiBase);
//     sendPostRequest(
//       url,
//       {
//         type: "question",
//         visitor_id: nickname,
//         visitor_name: nickname,
//         avatar: avatar,
//         content: question,
//       },
//       (message: string) => {
//         const messageResult = JSON.parse(message);
//         const replyContent = removeHtmlTags(messageResult.result.content);
//         callback(replyContent);
//       }
//     );
//   }
  
//   // 发送Hook
//   function Hook(nickname: string, content: string, html: string): void {
//     if (hookBase === "") return;
//     sendPostRequest(
//       hookBase,
//       {
//         type: "question",
//         nickname: nickname,
//         content: content,
//         html: html,
//       },
//       (message: string) => {
//         // 处理回调
//       }
//     );
//   }
  
//   // 发送AI生成语音
//   function sendPlayVoice(content: string): void {
//     if (audioBase === "") return;
//     sendPostRequest(
//       audioBase,
//       { type: "answer", nickname: douyinNickname, content: content, html: content },
//       (res: string) => {
//         console.log(res);
//       }
//     );
//   }
  
//   // 发送输入命令
//   function sendInputCmd(content: string): void {
//     sendPostRequest("http://127.0.0.1:8089/input", { message: content }, (res: string) => {
//       console.log(res);
//     });
//   }
  
//   // 显示新的消息框
//   function showNewMessageBox(msg: string): void {
//     const obj = document.getElementById('newMessageBox');
//     if (!obj) return;
//     document.getElementById('newMessageBox')!.innerHTML = msg;
//   }

export{}
  