let details1: any;

//********************************************************************************************* */

// 监听传入消息
chrome.runtime.onMessage.addListener(
  (request:any, sender: chrome.runtime.MessageSender, sendResponse: (response: { message: string }) => void) => {
    console.log("back接收消息", request);
    
    // 接受消息
  
    if(request.type=="save_qaKeywords"){
        console.log("保存keyword")
        localStorage.setItem("qaKeywords",request.data)
        sendResponse({message:"保存成功"})
    }
  }
);

// 长期连接监听
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  port.onMessage.addListener((msg: any) => {
    if (port.name === "CToB")
      port.postMessage({ message: port.name + "，你好,我们可以开始通话了" });
  });
});

// 获取pdd商户和当天聊天人的信息--start
// 你可以将 `interceptRequests` 功能重新启用
// async function interceptRequests() {
//   const originalFetch = window.fetch;

//   const response = await originalFetch("https://mms.pinduoduo.com/janus/api/customService/queryCustomServiceInfo", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(
//       { needCustomServiceInfo: true, needMallInfo: true }
//     ),
//   });
//   const clonedResponse = response.clone();
//   clonedResponse.json().then((data) => {
//     console.log("Intercepted fetch response data:", data);
//   });
// }
  
// chrome.webRequest.onCompleted.addListener((details) => {
//   if (details.url === "https://mms.pinduoduo.com/janus/api/customService/queryCustomServiceInfo") {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0].id) {
//         chrome.tabs.sendMessage(tabs[0].id, { type: "pdd1", message: details, abc: "111" }, (response) => {
//           console.log("Response from content:", response);
//         });
//       }
//     });
//     chrome.scripting.executeScript({
//       target: { tabId: details.tabId },
//       func: interceptRequests,
//     });
//   }
// }, { urls: ["https://mms.pinduoduo.com/janus/api/customService/queryCustomServiceInfo"] }, []);
// 获取pdd商户和当天聊天人的信息--end

/**************************function********************************* */

// 获取机器人回复的函数
async function getAnswer(message: string): Promise<void> {
  console.log("getAnswer进来了-----------------------");

  // 请求后台接口
  const res = await fetch(`http://127.0.0.1:9000/ragkb/agent/chatByInput`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body:  message ,
  });

  // 解析响应数据
  const data = await res.json();

  // 向当前活动标签页发送消息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "pdd_receive", message: data, abc: "111" }, (response) => {
        console.log("Response from content:", response);
      });
    }
  });

  console.log("backgroud_resp:-------", data);
}


export {};  // 空的 export 语句