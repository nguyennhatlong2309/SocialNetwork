/**
 * NewsFeedPage.jsx — Đã refactor với TanStack Query + Skeleton + Progressive Image
 *
 * Thay đổi so với phiên bản cũ:
 * ─────────────────────────────
 * TRƯỚC: useEffect + useState(loading) + setPosts
 * SAU:   usePosts() hook → tự động cache, stale-while-revalidate
 *
 * Loading state: "Loading..." text → FeedSkeleton (shimmer animation)
 * Image:         <img /> thường → <ProgressiveImage /> (blur-to-clear)
 * Like/Save:     local state toggle → useToggleLike / useToggleSave (optimistic update)
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';

// ─── TanStack Query hooks ───────────────────────────────────────────────────
import { usePosts, useToggleLike, useToggleSave } from '../../hooks/usePosts';
import { useSuggestedUsers, useToggleFollow } from '../../hooks/useUsers';

// ─── Skeleton + Progressive Image ──────────────────────────────────────────
import FeedSkeleton from '../../components/skeleton/FeedSkeleton';
import ProgressiveImage from '../../components/ui/ProgressiveImage';
import UserAvatar from '../../components/ui/UserAvatar';

import './NewsFeedPage.css';

// ─── Static mock data (stories, sidebar) — không cần cache ─────────────────
const STORIES = [
  { id: 'you', name: 'You', isYou: true },
  { id: 1, name: 'Alex M.',  color: '#7c5cbf' },
  { id: 2, name: 'Elena R.', color: '#e05c8e' },
  { id: 3, name: 'Marcus',   color: '#5c9cbf' },
  { id: 4, name: 'Sarah J.', color: '#bf7c5c' },
];

// SUGGESTED mock data đã được xóa — dữ liệu thật load từ useSuggestedUsers()

const TRENDING = [
  { category: 'Design', tag: '#Glassmorphism',    posts: '42.5K' },
  { category: 'Tech',   tag: '#SpatialComputing', posts: '18.2K' },
  { category: 'Art',    tag: '#GenerativeArt',    posts: '12.8K' },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

// ─── Media Gallery Component — hỗ trợ nhiều ảnh với slider ───────────────
function MediaGallery({ images, onClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = (e) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={onClick}>
      <img
        src={images[current]}
        alt={`media-${current}`}
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
      />
      {images.length > 1 && (
        <>
          {/* Prev / Next buttons */}
          <button
            onClick={prev}
            style={{
              position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
              width: '30px', height: '30px', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}
          >‹</button>
          <button
            onClick={next}
            style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
              width: '30px', height: '30px', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}
          >›</button>
          {/* Dot indicators */}
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                style={{
                  width: i === current ? '18px' : '7px', height: '7px',
                  borderRadius: '4px', background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'width 0.25s ease',
                }}
              />
            ))}
          </div>
          {/* Counter badge */}
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            borderRadius: '12px', padding: '2px 8px', fontSize: '12px',
          }}>
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Post Card Component (tách ra để dễ memo sau này) ──────────────────────
function PostCard({ post, onOpenPost, onToggleLike, onToggleSave, onOpenProfile }) {
  return (
    <article
      key={post.id}
      className="post-card card animate-fade-in"
      id={`post-${post.id}`}
    >
      {/* Header */}
      <div className="post-header">
        <div
          className="post-author"
          onClick={(e) => { e.stopPropagation(); onOpenProfile(post.user?.id); }}
          style={{ cursor: 'pointer' }}
          title={`View ${post.user?.fullName || post.user?.username || 'Unknown'}'s profile`}
        >
          <UserAvatar
            avatarUrl={post.user?.avatarUrl}
            name={post.user?.fullName || post.user?.username || 'U'}
            userId={post.user?.id}
            size="md"
          />
          <div>
            <p className="post-author-name" style={{ cursor: 'pointer' }}>
              {post.user?.fullName || post.user?.username || 'Unknown'}
            </p>
            <p className="post-time">@{post.user?.username || ''} · {post.timeAgo || 'Just now'}</p>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm post-menu-btn"
          aria-label="Post options"
          onClick={(e) => { e.stopPropagation(); alert('More options clicked'); }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <p className="post-content" onClick={() => onOpenPost(post.id)}>
        {(post.content || '').split(/(#\w+)/g).map((part, i) =>
          part.startsWith('#')
            ? <span key={i} className="post-hashtag">{part}</span>
            : part
        )}
      </p>

      {/* Media Gallery: hỗ trợ nhiều ảnh */}
      {post.images && post.images.length > 0 && (
        <MediaGallery images={post.images} onClick={() => onOpenPost(post.id)} />
      )}

      {/* Actions */}
      <div className="post-actions">
        <div className="post-actions-left">
          {/* Like — optimistic update */}
          <button
            className={`action-btn ${post.liked ? 'liked' : ''}`}
            onClick={() => onToggleLike(post.id, post.liked)}
            id={`like-btn-${post.id}`}
            aria-label={post.liked ? 'Unlike' : 'Like'}
            aria-pressed={post.liked}
          >
            <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
            <span>{formatCount(post.likes)}</span>
          </button>

          <button className="action-btn" onClick={() => onOpenPost(post.id)} aria-label="Comment">
            <MessageCircle size={18} />
            <span>{formatCount(post.comments)}</span>
          </button>

          <button className="action-btn" aria-label="Share">
            <Send size={18} />
          </button>
        </div>

        {/* Save — optimistic update */}
        <button
          className={`action-btn ${post.saved ? 'saved' : ''}`}
          onClick={() => onToggleSave(post.id, post.saved)}
          id={`save-btn-${post.id}`}
          aria-label={post.saved ? 'Unsave' : 'Save'}
          aria-pressed={post.saved}
        >
          <Bookmark size={18} fill={post.saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────
export default function NewsFeedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Không cần scroll save/restore — component được Keep-Alive (không unmount)
  // nên scrollTop trên .feed-page-scroll được trình duyệt bảo toàn tự nhiên.
  
  // ─── Suggested Users ───────────────────────────────────────────────────
  const {
    data: suggestedUsers = [],
    isLoading: isSuggestedLoading,
  } = useSuggestedUsers(8);
  const toggleFollowMutation = useToggleFollow();

  /**
   * usePosts() — TanStack Query hook
   * - isLoading: true chỉ lần đầu, khi KHÔNG có cache
   * - isFetching: true mỗi khi background refetch (stale-while-revalidate)
   * - data: trả về cached data ngay lập tức nếu đã có trong cache
   */
  const { data: posts = [], isLoading, isError, refetch, isFetching } = usePosts();

  // Mutations với optimistic update
  const toggleLikeMutation = useToggleLike();
  const toggleSaveMutation = useToggleSave();

  const openPost = (postId) => {
    navigate(`/post/${postId}`, { state: { background: location } });
  };

  const openProfile = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
  };

  const handleToggleLike = (postId, liked) => {
    toggleLikeMutation.mutate({ postId, liked });
  };

  const handleToggleSave = (postId, saved) => {
    toggleSaveMutation.mutate({ postId, saved });
  };

  const handleToggleFollow = (user) => {
    toggleFollowMutation.mutate({
      userId: user.id,
      currentIsFollowing: user.isFollowing,
    });
  };

  return (
    <div className="feed-page-scroll">
    <div className="feed-page">
      {/* Center feed */}
      <div className="feed-main">
        {/* Stories */}
        <div className="stories-bar">
          {STORIES.map(story => (
            <div key={story.id} className="story-item" id={`story-${story.id}`}>
              <div
                className={`story-avatar ${!story.isYou ? 'story-avatar-ring' : 'story-avatar-add'}`}
                style={{ background: story.color || 'var(--bg-tertiary)' }}
              >
                {story.isYou
                  ? <Plus size={18} color="white" />
                  : <span className="story-initial">{story.name[0]}</span>
                }
              </div>
              <span className="story-name">{story.name}</span>
            </div>
          ))}
        </div>

        {/* Background fetch indicator — hiện subtle khi refetch trong background */}
        {isFetching && !isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            marginBottom: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            opacity: 0.7,
          }}>
            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            Updating feed...
          </div>
        )}

        {/* Posts list */}
        <div className="posts-list">
          {/* LOADING: Hiển thị skeleton thay vì text "Loading..." */}
          {isLoading && <FeedSkeleton />}

          {/* ERROR: Thông báo lỗi với retry */}
          {isError && (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '12px' }}>⚠️ Failed to load posts.</p>
              <button className="btn btn-primary btn-sm" onClick={() => refetch()}>
                Try again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !isError && posts.length === 0 && (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No posts yet. Be the first to post!
            </div>
          )}

          {/* DATA: Render posts */}
          {!isLoading && posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onOpenPost={openPost}
              onOpenProfile={openProfile}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="feed-sidebar">
        {/* Suggested for you */}
        <div className="sidebar-section card">
          <h3 className="sidebar-section-title">Suggested for you</h3>

          {/* Loading skeleton */}
          {isSuggestedLoading && (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="suggest-item" style={{ opacity: 0.5 }}>
                  <div className="avatar-placeholder avatar-sm" style={{
                    background: 'var(--bg-tertiary)',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                  <div className="suggest-info">
                    <div style={{ height: '12px', width: '80px', background: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '6px', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ height: '10px', width: '55px', background: 'var(--bg-tertiary)', borderRadius: '6px', animation: 'shimmer 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Empty state */}
          {!isSuggestedLoading && suggestedUsers.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0' }}>
              No suggestions available
            </p>
          )}

          {/* Suggested user list */}
          {!isSuggestedLoading && suggestedUsers.map(u => (
            <div key={u.id} className="suggest-item">
              {/* Avatar — click → profile */}
              <div
                onClick={() => openProfile(u.id)}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                title={`View ${u.fullName || u.username}'s profile`}
              >
                <UserAvatar
                  avatarUrl={u.avatarUrl}
                  name={u.fullName || u.username}
                  userId={u.id}
                  size="sm"
                />
              </div>

              {/* Name + username — click → profile */}
              <div
                className="suggest-info"
                onClick={() => openProfile(u.id)}
                style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              >
                <p className="suggest-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {u.fullName || u.username}
                  {u.isVerified && (
                    <span title="Verified" style={{ color: '#4285f4', fontSize: '12px' }}>✓</span>
                  )}
                </p>
                <p className="suggest-role">@{u.username}</p>
              </div>

              {/* Follow / Unfollow button */}
              <button
                className={`suggest-follow-btn ${u.isFollowing ? 'following' : ''}`}
                id={`follow-btn-${u.id}`}
                onClick={() => handleToggleFollow(u)}
                disabled={toggleFollowMutation.isPending}
                title={u.isFollowing ? 'Unfollow' : 'Follow'}
              >
                {u.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        {/* Trending */}
        <div className="sidebar-section card">
          <h3 className="sidebar-section-title">Trending Now</h3>
          {TRENDING.map((t, i) => (
            <div key={i} className="trending-item">
              <span className="trending-category">{t.category} · Trending</span>
              <p className="trending-tag">{t.tag}</p>
              <span className="trending-count">{t.posts} posts</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
    </div>
  );
}
