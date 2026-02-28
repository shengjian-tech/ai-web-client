class Coze {
    constructor(BOT_ID, API_KEY) {
        this.BOT_ID = BOT_ID;
        this.API_KEY = API_KEY;
    }

    async CreateConversation() {
        const url = "https://api.coze.cn/v1/conversation/create";
        const params = {};
        const jsonParams = JSON.stringify(params);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.API_KEY
            },
            body: jsonParams
        };

        try {
            const response = await fetch(url, requestOptions);
            const responseBody = await response.text();
            console.log("coze扣子智能体:", responseBody);
            const content = JSON.parse(responseBody).data.id;
            return content;
        } catch (error) {
            console.error("创建请求失败：", error);
            return "";
        }
    }

    async ChatCozeV3(conversation_id, user, query, messages) {
        const url = "https://api.coze.cn/v3/chat?conversation_id=" + conversation_id;
        const message = { role: "user", content: query, content_type: "text" };
        messages.push(message);

        const params = {
            bot_id: this.BOT_ID,
            user_id: user,
            query: query,
            additional_messages: messages,
            stream: true,
            auto_save_history: true
        };

        const jsonParams = JSON.stringify(params);
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.API_KEY
            },
            body: jsonParams
        };

        try {
            const response = await fetch(url, requestOptions);
            const reader = response.body.getReader();
            let result = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const decoder = new TextDecoder();
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim();
                    if (line === "") {
                        continue;
                    }
                    if (line.includes("[DONE]")) {
                        console.log("Stream finished");
                        break;
                    }
                    console.log(line);
                    if (line.startsWith("event:conversation.message.delta")) {
                        const dataLineIndex = lines.slice(i + 1).findIndex(l => l.startsWith("data:"));
                        if (dataLineIndex !== -1) {
                            const dataLine = lines[i + 1 + dataLineIndex];
                            const resStr = dataLine.trim().replace("data:", "");
                            const respJson = JSON.parse(resStr);
                            result += respJson.content;
                            i += dataLineIndex; // Skip the lines we've already processed
                        }
                    }
                }
                if (lines[lines.length - 1].includes("[DONE]")) {
                    break;
                }
            }
            return result;
        } catch (error) {
            console.error("发送请求失败：", error);
            return "";
        }
    }
}
async function chatCozeAPI(botId,apiKey,query) {
    const coze = new Coze(botId, apiKey);
    // const conversationId = await coze.CreateConversation();
    // console.log("Conversation ID:", conversationId);
    conversationId = ""

    const user = "test_user";
    const messages = [];
    const response = await coze.ChatCozeV3(conversationId, user, query, messages);
    console.log("Chat Response:", response);
    return response;
}

export { Coze, chatCozeAPI };