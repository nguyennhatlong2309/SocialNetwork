/**
 * ProgressiveImage.jsx — Ảnh với hiệu ứng progressive loading
 *
 * Flow:
 * 1. Render shimmer skeleton placeholder ngay lập tức
 * 2. Ảnh được load với filter: blur(12px) + opacity: 0
 * 3. Khi ảnh load xong (onLoad) → thêm class --loaded → CSS transition mượt
 *
 * Cách dùng:
 *   <ProgressiveImage src={post.image} alt="post" height="260px" />
 */

import { useState } from 'react';
import './ProgressiveImage.css';
import '../skeleton/Skeleton.css'; // dùng lại shimmer animation

export default function ProgressiveImage({
  src,
  alt = '',
  height = '260px',
  className = '',
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) return null;

  return (
    <div
      className={`progressive-image-wrap ${loaded ? '--img-loaded' : ''} ${className}`}
      style={{ height }}
      onClick={onClick}
    >
      {/* Ảnh thật — bắt đầu blur/transparent, transition khi load xong */}
      <img
        src={src}
        alt={alt}
        className={`progressive-image ${loaded ? 'progressive-image--loaded' : ''}`}
        style={{ height }}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setError(true); }} // fallback nếu ảnh lỗi
      />

      {/* Skeleton shimmer placeholder — hiển thị phía sau ảnh khi đang load */}
      {!loaded && (
        <div
          className="progressive-image-placeholder skeleton-base"
          aria-hidden="true"
        />
      )}

      {/* Error fallback */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
          aria-label="Image failed to load"
        >
          🖼️ Image unavailable
        </div>
      )}
    </div>
  );
}
