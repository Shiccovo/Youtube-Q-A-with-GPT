<template>
  <div id="chat-container">

    <div id="api-button-container">
        <button
        @click="toggleApiKeyInput"
        class="top-button"
        id="api-button"
      ></button>

        <button 
        @click="clearChat" 
        class="top-button" 
        id="clear-button"
        ></button>
      </div>

    <!-- API 密钥输入框和保存按钮 -->
    <div id="api-container" v-if="showApiInput">
      <input
        v-model="apiKey"
        type="password"
        placeholder="Enter your OpenAI API key..."
        id="api-input"
      />
      <button @click="saveApiKey" id="button">Save</button>
      
    </div>

    <div id="chatWindow">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <strong>{{ message.sender }}:</strong> {{ message.text }}
      </div>
    </div>

    
    <!-- 用户输入框 -->
    <input
      v-model="userInput"
      @keyup.enter="sendMessage"
      placeholder="Type your question..."
      id="chat-input"
    />
    <button @click="sendMessage" id="send-button">_</button>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';
import { sendToChatGPT } from '../gpt.js'; // 从 gpt.js 导入发送消息到 GPT 的函数
import { getTranscript } from '../transcript.js';
// 响应式数据

const userInput = ref(''); // 用户输入的文本
const messages = ref([]); // 消息列表
const showApiInput = ref(false); // 控制是否显示 API 密钥输入框
const transcript = ref(''); // 存储视频转录文本
const apiKey = ref(localStorage.getItem('api-container') || '');
const videoId = new URLSearchParams(window.location.search).get('v');
const YT_INITIAL_PLAYER_RESPONSE_RE =
  /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;
let player = window.ytInitialPlayerResponse;

// 测试 getTranscript 函数
async function testGetTranscript() {
  try {
    // 调用 getTranscript 函数
    const result = await getTranscript();
    // 将返回结果添加到 messages 中显示
    messages.value.push({ sender: 'System', text: 'Transcript Result: ' + result });
  } catch (error) {
    console.error('Error in testGetTranscript:', error);
    messages.value.push({ sender: 'System', text: 'Failed to get transcript.' });
  }
}


// 切换显示 API 密钥输入框
function toggleApiKeyInput() {
  showApiInput.value = !showApiInput.value;
}

// 保存 API 密钥到 localStorage
function saveApiKey() {
  if (apiKey.value.trim() !== '') {
    localStorage.setItem('api-container', apiKey.value.trim());
    showApiInput.value = false; // 隐藏输入框
    messages.value.push({ sender: 'System', text: 'API Key Saved.'});
  }
}

function clearChat() {
  messages.value = []; // 清空聊天记录
}




// 挂载时获取视频转录文本
onMounted(async () => {
  try {
    transcript.value = await getTranscript(videoId,YT_INITIAL_PLAYER_RESPONSE_RE,player); // 获取字幕文本
    messages.value.push({ sender: 'System', text: 'Transcript loaded. You can start asking questions.'});
  } catch (error) {
    messages.value.push({ sender: 'System', text: 'Failed to load transcript.' });
  }
});


// 发送消息
async function sendMessage() {
  if (userInput.value.trim() === '') return;

  // 添加用户消息到聊天窗口
  messages.value.push({ sender: 'You', text: userInput.value });

  userInput.value = ''; // 清空输入框

  // 调用 GPT API 并获取回答
  try {
    const response = await sendToChatGPT(userInput.value, transcript,apiKey.value);
    messages.value.push({ sender: 'ChatGPT', text: response });
  } catch (error) {
    console.error('Error contacting GPT:', error);
    messages.value.push({ sender: 'System', text: 'Failed to contact ChatGPT.' });
  }

}
</script>

<style scoped>
/* 基本样式 */
#chat-container {
  width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #646cff;
  border-radius: 8px;
  background-color: #1a1a1a;
  color: #fff;
}


#api-container {
  margin-bottom: 20px;
}

#api-input {
  width: calc(100% - 120px);
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #fff;
  outline: none;
}



#save-api-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  background-color: #535bf2;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

#save-api-button:hover {
  background-color: #646cff;
}

#chat-window {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #444;
  background-color: #242424;
  border-radius: 8px;
}

.message {
  margin-bottom: 10px;
}

#chat-input {
  width: calc(100% - 80px);
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #fff;
  outline: none;
}



#api-button {
  background-image: url('@/assets/API.png'); /* Using alias for src */
}

#clear-button {
  background-image: url('@/assets/Clear.png');
}

#send-button {
  background-image: url('@/assets/Send.png');
}

#api-button,
#clear-button,
#send-button {
  width: 30px; /* Adjust size as needed */
  height: 30px; /* Adjust size as needed */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  cursor: pointer;
  background-color: transparent; /* Ensure transparency */
}



</style>