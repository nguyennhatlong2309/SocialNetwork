/**
 * useMessages.js — Custom hooks cho Inbox / Messages
 *
 * - useConversations(): Fetch danh sách conversations
 * - useMessages(conversationId): Fetch tin nhắn trong conversation
 * - useSendMessage(): Mutation gửi tin nhắn mới
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import messageApi from '../api/messageApi';

// ─── Query key factory ───────────────────────────────────────────────────────
export const messageKeys = {
  conversations: ['conversations'],
  messages: (conversationId) => ['messages', String(conversationId)],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format ConversationDto → shape dùng trong UI InboxPage.
 * ConversationDto.members[] → tìm "người kia" (không phải current user).
 */
export function formatConversation(conv, currentUserId) {
  const other = conv.members?.find(m => m.userId !== currentUserId) ?? conv.members?.[0];
  return {
    id: conv.id,
    type: conv.type,
    name: conv.name,
    // Thông tin người kia trong conversation
    otherUser: other ? {
      userId: other.userId,
      username: other.username,
      fullName: other.fullName ?? other.username,
      avatarUrl: other.avatarUrl ?? null,
    } : null,
    lastMessage: conv.lastMessage ? formatMessage(conv.lastMessage) : null,
    updatedAt: conv.updatedAt,
    unreadCount: 0, // backend hiện chưa trả unreadCount, placeholder
  };
}

/**
 * Format MessageDto → shape dùng trong ChatView.
 * Chú ý: backend dùng `sentAt` (không phải `createdAt`).
 */
export function formatMessage(msg, currentUserId) {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    content: msg.content ?? '',
    messageType: msg.messageType ?? 'text',
    senderId: msg.sender?.id ?? msg.senderId,
    senderName: msg.sender?.fullName ?? msg.sender?.username ?? 'Unknown',
    senderAvatar: msg.sender?.avatarUrl ?? null,
    createdAt: msg.sentAt ?? msg.createdAt, // sentAt là field thật của backend
    isEdited: msg.isEdited ?? false,
    fromMe: currentUserId != null
      ? (msg.sender?.id ?? msg.senderId) === currentUserId
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useConversations
// ═══════════════════════════════════════════════════════════════════════════
export function useConversations(currentUserId) {
  return useQuery({
    queryKey: messageKeys.conversations,
    queryFn: async () => {
      const res = await messageApi.getConversations();
      // axiosClient unwrap lần 1 → res = ApiResponse<ConversationDto[]>
      const list = res?.data ?? res;
      if (!Array.isArray(list)) return [];
      return list.map(c => formatConversation(c, currentUserId));
    },
    staleTime: 1000 * 30, // 30 giây
    enabled: !!currentUserId,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useMessages — Fetch tin nhắn trong một conversation
// ═══════════════════════════════════════════════════════════════════════════
export function useMessages(conversationId, currentUserId) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId),
    queryFn: async () => {
      const res = await messageApi.getMessages(conversationId);
      // res = ApiResponse<MessageDto[]> → { data: [...] }
      const list = res?.data ?? res;
      if (!Array.isArray(list)) return [];
      return [...list].reverse().map(m => formatMessage(m, currentUserId));
    },
    enabled: !!conversationId && !!currentUserId,
    staleTime: 0, // Tin nhắn luôn fresh — SignalR sẽ push update
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useSendMessage
//
// Flow:
//   1. Optimistic: append tin nhắn tạm vào cache ngay lập tức
//   2. onError: rollback nếu API lỗi
//   3. onSettled: invalidate để đồng bộ với server
// ═══════════════════════════════════════════════════════════════════════════
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }) => {
      const res = await messageApi.sendMessage(conversationId, content);
      const sent = res?.data ?? res;
      return { conversationId, sent };
    },

    onMutate: async ({ conversationId, content, currentUserId }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.messages(conversationId) });

      const previousMessages = queryClient.getQueryData(messageKeys.messages(conversationId));

      // Tạo tin nhắn optimistic tạm thời
      const optimisticMsg = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        content,
        messageType: 'text',
        senderId: currentUserId,
        senderName: 'You',
        senderAvatar: null,
        createdAt: new Date().toISOString(),
        isEdited: false,
        fromMe: true,
        _optimistic: true,
      };

      queryClient.setQueryData(messageKeys.messages(conversationId), (old = []) => [
        ...old,
        optimisticMsg,
      ]);

      return { previousMessages, conversationId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(
          messageKeys.messages(context.conversationId),
          context.previousMessages
        );
      }
    },

    onSettled: (_data, _err, { conversationId }) => {
      // Sync với server để thay optimistic msg bằng msg thật
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
      // Cập nhật lastMessage trong conversation list
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
}
