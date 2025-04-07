<template>
  <div class="chat-panel">
    <div class="chat-title">HappyfeChat</div>
    <div class="message-panel" id="message-panel">
      <div class="message-list">
        <div
          :class="['message-item', item.type == 1 ? 'ai-item' : '']"
          v-for="(item, index) in messageList"
          :id="'item' + index"
        >
          <template v-if="item.type == 0">
            <div class="message-content">
              <div class="content-inner">{{ item.content }}</div>
            </div>
            <div class="user-icon">我</div>
          </template>
          <template v-else>
            <div class="user-icon">AI</div>
            <div class="message-content ai-item">
              <MdPreview
                previewTheme="vuepress"
                :codeFoldable="false"
                editorId="preview"
                :modelValue="item.content.join('')"
              />
              <div class="loading" v-if="item.loading">
                <img src="../assets/loading.gif" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="send-panel">
      <el-form :model="formData" ref="formDataRef" @submit.prevent>
        <!--input输入-->
        <el-form-item label="" prop="content">
          <el-input
            type="textarea"
            :rows="3"
            clearable
            placeholder="请输入你想问的问题"
            v-model="formData.content"
            @keyup="keySend"
          ></el-input>
        </el-form-item>
        <!--input输入-->
        <el-form-item label="" prop="" class="send-btn">
          <el-button type="primary" @click="sendMessage" :disabled="loading"
          >发送(ctrl+enter)</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus';

import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
} from 'vue';
const { proxy } = getCurrentInstance();
import { MdPreview, MdCatalog } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const formData = ref({});
const messageList = ref([]);
const loading = ref(false);

const keySend = (event) => {
  if (!(event.ctrlKey && event.key === 'Enter')) {
    return;
  }
  sendMessage();
};

const sendMessage = () => {
  const message = formData.value.content;
  if (!message) {
    ElMessage({
      type: 'warning',
      message: '请输入内容',
      duration: 2000,
    });
    return;
  }
  messageList.value.push({
    type: 0,
    content: message,
  });

  messageList.value.push({
    type: 1,
    content: [],
    loading: true,
  });
  loading.value = true;

  const eventSource = new EventSource(`/api/stream?message=${message}`);
  formData.value.content = '';
  eventSource.onmessage = (event) => {
    let response = event.data;
    console.log(response);
    if (response == 'end') {
      close();
      return;
    }
    response = JSON.parse(response).content;
    messageList.value[messageList.value.length - 1].content.push(response);
    //滚动到底部
    nextTick(() => {
      const content = document.getElementById('message-panel');
      content.scrollTop = content.scrollHeight;
    });
  };

  eventSource.onerror = (error) => {
    close();
  };

  const close = () => {
    eventSource.close();
    messageList.value[messageList.value.length - 1].loading = false;
    loading.value = false;
  };
};
</script>

<style lang="scss" scoped>
.chat-panel {
  background: #eff0f6;
  height: calc(100vh);
  .chat-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .message-panel {
    position: relative;
    height: calc(100vh - 200px);
    overflow: auto;
    padding-bottom: 10px;
    .message-list {
      margin: 0px auto;
      width: 800px;
      .message-item {
        margin: 10px 0px;
        display: flex;
        .user-icon {
          width: 40px;
          height: 40px;
          line-height: 40px;
          border-radius: 20px;
          background: #535353;
          color: #fff;
          text-align: center;
          margin-left: 10px;
        }
        .message-content {
          flex: 1;
          margin-left: 10px;
          align-items: center;
          display: flex;
          justify-content: flex-end;
        }
        .content-inner {
          background: #2d65f7;
          border-radius: 5px;
          padding: 10px;
          color: #fff;
        }
      }
      .ai-item {
        line-height: 23px;
        .message-content {
          display: block;
          background: #fff;
          border-radius: 5px;
        }
        .user-icon {
          background: #64018f;
          margin-left: 0px;
        }
        :deep(.md-editor-previewOnly) {
          border-radius: 5px;
          background: #fff;
        }
        :deep(.md-editor-preview-wrapper) {
          padding: 10px;
        }
        .loading {
          text-align: center;
        }
      }
    }
  }
  .send-panel {
    position: relative;
    margin: 5px auto 0px;
    width: 800px;
    background: #fff;
    border-radius: 5px;
    padding: 10px;
    .send-btn {
      text-align: right;
      margin-bottom: 0px;
      padding: 5px;
      :deep(.el-form-item__content) {
        justify-content: flex-end;
      }
    }
    :deep(.el-textarea__inner) {
      border: 0 !important;
      resize: none !important;
      box-shadow: none;
    }
  }
}
.no-data {
  text-align: center;
  color: #5f5f5f;
}
</style>
