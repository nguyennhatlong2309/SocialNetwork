/**
 * Skeleton.jsx — Primitive skeleton components có thể tái sử dụng
 *
 * Cách dùng:
 *   <SkeletonAvatar size="md" />
 *   <SkeletonText lines={3} />
 *   <SkeletonImage height="200px" />
 *   <SkeletonBlock width="120px" height="36px" />
 */

import './Skeleton.css';

// ─── Avatar Skeleton ────────────────────────────────────────────────────────
export function SkeletonAvatar({ size = 'md', className = '' }) {
  return (
    <div
      className={`skeleton-base skeleton-avatar skeleton-avatar--${size} ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Text Lines Skeleton ────────────────────────────────────────────────────
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton-base skeleton-text__line" />
      ))}
    </div>
  );
}

// ─── Image Block Skeleton ───────────────────────────────────────────────────
export function SkeletonImage({ height = '200px', className = '' }) {
  return (
    <div
      className={`skeleton-base skeleton-image ${className}`}
      style={{ height }}
      aria-hidden="true"
    />
  );
}

// ─── Generic Block Skeleton ─────────────────────────────────────────────────
export function SkeletonBlock({ width = '100%', height = '16px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-base skeleton-block ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
