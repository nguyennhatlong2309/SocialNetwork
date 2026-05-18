/**
 * UserAvatar — Component dùng chung để hiển thị ảnh đại diện
 *
 * Ưu tiên: avatarUrl (ảnh thật) → placeholder với chữ cái đầu
 *
 * Props:
 *   - avatarUrl: string | null — URL ảnh đại diện từ server
 *   - name: string — Tên hiển thị (dùng để lấy chữ cái đầu khi không có ảnh)
 *   - userId: number — Dùng để chọn màu placeholder nhất quán
 *   - size: 'sm' | 'md' | 'lg' — Kích thước avatar
 *   - className: string — CSS class bổ sung
 *   - style: object — Inline style bổ sung
 *   - onClick: function — Handler click
 */

const AVATAR_COLORS = [
  '#7c5cbf', '#e05c8e', '#5c9cbf', '#bf7c5c',
  '#4285f4', '#34a853', '#ea4335', '#fbbc04',
];

export default function UserAvatar({
  avatarUrl,
  name = 'U',
  userId = 0,
  size = 'md',
  className = '',
  style = {},
  onClick,
  title,
}) {
  const initial = (name || 'U')[0].toUpperCase();
  const color = AVATAR_COLORS[Math.abs(Number(userId)) % AVATAR_COLORS.length] || '#7c5cbf';

  const sizeClass = `avatar-${size}`;

  // Normalize avatarUrl: thêm base URL nếu là đường dẫn tương đối
  const resolvedUrl = avatarUrl
    ? (avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5231${avatarUrl}`)
    : null;

  const commonProps = {
    className: `${sizeClass} ${className}`.trim(),
    style,
    onClick,
    title,
  };

  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        alt={name}
        className={`avatar ${sizeClass} ${className}`.trim()}
        style={style}
        onClick={onClick}
        title={title}
        onError={(e) => {
          // Fallback: ẩn img và hiển thị placeholder
          const parent = e.currentTarget.parentElement;
          if (parent) {
            e.currentTarget.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = `avatar-placeholder ${sizeClass} ${className}`.trim();
            placeholder.style.cssText = `background: linear-gradient(135deg, ${color}, ${color}88);`;
            placeholder.textContent = initial;
            parent.appendChild(placeholder);
          }
        }}
      />
    );
  }

  return (
    <div
      {...commonProps}
      className={`avatar-placeholder ${sizeClass} ${className}`.trim()}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
