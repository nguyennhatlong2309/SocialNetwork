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

import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';

// ─── TanStack Query hooks ───────────────────────────────────────────────────
import { usePosts, useToggleLike, useToggleSave } from '../hooks/usePosts';

// ─── Skeleton + Progressive Image ──────────────────────────────────────────
import FeedSkeleton from '../components/skeleton/FeedSkeleton';
import ProgressiveImage from '../components/ui/ProgressiveImage';

import './NewsFeedPage.css';

// ─── Static mock data (stories, sidebar) — không cần cache ─────────────────
const STORIES = [
  { id: 'you', name: 'You', isYou: true },
  { id: 1, name: 'Alex M.',  color: '#7c5cbf' },
  { id: 2, name: 'Elena R.', color: '#e05c8e' },
  { id: 3, name: 'Marcus',   color: '#5c9cbf' },
  { id: 4, name: 'Sarah J.', color: '#bf7c5c' },
];

const SUGGESTED = [
  { id: 1, name: 'David Chen', role: 'Digital Artist', color: '#4285f4' },
  { id: 2, name: 'Maya S.',    role: 'UX Designer',    color: '#e05c8e' },
];

const TRENDING = [
  { category: 'Design', tag: '#Glassmorphism',    posts: '42.5K' },
  { category: 'Tech',   tag: '#SpatialComputing', posts: '18.2K' },
  { category: 'Art',    tag: '#GenerativeArt',    posts: '12.8K' },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

// ─── Post Card Component (tách ra để dễ memo sau này) ──────────────────────
function PostCard({ post, onOpenPost, onToggleLike, onToggleSave }) {
  return (
    <article
      key={post.id}
      className="post-card card animate-fade-in"
      id={`post-${post.id}`}
    >
      {/* Header */}
      <div className="post-header">
        <div className="post-author" onClick={() => onOpenPost(post.id)}>
          <div
            className="avatar-placeholder avatar-md"
            style={{ background: `linear-gradient(135deg, ${post.author.color}, ${post.author.color}88)` }}
          >
            {post.author.name[0]}
          </div>
          <div>
            <p className="post-author-name">{post.author.name}</p>
            <p className="post-time">{post.timeAgo}</p>
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

      {/* Image: Progressive loading — blur → clear */}
      {post.image && (
        <ProgressiveImage
          src={post.image}
          alt={`Post by ${post.author.name}`}
          height="400px"
          onClick={() => onOpenPost(post.id)}
        />
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

  const handleToggleLike = (postId, liked) => {
    toggleLikeMutation.mutate({ postId, liked });
  };

  const handleToggleSave = (postId, saved) => {
    toggleSaveMutation.mutate({ postId, saved });
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
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="feed-sidebar">
        {/* Suggested */}
        <div className="sidebar-section card">
          <h3 className="sidebar-section-title">Suggested for you</h3>
          {SUGGESTED.map(u => (
            <div key={u.id} className="suggest-item">
              <div
                className="avatar-placeholder avatar-sm"
                style={{ background: `linear-gradient(135deg, ${u.color}, ${u.color}88)` }}
              >
                {u.name[0]}
              </div>
              <div className="suggest-info">
                <p className="suggest-name">{u.name}</p>
                <p className="suggest-role">{u.role}</p>
              </div>
              <button className="suggest-follow-btn" id={`follow-btn-${u.id}`}>Follow</button>
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
