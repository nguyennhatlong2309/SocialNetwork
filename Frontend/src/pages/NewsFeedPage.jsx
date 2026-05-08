import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus } from 'lucide-react';
import postApi from '../api/postApi';
import './NewsFeedPage.css';

const STORIES = [
  { id: 'you', name: 'You', isYou: true },
  { id: 1, name: 'Alex M.', color: '#7c5cbf' },
  { id: 2, name: 'Elena R.', color: '#e05c8e' },
  { id: 3, name: 'Marcus', color: '#5c9cbf' },
  { id: 4, name: 'Sarah J.', color: '#bf7c5c' },
];

const SUGGESTED = [
  { id: 1, name: 'David Chen', role: 'Digital Artist', color: '#4285f4' },
  { id: 2, name: 'Maya S.', role: 'UX Designer', color: '#e05c8e' },
];

const TRENDING = [
  { category: 'Design', tag: '#Glassmorphism', posts: '42.5K' },
  { category: 'Tech', tag: '#SpatialComputing', posts: '18.2K' },
  { category: 'Art', tag: '#GenerativeArt', posts: '12.8K' },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function NewsFeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postApi.getPosts({ page: 1, pageSize: 20 });
        if (res && res.data) {
          const formattedPosts = res.data.map(p => ({
            id: p.id,
            author: { 
              name: p.user?.fullName || p.user?.username, 
              username: p.user?.username, 
              avatar: p.user?.avatarUrl, 
              color: '#7c5cbf' // mock color for now
            },
            timeAgo: timeSince(p.createdAt),
            content: p.content,
            image: p.media && p.media.length > 0 ? p.media[0].mediaUrl : null,
            likes: p.likeCount,
            comments: p.commentCount,
            liked: false, // will need real liked status from API later
            saved: false
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const toggleLike = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const toggleSave = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  return (
    <div className="feed-page">
      {/* Center feed */}
      <div className="feed-main">
        {/* Stories */}
        <div className="stories-bar">
          {STORIES.map(story => (
            <div key={story.id} className="story-item" id={`story-${story.id}`}>
              <div className={`story-avatar ${!story.isYou ? 'story-avatar-ring' : 'story-avatar-add'}`}
                style={{ background: story.color || 'var(--bg-tertiary)' }}>
                {story.isYou
                  ? <Plus size={18} color="white" />
                  : <span className="story-initial">{story.name[0]}</span>
                }
              </div>
              <span className="story-name">{story.name}</span>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className="posts-list">
          {loading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No posts found.
            </div>
          ) : posts.map(post => (
            <article key={post.id} className="post-card card animate-fade-in" id={`post-${post.id}`}>
              <div className="post-header">
                <div className="post-author" onClick={() => navigate(`/post/${post.id}`)}>
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
                <button className="btn btn-ghost btn-sm post-menu-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <p className="post-content" onClick={() => navigate(`/post/${post.id}`)}>
                {post.content.split(/(#\w+)/g).map((part, i) =>
                  part.startsWith('#')
                    ? <span key={i} className="post-hashtag">{part}</span>
                    : part
                )}
              </p>

              {post.image && (
                <div className="post-image-wrap" onClick={() => navigate(`/post/${post.id}`)}>
                  <img src={post.image} alt="post" className="post-image" />
                </div>
              )}

              <div className="post-actions">
                <div className="post-actions-left">
                  <button
                    className={`action-btn ${post.liked ? 'liked' : ''}`}
                    onClick={() => toggleLike(post.id)}
                    id={`like-btn-${post.id}`}
                  >
                    <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                    <span>{formatCount(post.likes)}</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate(`/post/${post.id}`)}>
                    <MessageCircle size={18} />
                    <span>{formatCount(post.comments)}</span>
                  </button>
                  <button className="action-btn">
                    <Send size={18} />
                  </button>
                </div>
                <button
                  className={`action-btn ${post.saved ? 'saved' : ''}`}
                  onClick={() => toggleSave(post.id)}
                  id={`save-btn-${post.id}`}
                >
                  <Bookmark size={18} fill={post.saved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </article>
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
              <div className="avatar-placeholder avatar-sm" style={{ background: `linear-gradient(135deg, ${u.color}, ${u.color}88)` }}>
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
  );
}
