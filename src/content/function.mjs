// export function deepCopy(obj) {
// 	return JSON.parse(JSON.stringify(obj));
// }

var cozeBotid=localStorage.getItem("cozeBotid");//扣子机器人id
var cozeApikey=localStorage.getItem("cozeApikey");//扣子机器人API_KEY
var yuanqiBotid=localStorage.getItem("yuanqiBotId") //腾讯元器机器人Id
var yuanqiUserid=localStorage.getItem("yuanqiUserId") //腾讯元器用户id
const CONVERSATION_STORE_KEY = "__pluns_conversation_map_v1";
const CONVERSATION_MAX_SIZE = 500;
const CONVERSATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AI_REQUEST_TTL_MS = 12 * 1000;
const AI_REQUEST_MAX_SIZE = 1000;
const recentAIRequests = new Map();

function getCustomHeaderObject() {
  const customHeader = localStorage.getItem("customHeader");
  if (!customHeader) return {};
  try {
    const parsedHeader = JSON.parse(customHeader);
    if (parsedHeader && typeof parsedHeader === "object" && !Array.isArray(parsedHeader)) {
      return parsedHeader;
    }
  } catch (error) {
    console.warn("customHeader parse failed:", error);
  }
  return {};
}

function mergeHeaders(baseHeader = {}, headerParam = {}) {
  return Object.assign({}, baseHeader, headerParam, getCustomHeaderObject());
}

function normalizeMessageContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      if (typeof item.text === "string") return item.text;
      if (typeof item.content === "string") return item.content;
      return "";
    }).join("");
  }
  if (content && typeof content === "object" && typeof content.text === "string") {
    return content.text;
  }
  return "";
}

function normalizeText(input) {
  if (typeof input === "string") return input.trim();
  if (input == null) return "";
  return String(input).trim();
}

function cleanupRecentAIRequests(nowTs) {
  for (const [key, ts] of recentAIRequests.entries()) {
    if (nowTs - ts > AI_REQUEST_TTL_MS) {
      recentAIRequests.delete(key);
    }
  }
  while (recentAIRequests.size > AI_REQUEST_MAX_SIZE) {
    const oldestKey = recentAIRequests.keys().next().value;
    if (!oldestKey) break;
    recentAIRequests.delete(oldestKey);
  }
}

function shouldSkipDuplicateAIRequest(apiBase, roomId, questionText) {
  const normalizedQuestion = normalizeText(questionText);
  if (!normalizedQuestion) return true;
  const key = [
    normalizeText(removeSlashes(apiBase || "")),
    normalizeText(roomId || ""),
    normalizedQuestion
  ].join("|");
  const nowTs = Date.now();
  const lastTs = Number(recentAIRequests.get(key) || 0);
  if (lastTs && nowTs - lastTs < AI_REQUEST_TTL_MS) {
    cleanupRecentAIRequests(nowTs);
    return true;
  }
  recentAIRequests.set(key, nowTs);
  cleanupRecentAIRequests(nowTs);
  return false;
}

