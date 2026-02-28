// const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.error('-----------',request)
        console.log("这里是bg")
        // 处理模拟输入事件
        if (request.action === "simulateInput") {
            let xpath=request.xpath;
            executeSimulateEditableInput(sender.tab.id,xpath,request.input)

        }
        // 处理来自 content.js 的消息

        if(request.type=="save_data"){
            // localStorage.setItem("questions",request.data)
            sendResponse(request)
            //向content.js通信
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    const activeTab = tabs[0];
                    console.error("activeTab:",activeTab)
                    console.error("send:",request.data )
                    chrome.tabs.sendMessage(activeTab.id, { type: "save_data", data: request.data }, (response) => {

                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        } else {
                            console.log("Response from content script: ", response);
                            
                        }
                        sendResponse({status:"success",message:chrome.runtime.lastError})
                    });
                } else {
                    console.error("No active tab found.");
                }
            });

            sendResponse("保存成功:-----")
        }
        if(request.type=="start_shop"){
            // sendResponse("电商客服开始执行！！")

            //向content.js通信
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    const activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, { type: "start_shop", data: true, tab: activeTab }, (response) => {
                      if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                      } else {
                        console.log("Response from content script: ", response);
                      }
                    });
                } else {
                    console.error("No active tab found.");
                }
            });

        }
        if(request.type=="start_live"){
          

            //向content.js通信
              //向content.js通信
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                sendResponse(tabs)
                if (tabs.length > 0) {
                    const activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, { type: "start_live", data: request.data, tab: activeTab }, (response) => {
                      if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        // sendResponse({type:"error",message:"启动失败"})
                      } else {
                        console.log("Response from content script: ", response);
                        // sendResponse("直播互动开始执行！！")
                        // sendResponse({type:"success",message:"启动成功"})
                      }
                    });
                } else {
                    sendResponse(tabs)
                    console.error("No active tab found.");
                }
            });

        }
        if (request.type == "init_popupData") {
            //向popup发送数据
            chrome.storage.local.set({"init_popupData":request.data},()=>{
                sendResponse("保存缓存")
            })


        }
        if(request.type=="isStart"){
           
            // chrome.runtime.sendMessage({ type: "isStart", data: request.data })
            chrome.tabs.query({}, (tabs) => {
                // sendResponse(tabs)
                if (tabs.length > 0) {
                    console.error("bg____isStart:",request)
                    const activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id,{ type: "isStart", data: request.data }, (response) => {
                      
                        // sendResponse(request)
                    });
                } else {
                    // sendResponse(tabs)
                    console.error("No active tab found.");
                }
            });
        }
        if(request.type=="openTab"){
            chrome.tabs.create({
                url: request.url,
                active: false, // 后台打开
              });
        }

        if (request.type === "networkCatch") {
            reqResp={};
            let targetTabId=request.tabId;
            let hookBase=request.hookBase;
            chrome.debugger.attach({tabId: targetTabId}, "1.3", function() {
                console.log("Debugger attached to tabId " + targetTabId);
            });
            chrome.debugger.sendCommand({tabId: targetTabId}, "Network.enable");
            chrome.debugger.onEvent.addListener(function(debuggeeId, method, params) {
                if (!reqResp[params.requestId]) reqResp[params.requestId]={};

                if (method === "Network.requestWillBeSent") {
                    reqResp[params.requestId]["url"]=params.request.url;
                    reqResp[params.requestId]["headers"]=params.request.headers;
                    // 如果请求类型是 POST，并且请求体中包含数据
                    if (params.request.method === "POST" && params.request.postData) {
                        reqResp[params.requestId]["post"]=params.request.postData;
                    }
                    // console.log(params.requestId,reqResp[params.requestId]);
                }



                if (method == "Network.loadingFinished") {
                    if(params.encodedDataLength==0) {
                        return;
                    }
                    chrome.debugger.sendCommand(
                        {tabId: targetTabId},
                        "Network.getResponseBody",
                        {requestId: params.requestId},
                        function(response) {
                            try {
                                if(reqResp[params.requestId]["resp"]) return;

                                let respBody=JSON.parse(response.body);
                                reqResp[params.requestId]["resp"]=respBody;
                                console.log(params.requestId,reqResp[params.requestId]);
                                // 发送响应回 content.js
                                chrome.tabs.sendMessage(targetTabId, {
                                    type: "networkCatchResponse",
                                    data: reqResp[params.requestId]
                                });

                            } catch (e) {

                            }

                        }
                    );
                }
            });
            return true;
        }
});

// 发送 POST 请求
function sendPostRequest(url,data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        console.log(xhr.getAllResponseHeaders());
        if (xhr.readyState == 4 && xhr.status == 200) {
            
            // 请求成功，将结果传递给回调函数
            callback(xhr.responseText);
        }
    };

    // 将数据转换为 JSON 字符串并发送
    xhr.send(JSON.stringify(data));
}
function executeSimulateEditableInput(tabId, xpath, input) {
    // 定义要执行的函数
    const code = `
    function simulateEditableInput(xpath, input) {
        const element = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (element) {
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
    }

    simulateEditableInput('${xpath}', '${input}');
`;

    chrome.debugger.attach({ tabId: tabId }, '1.3', function() {
        chrome.debugger.sendCommand({ tabId: tabId }, 'Runtime.evaluate', {
            expression: code,
            awaitPromise: true
        }, function(result) {
            console.log(result);
            chrome.debugger.detach({ tabId: tabId });
        });
    });
}