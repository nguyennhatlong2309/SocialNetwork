/**
 * PostCardSkeleton.jsx — Skeleton layout khớp với PostCard thật
 * Được thiết kế để user không bị "layout shift" khi data load xong
 */

import { SkeletonAvatar, SkeletonText, SkeletonImage, SkeletonBlock } from './Skeleton';

export default function PostCardSkeleton() {
  return (
    <article className="post-card card" aria-busy="true" aria-label="Loading post...">
      {/* Header: avatar + author info + menu button */}
      <div className="post-header">
        <div className="post-author" style={{ gap: '12px' }}>
          <SkeletonAvatar size="md" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <SkeletonBlock width="140px" height="14px" />
            <SkeletonBlock width="80px"  height="11px" />
          </div>
        </div>
        <SkeletonBlock width="28px" height="28px" style={{ borderRadius: '50%' }} />
      </div>

      {/* Content: text */}
      <div style={{ margin: '12px 0' }}>
        <SkeletonText lines={3} />
      </div>

      {/* Image (hiển thị 50% chance để tránh mọi card đều có skeleton image) */}
      <SkeletonImage height="220px" />

      {/* Actions: like, comment, share, save */}
      <div className="post-actions" style={{ marginTop: '14px' }}>
        <div className="post-actions-left" style={{ display: 'flex', gap: '16px' }}>
          <SkeletonBlock width="56px" height="32px" style={{ borderRadius: '20px' }} />
          <SkeletonBlock width="56px" height="32px" style={{ borderRadius: '20px' }} />
          <SkeletonBlock width="32px" height="32px" style={{ borderRadius: '20px' }} />
        </div>
        <SkeletonBlock width="32px" height="32px" style={{ borderRadius: '20px' }} />
      </div>
    </article>
  );
}
