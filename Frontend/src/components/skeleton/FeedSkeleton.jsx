/**
 * FeedSkeleton.jsx — Hiển thị 3 PostCardSkeleton khi feed đang loading
 * Số lượng 3 là heuristic hợp lý — đủ để fill viewport mà không quá nhiều DOM
 */

import PostCardSkeleton from './PostCardSkeleton';

const SKELETON_COUNT = 3;

export default function FeedSkeleton() {
  return (
    <div className="posts-list" aria-label="Loading feed...">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
