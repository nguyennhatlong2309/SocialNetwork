/**
 * useComments.js — Custom hooks cho Comments
 *
 * - useComments(postId): Fetch danh sách comments của một post
 * - useAddComment(): Mutation thêm comment mới, tự invalidate cache sau khi thành công
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postApi from '../api/postApi';

// ─── Query key factory ───────────────────────────────────────────────────────
export const commentKeys = {
  all: ['comments'],
  byPost: (postId) => ['comments', 'post', String(postId)],
};

// ─── Helper: format comment từ CommentDto ─────────────────────────────────
function formatComment(c) {
  return {
    id: c.id,
    content: c.content,
    likeCount: c.likeCount ?? 0,
    isEdited: c.isEdited ?? false,
    createdAt: c.createdAt,
    parentCommentId: c.parentCommentId ?? null,
    user: {
      username: c.user?.username ?? 'unknown',
      fullName: c.user?.fullName ?? 'Unknown User',
      avatarUrl: c.user?.avatarUrl ?? null,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useComments — Fetch comments của một post
// ═══════════════════════════════════════════════════════════════════════════
export function useComments(postId) {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: async () => {
      if (!postId) return [];
      const res = await postApi.getComments(postId);
      // axiosClient unwrap response.data (lần 1)
      // Backend: ApiResponse<CommentDto[]> → res = { data: CommentDto[], ... }
      const list = res?.data ?? res;
      return Array.isArray(list) ? list.map(formatComment) : [];
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 phút
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useAddComment — Thêm comment mới
//
// Sau khi submit thành công:
//   1. Append comment mới vào cache ['comments', 'post', postId]
//   2. Invalidate để đồng bộ đầy đủ với server
// ═══════════════════════════════════════════════════════════════════════════
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, parentCommentId = null }) => {
      const res = await postApi.addComment(postId, content, parentCommentId);
      // res = ApiResponse<CommentDto> → { data: CommentDto, ... }
      const newComment = res?.data ?? res;
      return { postId, newComment };
    },

    onSuccess: ({ postId, newComment }) => {
      // Append comment mới vào cache ngay lập tức (không cần đợi refetch)
      queryClient.setQueryData(commentKeys.byPost(postId), (old = []) => {
        const formatted = formatComment(newComment);
        return [...old, formatted];
      });

      // Invalidate để đồng bộ đầy đủ (comment count, v.v.)
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
      // Cũng invalidate post detail để cập nhật commentCount
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail', String(postId)] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
    },
  });
}
