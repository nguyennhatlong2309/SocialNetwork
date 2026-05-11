/**
 * usePost.js — Hook fetch chi tiết một bài post
 *
 * Tính năng key:
 * - initialData: Nếu post đã có trong cache của usePosts() → hiển thị ngay lập tức
 *   (0ms loading khi mở PostDetailDialog từ feed)
 * - Chỉ gọi API khi cần thiết (không có trong cache)
 */

import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import postApi from '../api/postApi';
import { postKeys } from './usePosts';

export function usePost(postId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const res = await postApi.getPostById(postId);
      return res?.data ?? null;
    },
    enabled: !!postId,

    /**
     * initialData: Tìm post trong bất kỳ list cache nào trước
     * → Nếu user navigate từ feed, post đã có trong cache → modal mở ngay, 0ms loading
     * → initialDataUpdatedAt: 0 → TanStack biết data này cũ, vẫn sẽ background fetch
     */
    initialData: () => {
      // Tìm kiếm trong tất cả list queries đang cached
      const allListQueries = queryClient.getQueriesData({ queryKey: ['posts', 'list'] });
      for (const [, posts] of allListQueries) {
        if (Array.isArray(posts)) {
          const found = posts.find(p => String(p.id) === String(postId));
          if (found) return found;
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: 0, // Force background refetch dù có initialData
  });
}
