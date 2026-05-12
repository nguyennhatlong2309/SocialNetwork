/**
 * messageApi.js — API calls cho Inbox / Messages
 *
 * Endpoints:
 *   GET  /api/Messages/conversations           → danh sách conversations
 *   GET  /api/Messages/conversation/{id}       → tin nhắn trong conversation (paginated)
 *   POST /api/Messages/send                    → gửi tin nhắn
 */

import axiosClient from './axiosClient';

const messageApi = {
  /**
   * Lấy danh sách conversations của user hiện tại.
   * @returns {Promise<ConversationDto[]>}
   */
  getConversations() {
    return axiosClient.get('/Messages/conversations');
  },

  /**
   * Lấy tin nhắn trong một conversation (phân trang, mới nhất cuối).
   * @param {number|string} conversationId
   * @param {number} page
   * @param {number} pageSize
   * @returns {Promise<MessageDto[]>}
   */
  getMessages(conversationId, page = 1, pageSize = 50) {
    return axiosClient.get(`/Messages/conversation/${conversationId}`, {
      params: { page, pageSize },
    });
  },

  /**
   * Gửi tin nhắn.
   * @param {number|string} conversationId
   * @param {string} content
   * @returns {Promise<MessageDto>}
   */
  sendMessage(conversationId, content) {
    return axiosClient.post('/Messages/send', {
      conversationId,
      content,
      messageType: 'text',
    });
  },
};

export default messageApi;
