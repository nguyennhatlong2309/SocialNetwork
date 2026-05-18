/**
 * usePosts.js — Custom hooks cho Posts data layer
 *
 * Sử dụng TanStack Query để:
 * 1. Cache posts với stale-while-revalidate (5 phút)
 * 2. Optimistic updates cho Like/Save — UI cập nhật ngay, rollback nếu server lỗi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postApi from '../api/postApi';

// ─── Helper: format dữ liệu từ API thành shape dùng trong UI ───────────────
function formatPost(p) {
  return {
    id: p.id,
    // Giữ lại object user gốc để PostCard có thể đọc post.user?.fullName, post.user?.id
    user: p.user,
    userId: p.userId,
    author: {
      name: p.user?.fullName || p.user?.username || 'Unknown',
      username: p.user?.username,
      avatar: p.user?.avatarUrl,
      // Tạo màu consistent từ userId để tránh random mỗi lần render
      color: AVATAR_COLORS[p.userId % AVATAR_COLORS.length] || '#7c5cbf',
    },
    timeAgo: timeSince(p.createdAt),
    content: p.content,
    images: p.media && p.media.length > 0
      ? p.media.map(m =>
          m.mediaUrl?.startsWith('http')
            ? m.mediaUrl
            : `http://localhost:5231${m.mediaUrl}`
        )
      : [],
    likes: p.likeCount,
    comments: p.commentCount,
    liked: p.isLiked ?? false,
    saved: p.isSaved ?? false,
  };
}

const AVATAR_COLORS = [
  '#7c5cbf', '#e05c8e', '#5c9cbf', '#bf7c5c',
  '#4285f4', '#34a853', '#ea4335', '#fbbc04',
];

// ─── timeSince utility ──────────────────────────────────────────────────────
function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

// ─── Query key factory — centralize để dễ invalidate ───────────────────────
export const postKeys = {
  all: ['posts'],
  list: (params) => ['posts', 'list', params],
  detail: (id) => ['posts', 'detail', id],
};

// ═══════════════════════════════════════════════════════════════════════════
// Hook: usePosts
// Fetch danh sách bài post với pagination
// Stale-while-revalidate: nếu đã cache → hiển thị ngay, background refetch
// ═══════════════════════════════════════════════════════════════════════════
export function usePosts({ page = 1, pageSize = 20 } = {}) {
  return useQuery({
    queryKey: postKeys.list({ page, pageSize }),
    queryFn: async () => {
      const res = await postApi.getPosts({ page, pageSize });
      if (!res?.data) return [];
      return res.data.map(formatPost);
    },
    // placeholderData giữ data cũ hiển thị trong khi tải trang mới (pagination)
    placeholderData: (previousData) => previousData,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useToggleLike — Optimistic Update
//
// Flow:
//   1. onMutate: Snapshot cache cũ → cập nhật cache ngay lập tức (UI phản hồi tức thì)
//   2. onError: Rollback về snapshot nếu API lỗi
//   3. onSettled: Invalidate query để đồng bộ với server dù thành công hay thất bại
// ═══════════════════════════════════════════════════════════════════════════
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }) => {
      // Gọi API thật: POST /api/Posts/{postId}/like
      // axiosClient unwrap response.data, backend trả ApiResponse<LikeResultDto>
      // → kết quả là { postId, isLiked, totalLikes }
      const res = await postApi.toggleLike(postId);
      return res?.data ?? res; // hỗ trợ cả hai trường hợp unwrap
    },

    // Step 1: Cập nhật cache ngay trước khi API response
    onMutate: async ({ postId, liked }) => {
      // Hủy các query đang pending để tránh override optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      // Lưu snapshot để rollback nếu cần
      const previousQueriesData = queryClient.getQueriesData({ queryKey: postKeys.all });

      // Cập nhật tất cả cached list queries chứa post này
      queryClient.setQueriesData({ queryKey: postKeys.all }, (oldData) => {
        if (Array.isArray(oldData)) {
          return oldData.map(post =>
            post.id === postId
              ? { ...post, liked: !liked, likes: liked ? post.likes - 1 : post.likes + 1 }
              : post
          );
        } else if (oldData && oldData.id === postId) {
          // If the cached data is a single post object (from detail query)
          return { ...oldData, liked: !liked, likes: liked ? oldData.likes - 1 : oldData.likes + 1 };
        }
        return oldData;
      });

      // Trả về context để dùng trong onError
      return { previousQueriesData };
    },

    // Step 2: Rollback nếu API trả lỗi
    onError: (_err, _vars, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Step 3: Sync với server sau khi settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useToggleSave — Optimistic Update (tương tự useToggleLike)
// ═══════════════════════════════════════════════════════════════════════════
export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }) => {
      // TODO: Khi có backend thật, gọi: await postApi.toggleSave(postId)
      await new Promise(r => setTimeout(r, 200));
      return { postId };
    },

    onMutate: async ({ postId, saved }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const previousQueriesData = queryClient.getQueriesData({ queryKey: postKeys.all });

      queryClient.setQueriesData({ queryKey: postKeys.all }, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(post =>
          post.id === postId ? { ...post, saved: !saved } : post
        );
      });

      return { previousQueriesData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useCreatePost
// Tạo bài post mới với nội dung text và/hoặc nhiều file media.
//
// Usage:
//   const { mutate: createPost, isPending } = useCreatePost();
//   createPost({ content, visibility, mediaFiles }, {
//     onSuccess: () => navigate('/feed'),
//   });
// ═══════════════════════════════════════════════════════════════════════════
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, visibility = 'public', mediaFiles = [] }) => {
      const res = await postApi.createPost({ content, visibility, mediaFiles });
      // axiosClient trả về res.data (đã unwrap), backend trả ApiResponse<PostDto>
      return res?.data ?? res;
    },

    onSuccess: () => {
      // Invalidate toàn bộ post list để feed tự refresh — lấy data mới nhất từ server
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
