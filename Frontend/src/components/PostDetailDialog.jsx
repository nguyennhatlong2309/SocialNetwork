import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Heart, MessageCircle, Send, Bookmark, Share2 } from 'lucide-react';
import postApi from '../api/postApi';
import './PostDetailDialog.css';

const AVATAR_COLORS = ['#7c5cbf', '#e05c8e', '#5c9cbf', '#bf7c5c', '#4285f4'];

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return Math.floor(seconds) + 's ago';
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

export default function PostDetailDialog() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Fetch post
  useEffect(() => {
    postApi.getPostById(postId).then(res => {
      setPost(res.data);
      setLikes(res.data.likeCount);
    }).catch(err => {
      console.error('Failed to load post', err);
    }).finally(() => setLoading(false));
  }, [postId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDialog(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const closeDialog = () => {
    setVisible(false);
    setTimeout(() => navigate(-1), 220);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeDialog();
  };

  const toggleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const authorName = post?.user?.fullName || post?.user?.username || 'Unknown';
  const authorColor = AVATAR_COLORS[((post?.userId ?? 1) - 1) % AVATAR_COLORS.length];
  const comments = post?.comments || [];

  return (
    <div
      className={`pd-backdrop ${visible ? 'pd-backdrop--visible' : ''}`}
      onClick={handleBackdropClick}
      id="post-detail-backdrop"
    >
      <div
        className={`pd-dialog ${visible ? 'pd-dialog--visible' : ''}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post detail"
      >
        {/* Close button */}
        <button className="pd-close-btn" onClick={closeDialog} id="pd-close-btn" aria-label="Close">
          <X size={20} />
        </button>

        {loading && (
          <div className="pd-loading">
            <div className="pd-spinner" />
            <p>Loading post...</p>
          </div>
        )}

        {!loading && !post && (
          <div className="pd-loading">
            <p style={{ color: 'var(--text-muted)' }}>Post not found.</p>
          </div>
        )}

        {!loading && post && (
          <>
            {/* Left — image / content */}
            <div className="pd-image-panel">
              {post.media && post.media.length > 0 ? (
                <img src={post.media[0].mediaUrl} alt="post" className="pd-image" />
              ) : (
                <div className="pd-text-content">
                  <p>{post.content}</p>
                </div>
              )}

              {/* Bottom actions on image */}
              <div className="pd-image-actions">
                <button
                  className={`action-btn ${liked ? 'liked' : ''}`}
                  onClick={toggleLike}
                  id="pd-like-btn"
                >
                  <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                  <span>{formatCount(likes)}</span>
                </button>
                <button
                  className={`action-btn ${saved ? 'saved' : ''}`}
                  onClick={() => setSaved(p => !p)}
                  id="pd-save-btn"
                >
                  <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Right — comments panel */}
            <div className="pd-comments-panel">
              {/* Author header */}
              <div className="pd-header">
                <div className="post-author">
                  <div
                    className="avatar-placeholder avatar-md"
                    style={{ background: `linear-gradient(135deg, ${authorColor}, ${authorColor}88)` }}
                  >
                    {authorName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="post-author-name">{authorName}</p>
                    <p className="post-time">@{post.user?.username}</p>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" id="pd-follow-btn">Follow</button>
              </div>

              {/* Caption */}
              <div className="pd-caption">
                <p>{post.content}</p>
                <div className="pd-tags">
                  {post.content.match(/#\w+/g)?.map(tag => (
                    <span key={tag} className="post-hashtag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="pd-comments-list">
                {comments.length === 0 && (
                  <p className="pd-no-comments">No comments yet. Be the first! 🎉</p>
                )}
                {comments.map((c, idx) => {
                  const cName = c.user?.fullName || c.user?.username || 'User';
                  const cColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div key={c.id} className="comment-item">
                      <div
                        className="avatar-placeholder avatar-sm"
                        style={{ background: `linear-gradient(135deg, ${cColor}, ${cColor}88)` }}
                      >
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
                          <button className="comment-action-btn"><Heart size={12} /> 0</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comment input */}
              <div className="pd-comment-bar">
                <div className="avatar-placeholder avatar-sm" style={{ background: 'linear-gradient(135deg, #7c5cbf, #9b7fe8)' }}>
                  A
                </div>
                <input
                  id="pd-comment-input"
                  type="text"
                  className="input-field comment-input"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" disabled={!comment} id="pd-send-btn">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
