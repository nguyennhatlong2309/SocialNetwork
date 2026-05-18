/**
 * useUsers.js — Custom hooks cho User data layer (Suggested Users + Follow)
 *
 * Hooks:
 *  - useSuggestedUsers()   → fetch danh sách user gợi ý (chỉ người chưa follow)
 *  - useToggleFollow()     → mutation follow/unfollow với optimistic update
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../api/userApi';

// ─── Query key factory ──────────────────────────────────────────────────────
export const userKeys = {
  suggested: ['users', 'suggested'],
};

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useSuggestedUsers
//
// Fetch danh sách user được gợi ý từ backend.
// Backend đã lọc sẵn những người chưa follow nên không cần lọc thêm.
// Dữ liệu được cache 2 phút (staleTime), sau đó background refetch.
// ═══════════════════════════════════════════════════════════════════════════
export function useSuggestedUsers(count = 10) {
  return useQuery({
    queryKey: [...userKeys.suggested, count],
    queryFn: async () => {
      const res = await userApi.getSuggestedUsers(count);
      // axiosClient đã unwrap response.data → res là mảng UserDto[]
      // Mỗi UserDto: { id, username, fullName, avatarUrl, isVerified }
      if (!Array.isArray(res)) return [];
      return res.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
          // Normalize avatarUrl nếu là relative path
          ...(u.avatarUrl && !u.avatarUrl.startsWith('http') && {
            avatarUrl: `http://localhost:5231${u.avatarUrl}`,
          }),
        isVerified: u.isVerified ?? false,
        // isFollowing khởi đầu là false (backend đã lọc)
        isFollowing: false,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    retry: 1,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useToggleFollow — Optimistic Update
//
// Flow:
//   1. onMutate: Cập nhật cache ngay (toggle isFollowing trong suggested list)
//   2. onError:  Rollback nếu API lỗi
//   3. onSettled: Không invalidate suggested (giữ user trong list cho đến reload)
//                 Behavior này giống Instagram — sau khi follow, item vẫn hiển thị
//                 với trạng thái "Following" cho đến khi user reload trang.
// ═══════════════════════════════════════════════════════════════════════════
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }) => {
      // POST /api/Users/{userId}/follow
      // Backend trả về { isFollowing: boolean }
      const res = await userApi.toggleFollow(userId);
      return res?.data ?? res;
    },

    // Step 1: Optimistic update — toggle isFollowing ngay lập tức
    onMutate: async ({ userId, currentIsFollowing }) => {
      // Cancel in-flight queries để tránh race condition
      await queryClient.cancelQueries({ queryKey: userKeys.suggested });

      // Snapshot để rollback
      const previousData = queryClient.getQueriesData({ queryKey: userKeys.suggested });

      // Cập nhật cache: toggle isFollowing cho đúng user
      queryClient.setQueriesData({ queryKey: userKeys.suggested }, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(u =>
          u.id === userId
            ? { ...u, isFollowing: !currentIsFollowing }
            : u
        );
      });

      return { previousData };
    },

    // Step 2: Rollback nếu lỗi
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Step 3: Không invalidate suggested list để giữ item hiển thị với trạng thái mới.
    // Nếu muốn xóa hẳn item đã follow khỏi list, uncomment dòng dưới:
    // onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.suggested }),
  });
}