function generateConversationId() {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    }
  } catch (error) {
    console.warn("conversationId generate failed, use fallback:", error);
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`.padEnd(32, "0").slice(0, 32);
}

function readConversationStore() {
  try {
    const raw = localStorage.getItem(CONVERSATION_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn("conversation store parse failed:", error);
  }
  return {};
}

function writeConversationStore(store) {
  try {
    localStorage.setItem(CONVERSATION_STORE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn("conversation store save failed:", error);
  }
}

function buildConversationKey(apiBase, roomId) {
  const hostPath = typeof window !== "undefined" && window.location
    ? `${window.location.host}${window.location.pathname}`
    : "";
  return [
    normalizeText(removeSlashes(apiBase || "")),
    normalizeText(hostPath),
    normalizeText(roomId || "anonymous")
  ].join("|");
}

function cleanupConversationStore(store, nowTs) {
  const keys = Object.keys(store);
  for (const key of keys) {
    const item = store[key];
    const updatedAt = Number(item?.updatedAt || item?.createdAt || 0);
    if (!item?.conversationId || !updatedAt || nowTs - updatedAt > CONVERSATION_TTL_MS) {
      delete store[key];
    }
  }

  const latestKeys = Object.keys(store);
  if (latestKeys.length <= CONVERSATION_MAX_SIZE) return;

  latestKeys
    .sort((a, b) => Number(store[a]?.updatedAt || 0) - Number(store[b]?.updatedAt || 0))
    .slice(0, latestKeys.length - CONVERSATION_MAX_SIZE)
    .forEach(key => {
      delete store[key];
    });
}

function getOrCreateConversationId(apiBase, roomId) {
  const key = buildConversationKey(apiBase, roomId);
  const nowTs = Date.now();
  const store = readConversationStore();
  const item = store[key];

  if (item?.conversationId) {
    const updatedAt = Number(item.updatedAt || item.createdAt || 0);
    if (updatedAt && nowTs - updatedAt <= CONVERSATION_TTL_MS) {
      item.updatedAt = nowTs;
      store[key] = item;
      cleanupConversationStore(store, nowTs);
      writeConversationStore(store);
      return item.conversationId;
    }
  }

  const conversationId = generateConversationId();
  store[key] = {
    roomId: normalizeText(roomId),
    apiBase: normalizeText(apiBase),
    conversationId,
    createdAt: nowTs,
    updatedAt: nowTs
  };
  cleanupConversationStore(store, nowTs);
  writeConversationStore(store);
  return conversationId;
}

function isLikelyErrorText(text) {
  const source = (text || "").toString().toLowerCase();
  if (!source) return false;
  const errorKeywords = [
    "error",
    "invalid",
    "empty",
    "failed",
    "exception",
    "missing",
    "forbidden",
    "unauthorized",
    "not found",
    "bad request",
    "参数错误",
    "请求错误",
    "系统错误",
    "服务异常"
  ];
  return errorKeywords.some(keyword => source.includes(keyword));
}

function looksLikeStructuredChunkText(text) {
  const source = normalizeText(text);
  if (!source) return false;
  if (source.startsWith("data:") && source.includes("\"choices\"")) return true;
  if (source.startsWith("{") && source.includes("\"choices\"") && source.includes("\"delta\"")) return true;
  return false;
}

function extractReplyContentFromPayload(messageResult) {
  if (!messageResult) return "";
  if (messageResult?.choices?.length > 0) {
    const firstChoice = messageResult.choices[0];
    const choiceContent = normalizeMessageContent(firstChoice?.message?.content ?? firstChoice?.delta?.content);
    if (choiceContent) return removeHtmlTags(choiceContent);
  }
  if (typeof messageResult?.message?.content === "string") return removeHtmlTags(messageResult.message.content);
  if (typeof messageResult?.delta?.content === "string") return removeHtmlTags(messageResult.delta.content);
  if (typeof messageResult?.delta === "string") return removeHtmlTags(messageResult.delta);
  if (typeof messageResult?.result?.content === "string") return removeHtmlTags(messageResult.result.content);
  if (typeof messageResult?.content === "string") return removeHtmlTags(messageResult.content);
  if (typeof messageResult?.answer === "string") return removeHtmlTags(messageResult.answer);
  if (typeof messageResult?.response === "string") return removeHtmlTags(messageResult.response);
  if (typeof messageResult?.data === "string") return removeHtmlTags(messageResult.data);
  if (typeof messageResult?.data?.answer === "string") return removeHtmlTags(messageResult.data.answer);
  if (typeof messageResult?.data?.content === "string") return removeHtmlTags(messageResult.data.content);
  if (typeof messageResult?.data?.response === "string") return removeHtmlTags(messageResult.data.response);
  return "";
}

function extractReplyFromStructuredLines(rawText) {
  if (typeof rawText !== "string") return "";
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";

  let streamText = "";
  let lastFragment = "";
  let parsedStructured = false;

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:") || line.startsWith("id:") || line.startsWith("retry:")) {
      parsedStructured = true;
      continue;
    }

    const payloadText = line.startsWith("data:")
      ? line.slice(5).trimStart()
      : line;

    if (!payloadText) continue;
    if (payloadText === "[DONE]") {
      parsedStructured = true;
      continue;
    }

    try {
      const payload = JSON.parse(payloadText);
      parsedStructured = true;
      const fragment = extractReplyContentFromPayload(payload);
      if (!fragment) continue;
      const appended = appendStreamFragment(streamText, fragment, lastFragment);
      streamText = appended.streamText;
      lastFragment = appended.lastFragment;
    } catch (error) {
      // ignore non-JSON lines in structured stream text
    }
  }

  return parsedStructured ? streamText.trim() : "";
}

function extractReplyContent(messageResult) {
  if (!messageResult) return "";

  if (typeof messageResult === "string") {
    const extractedFromStream = extractReplyFromStructuredLines(messageResult);
    if (extractedFromStream) return removeHtmlTags(extractedFromStream);
    const plainText = removeHtmlTags(messageResult);
    return looksLikeStructuredChunkText(plainText) ? "" : plainText;
  }

  if (typeof messageResult.rawText === "string" && messageResult.rawText.trim() !== "") {
    if (isLikelyErrorText(messageResult.rawText)) return "";
    const extractedFromStream = extractReplyFromStructuredLines(messageResult.rawText);
    if (extractedFromStream) return removeHtmlTags(extractedFromStream);
    const plainText = removeHtmlTags(messageResult.rawText);
    return looksLikeStructuredChunkText(plainText) ? "" : plainText;
  }

  return extractReplyContentFromPayload(messageResult);
}

function findSSEBoundary(buffer) {
  const rnBoundary = buffer.indexOf("\r\n\r\n");
  const nBoundary = buffer.indexOf("\n\n");

  if (rnBoundary === -1 && nBoundary === -1) {
    return { index: -1, length: 0 };
  }
  if (rnBoundary !== -1 && (nBoundary === -1 || rnBoundary < nBoundary)) {
    return { index: rnBoundary, length: 4 };
  }
  return { index: nBoundary, length: 2 };
}

function appendStreamFragment(streamText, fragment, lastFragment) {
  if (!fragment) {
    return { streamText, lastFragment };
  }

  if (fragment === streamText || fragment === lastFragment) {
    return { streamText, lastFragment };
  }

  if (lastFragment && fragment.startsWith(lastFragment) && fragment.length > lastFragment.length) {
    return {
      streamText: streamText + fragment.slice(lastFragment.length),
      lastFragment: fragment
    };
  }

  if (streamText && fragment.startsWith(streamText) && fragment.length > streamText.length) {
    return {
      streamText: fragment,
      lastFragment: fragment
    };
  }

  if (streamText.endsWith(fragment)) {
    return { streamText, lastFragment: fragment };
  }

  return {
    streamText: streamText + fragment,
    lastFragment: fragment
  };
}

function parseSSEPayloadData(rawData) {
  if (!rawData) return { done: false, rawData: "", fragment: "" };
  if (rawData === "[DONE]") {
    return { done: true, rawData, fragment: "" };
  }

  try {
    const payload = JSON.parse(rawData);
    return {
      done: false,
      rawData,
      fragment: extractReplyContentFromPayload(payload)
    };
  } catch (error) {
    const extractedFromLines = extractReplyFromStructuredLines(rawData);
    if (extractedFromLines) {
      return { done: false, rawData, fragment: extractedFromLines };
    }

    if (isLikelyErrorText(rawData)) {
      return { done: false, rawData, fragment: "" };
    }

    // JSON-looking fragments should not be sent as reply text directly.
    if (rawData.startsWith("{") || rawData.startsWith("[")) {
      return { done: false, rawData, fragment: "" };
    }

    return { done: false, rawData, fragment: rawData };
  }
}

function parseSSEEventBlock(eventBlock) {
  const lines = eventBlock.split(/\r?\n/);
  const dataLines = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  const rawData = dataLines.join("\n").trim();
  if (!rawData && eventBlock.trim()) {
    // tolerate non-standard SSE that emits one JSON line without "data:" prefix.
    const fallbackRaw = eventBlock.trim();
    return parseSSEPayloadData(fallbackRaw);
  }
  return parseSSEPayloadData(rawData);
}

function parseSSELineEvent(line) {
  const trimmed = (line || "").trim();
  if (!trimmed || trimmed.startsWith(":")) {
    return { done: false, rawData: "", fragment: "" };
  }
  if (trimmed.startsWith("event:") || trimmed.startsWith("id:") || trimmed.startsWith("retry:")) {
    return { done: false, rawData: "", fragment: "" };
  }

  const rawData = trimmed.startsWith("data:")
    ? trimmed.slice(5).trimStart()
    : trimmed;

  return parseSSEPayloadData(rawData);
}

function safeInvokeChunkCallback(onChunk, chunk, fullText) {
  if (typeof onChunk !== "function") return;
  try {
    onChunk(chunk, fullText);
  } catch (error) {
    console.warn("onChunk callback failed:", error);
  }
}

async function readSSEStream(response, onChunk) {
  const reader = response.body?.getReader();
  if (!reader) {
    return { streamText: "", rawText: "" };
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let rawText = "";
  let streamText = "";
  let lastFragment = "";
  let stopByDone = false;

  while (!stopByDone) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const { index, length } = findSSEBoundary(buffer);
      if (index === -1) break;

      const eventBlock = buffer.slice(0, index);
      buffer = buffer.slice(index + length);
      if (!eventBlock.trim()) continue;

      const { done: isDone, rawData, fragment } = parseSSEEventBlock(eventBlock);
      if (rawData && rawData !== "[DONE]") {
        rawText += (rawText ? "\n" : "") + rawData;
      }
      const prevText = streamText;
      const appended = appendStreamFragment(streamText, fragment, lastFragment);
      streamText = appended.streamText;
      lastFragment = appended.lastFragment;
      if (streamText && streamText !== prevText) {
        const chunk = streamText.slice(prevText.length);
        safeInvokeChunkCallback(onChunk, chunk, streamText);
      }

      if (isDone) {
        stopByDone = true;
        break;
      }
    }

    // Some providers stream one line per chunk without SSE blank-line separators.
    while (!stopByDone && findSSEBoundary(buffer).index === -1) {
      const lineBreakIndex = buffer.indexOf("\n");
      if (lineBreakIndex === -1) break;

      const line = buffer.slice(0, lineBreakIndex);
      buffer = buffer.slice(lineBreakIndex + 1);
      if (!line.trim()) continue;

      const { done: isDone, rawData, fragment } = parseSSELineEvent(line);
      if (rawData && rawData !== "[DONE]") {
        rawText += (rawText ? "\n" : "") + rawData;
      }
      const prevText = streamText;
      const appended = appendStreamFragment(streamText, fragment, lastFragment);
      streamText = appended.streamText;
      lastFragment = appended.lastFragment;
      if (streamText && streamText !== prevText) {
        const chunk = streamText.slice(prevText.length);
        safeInvokeChunkCallback(onChunk, chunk, streamText);
      }

      if (isDone) {
        stopByDone = true;
        break;
      }
    }
  }

  buffer += decoder.decode();

  if (!stopByDone && buffer.trim()) {
    const { rawData, fragment } = parseSSEEventBlock(buffer.trim());
    if (rawData && rawData !== "[DONE]") {
      rawText += (rawText ? "\n" : "") + rawData;
    }
    const prevText = streamText;
    const appended = appendStreamFragment(streamText, fragment, lastFragment);
    streamText = appended.streamText;
    if (streamText && streamText !== prevText) {
      const chunk = streamText.slice(prevText.length);
      safeInvokeChunkCallback(onChunk, chunk, streamText);
    }
  }

  return {
    streamText: streamText.trim(),
    rawText: rawText.trim()
  };
}



//按字数分隔字符串
export function splitStringByChunk(inputString, chunkSize) {
  const len = inputString.length;
  const result = [];

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = inputString.substring(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
}

//判断js字符串是否包含一个关键词数组的任意一个关键词
export function containsKeyword(inputString, keywords) {
	if(keywords.length==0) return false;
  for (var i = 0; i < keywords.length; i++) {
	  if(!keywords[i]) continue;
    if (inputString.includes(keywords[i])) {
      return true;
    }
  }
  return false;
}

export function removeHtmlTags(input) {
	if(!input) return "";
	return input.replace(/<[^>]*>/g, '');
}
// 封装方法：去除字符串两端的斜杠
export function removeSlashes(str) {
    // 使用正则表达式去除两端的斜杠
    return str.replace(/^\/+|\/+$/g, '');
}

// 发送 POST 请求
export function sendPostRequest(url,data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 请求成功，将结果传递给回调函数
            if(callback) callback(xhr.responseText);
        }
    };

    // 将数据转换为 JSON 字符串并发送
    xhr.send(JSON.stringify(data));
}
// 发送 POST 请求
export async function sendAsyncPostRequest(url, reqData,headerParam, streamOptions = {}) {
    try {
        // 使用 fetch 发送 POST 请求
        const response = await fetch(url, {
            method: 'POST', // 指定请求方法为 POST
            // headers: {
            //     'Content-Type': 'application/json' // 设置请求头
            // },
            headers: mergeHeaders({}, headerParam),
            body: JSON.stringify(reqData) // 将数据转换为 JSON 字符串
        });

        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        if (contentType.includes("text/event-stream")) {
            const streamResult = await readSSEStream(response, streamOptions?.onChunk);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${streamResult.rawText}`);
            }

            if (streamResult.streamText) {
                return {
                    isStream: true,
                    content: streamResult.streamText,
                    streamText: streamResult.streamText,
                    rawText: streamResult.rawText
                };
            }

            if (streamResult.rawText) {
                try {
                    return JSON.parse(streamResult.rawText);
                } catch (error) {
                    return { isStream: true, rawText: streamResult.rawText };
                }
            }

            return { isStream: true };
        }

        const rawText = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${rawText}`);
        }

        if (!rawText) return {};

        // 优先解析 JSON，非 JSON 响应保持文本返回，避免直接抛出语法错误
        try {
          return JSON.parse(rawText);
        } catch (error) {
          return { rawText };
        }
    } catch (error) {
        console.error('Could not send post request: ', error);
        throw error; // 抛出错误，以便可以在调用此函数的地方进行处理
    }
}
// 发送AI问答（改造后的版本）
export async function sendAsyncAIQuestion(apiBase,nickname, avatar, question, streamOptions = {}) {
    // 调用coze
    if(cozeBotid && cozeApikey && typeof chatCozeAPI === "function"){
        const replyContent = await chatCozeAPI(cozeBotid, cozeApikey,question);
        return replyContent || "";
    }
  
    if (apiBase === "") return "";

    const questionText = (question || "").toString().trim();
    if (questionText === "") {
      console.warn("Skip AI request: empty question.");
      return "";
    }
  
    let url = removeSlashes(apiBase);
    if (shouldSkipDuplicateAIRequest(url, nickname, questionText)) {
      console.log("Skip duplicate AI request:", nickname, questionText);
      return "";
    }

    if(yuanqiBotid && yuanqiUserid){
      console.log("腾讯元器")
      return await chatYuanQiApi(url,yuanqiBotid,yuanqiUserid,questionText)
    }

    try {
        // 调用改造后的 sendPostRequest 函数
        // const messageResult = await sendAsyncPostRequest(url, {
        //     "type": "question",
        //     "visitor_id": nickname,
        //     "visitor_name": nickname,
        //     "avatar": avatar,
        //     "content": question
        // });

        const agentId = normalizeText(localStorage.getItem("openaiAPIToken"));
        if (!agentId) {
          console.warn("Skip AI request: missing agent token(id).");
          return "";
        }

        const conversationId = getOrCreateConversationId(url, nickname);
        const headerParam={
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            // 新接口鉴权：直接使用用户填写的 botId/token（非 Bearer）
            'Authorization': agentId
        };
        const requestBody = {
            query: questionText,
            id: agentId,
            files: [],
            conversationId,
            voiceEnabled: false,
            isGeneratingImage: false
        };
         const messageResult = await sendAsyncPostRequest(url, {
            ...requestBody
        },headerParam, streamOptions);

        const replyContent = extractReplyContent(messageResult);
        if (replyContent) {
          if (isLikelyErrorText(replyContent)) {
            console.warn("Skip AI error-like response:", replyContent);
            return "";
          }
          return replyContent;
        }
        if (typeof messageResult?.rawText === "string" && messageResult.rawText.trim() !== "") {
          console.warn("AI API returned non-JSON response:", messageResult.rawText);
        }
        return "";
    } catch (error) {
        console.error('Error sending AI question:', error);
        return "";
    }
}
// 发送 GET 请求
export function sendGetRequest(url,token,callback){
      // 发送验证
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    // 设置请求头
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("token", token);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 请求成功，将结果传递给回调函数
            if(callback) callback(xhr.responseText);
        }
    };
    xhr.send();
}
export function getAllTextNodeContent(node, xpath) {
  var result = "";
  var elements = document.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (var i = 0; i < elements.snapshotLength; i++) {
    var currentElement = elements.snapshotItem(i);
    var textContent = currentElement.textContent;

    // 递归获取子节点的文本内容，忽略HTML标签
    var childTextContent = getTextFromChildren(currentElement);
    if (childTextContent) {
      textContent += childTextContent;
    }
    result += textContent.trim();
  }

  return result;
}

export function getTextFromChildren(element) {
  var childTextContent = '';
  var children = Array.from(element.childNodes);

  children.forEach(function(child) {
    if (child.nodeType === Node.TEXT_NODE) {
      // 忽略空白文本节点
      if (child.nodeValue.trim() !== '') {
        childTextContent += child.nodeValue;
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // 递归调用，忽略HTML标签
      childTextContent += getTextFromChildren(child);
    }
  });

  return childTextContent;
}
// 获取页面上所有可见文本
export function extractVisibleText() {
    let text = "";
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    // 遍历DOM树，收集所有文本，但不立即添加换行符
    while ((node = walker.nextNode())) {
      text += node.textContent;
    }
    // 替换所有多余的换行符，只保留一个换行符作为段落分隔
    text = text.replace(/\s+/gm, '\n'); // 替换所有空白字符为换行符
    // 移除段落之间的多余空行
    text = text.replace(/\n{2,}/g, '\n\n');
    return text;
}
//复制文本
export function copyText(text) {
    var target = document.createElement('input') //创建input节点
    target.value = text // 给input的value赋值
    document.body.appendChild(target) // 向页面插入input节点
    target.select() // 选中input
    document.execCommand("copy"); // 执行浏览器复制命令
    document.body.removeChild(target);
    return true;
}

export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
export function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
export function convertCookiesToJSON() {
  const cookies = document.cookie.split('; ');
  const cookieJSON = cookies.map(cookie => {
      const [name, value] = cookie.split('=');
      const cookieDetails = {
          domain: document.domain, // 域名
          expiry: getCookie(name) ? getCookie(name).expiry : null, // 过期时间，需要额外解析
          httpOnly: getCookie(name) ? getCookie(name).httpOnly : false, // HttpOnly标志
          name: name,
          path: '/', // 路径
          sameSite: 'Lax', // SameSite策略
          secure: getCookie(name) ? getCookie(name).secure : false, // Secure标志
          value: value ? decodeURIComponent(value) : '' // Cookie值
      };
      return cookieDetails;
  });

  return cookieJSON;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function getRandomEmoji() {
    const emojis = [
        '[微笑]','[大笑]','[调皮]','[呲牙]',
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
        '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
        '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😵', '🤯',
        '🤠', '🥳', '😎', '🤓', '🥺', '😦', '😬', '🤥', '😌', '😔',
    ];
    const randomEmojis = [];
    const numberOfEmojis = Math.floor(Math.random() * 3); // 生成0到2的随机数
    for (let i = 0; i < numberOfEmojis; i++) {
        const randomIndex = Math.floor(Math.random() * emojis.length);
        randomEmojis.push(emojis[randomIndex]);
    }
    return randomEmojis.join(' ');
}


//获取pdd商家信息以及当前聊天人信息
export async function getPddCustomerInfo() {

  const originalFetch = window.fetch;
  
  const response = await originalFetch("https://mms.pinduoduo.com/janus/api/customService/queryCustomServiceInfo",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",  
    },
    body: JSON.stringify(
      {needCustomServiceInfo: true, needMallInfo: true}
    ),
  });
  const clonedResponse = await response.clone();

  const data=  await clonedResponse.json();

    return data?.result?.mallInfoResult || {}

 
}

// module.exports = {
//   getPddCustomerInfo,
//   getRandomEmoji,
//   sleep,
//   convertCookiesToJSON,
//   setCookie,
//   getCookie,
//   copyText,
//   extractVisibleText,
//   getTextFromChildren,
//   getAllTextNodeContent,
//   sendGetRequest,
//   sendAsyncAIQuestion,
//   sendAsyncPostRequest,
//   sendPostRequest,
//   removeSlashes,
//   removeHtmlTags,
//   containsKeyword,
//   // deepCopy,
//   splitStringByChunk

// };

//腾讯元器
async function chatYuanQiApi(url,botId,userId,question){

   try {
        // 调用改造后的 sendPostRequest 函数
        // const messageResult = await sendAsyncPostRequest(url, {
        //     "type": "question",
        //     "visitor_id": nickname,
        //     "visitor_name": nickname,
        //     "avatar": avatar,
        //     "content": question
        // });

        let authorization=""
        if(localStorage.getItem("openaiAPIToken")){
          authorization="Bearer "+localStorage.getItem("openaiAPIToken")
        }

        const headerParam={ 'Content-Type': 'application/json' }
        if (authorization) {
          headerParam["Authorization"] = authorization;
        }
        const customHeader = getCustomHeaderObject();
        if(!customHeader.hasOwnProperty('X-Source') && !headerParam.hasOwnProperty('X-Source')){
          console.log("自定义header没有,添加---------")
          headerParam['X-Source']='openapi'
        }

        const body={
          "assistant_id":botId,
          "user_id":userId,
          "stream":false,
          "messages": [
            {
              "role":"user",
              "content":[{"type":"text","text":question}]
            }
          ]
      }
         const messageResult = await sendAsyncPostRequest(url,body ,headerParam);

        const replyContent = extractReplyContent(messageResult);
        if (replyContent) {
          if (isLikelyErrorText(replyContent)) {
            console.warn("Skip YuanQi error-like response:", replyContent);
            return "";
          }
          return replyContent;
        }
        if (typeof messageResult?.rawText === "string" && messageResult.rawText.trim() !== "") {
          console.warn("YuanQi API returned non-JSON response:", messageResult.rawText);
        }
        return "";
    } catch (error) {
        console.error('Error sending AI question:', error);
        return "";
    }

}
