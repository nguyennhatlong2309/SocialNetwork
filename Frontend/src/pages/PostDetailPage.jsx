import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import postApi from '../api/postApi';
import './PostDetailPage.css';

const AVATAR_COLORS = ['#7c5cbf', '#e05c8e', '#5c9cbf', '#bf7c5c', '#4285f4'];

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postApi.getPostById(postId).then(res => {
      setPost(res.data);
      setLikes(res.data.likeCount);
    }).catch(err => {
      console.error('Failed to load post', err);
    }).finally(() => setLoading(false));
  }, [postId]);

  const toggleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  if (loading) {
    return (
      <div className="post-detail-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
          Post not found. <button className="text-link" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const authorName = post.user?.fullName || post.user?.username || 'Unknown';
  const authorColor = AVATAR_COLORS[(post.userId - 1) % AVATAR_COLORS.length];
  const comments = post.comments || [];

  return (
    <div className="post-detail-page">
      {/* Left: Image / Content panel */}
      <div className="post-detail-image-panel">
        <button className="back-btn" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={18} />
        </button>
        {post.media && post.media.length > 0 ? (
          <img src={post.media[0].mediaUrl} alt="post" className="post-detail-image" />
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem', textAlign: 'center'
          }}>
            {post.content}
          </div>
        )}
        {/* Bottom actions */}
        <div className="post-detail-image-actions">
          <button
            className={`action-btn ${liked ? 'liked' : ''}`}
            onClick={toggleLike}
            id="detail-like-btn"
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            <span>{formatCount(likes)}</span>
          </button>
          <button
            className={`action-btn ${saved ? 'saved' : ''}`}
            onClick={() => setSaved(p => !p)}
            id="detail-save-btn"
          >
            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Right: Comments */}
      <div className="post-detail-comments-panel">
        {/* Author */}
        <div className="post-detail-header">
          <div className="post-author">
            <div className="avatar-placeholder avatar-md"
              style={{ background: `linear-gradient(135deg, ${authorColor}, ${authorColor}88)` }}>
              {authorName[0].toUpperCase()}
            </div>
            <div>
              <p className="post-author-name">{authorName}</p>
              <p className="post-time">@{post.user?.username}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" id="follow-author-btn">Follow</button>
        </div>

        {/* Content */}
        <div className="post-detail-content">
          <p>{post.content}</p>
          <div className="post-detail-tags">
            {post.content.match(/#\w+/g)?.map(tag => (
              <span key={tag} className="post-hashtag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Comments list */}
        <div className="comments-list">
          {comments.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No comments yet. Be the first!</p>
          )}
          {comments.map((c, idx) => {
            const cName = c.user?.fullName || c.user?.username || 'User';
            const cColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div key={c.id} className="comment-item">
                <div className="avatar-placeholder avatar-sm"
                  style={{ background: `linear-gradient(135deg, ${cColor}, ${cColor}88)` }}>
                  {cName[0].toUpperCase()}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">@{c.user?.username || 'user'}</span>
                    <span className="comment-time">{timeSince(c.createdAt)}</span>
                  </div>
                  <p className="comment-text">{c.content}</p>
                  <div className="comment-actions">
                    <button className="comment-action-btn">Reply</button>
                    <button className="comment-action-btn">
                      <Heart size={12} /> 0
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment input */}
        <div className="comment-input-bar">
          <div className="avatar-placeholder avatar-sm" style={{ background: 'linear-gradient(135deg, #7c5cbf, #9b7fe8)' }}>
            A
          </div>
          <input
            id="comment-input"
            type="text"
            className="input-field comment-input"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" disabled={!comment} id="send-comment-btn">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

