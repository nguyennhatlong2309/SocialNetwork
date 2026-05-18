import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Heart, MessageCircle, Send, Bookmark, Share2, Loader2 } from 'lucide-react';
import postApi from '../api/postApi';
import { useComments, useAddComment } from '../hooks/useComments';
import UserAvatar from './ui/UserAvatar';
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
  const commentInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(0);

  // Fetch comments via TanStack Query
  const { data: comments = [], isLoading: commentsLoading } = useComments(postId);
  const addCommentMutation = useAddComment();

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

  const handleSendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || addCommentMutation.isPending) return;

    try {
      await addCommentMutation.mutateAsync({ postId, content: trimmed });
      setComment('');
      commentInputRef.current?.focus();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const authorName = post?.user?.fullName || post?.user?.username || 'Unknown';
  const authorColor = AVATAR_COLORS[((post?.userId ?? 1) - 1) % AVATAR_COLORS.length];

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
            {/* Left — image gallery / content */}
            <div className="pd-image-panel">
              {post.media && post.media.length > 0 ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                  <img
                    src={post.media[currentMedia]?.mediaUrl?.startsWith('http')
                      ? post.media[currentMedia].mediaUrl
                      : `http://localhost:5231${post.media[currentMedia]?.mediaUrl}`}
                    alt="post"
                    className="pd-image"
                  />
                  {post.media.length > 1 && (
                    <>
                      {/* Prev */}
                      <button
                        onClick={() => setCurrentMedia(i => (i - 1 + post.media.length) % post.media.length)}
                        style={{
                          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                          width: '32px', height: '32px', color: '#fff', cursor: 'pointer', fontSize: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >‹</button>
                      {/* Next */}
                      <button
                        onClick={() => setCurrentMedia(i => (i + 1) % post.media.length)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                          width: '32px', height: '32px', color: '#fff', cursor: 'pointer', fontSize: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >›</button>
                      {/* Dots */}
                      <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                        {post.media.map((_, i) => (
                          <span
                            key={i}
                            onClick={() => setCurrentMedia(i)}
                            style={{
                              width: i === currentMedia ? '18px' : '7px', height: '7px',
                              borderRadius: '4px', background: i === currentMedia ? '#fff' : 'rgba(255,255,255,0.5)',
                              cursor: 'pointer', transition: 'width 0.25s ease',
                            }}
                          />
                        ))}
                      </div>
                      {/* Counter */}
                      <div style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        borderRadius: '12px', padding: '2px 8px', fontSize: '12px',
                      }}>
                        {currentMedia + 1}/{post.media.length}
                      </div>
                    </>
                  )}
                </div>
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
                <div
                  className="post-author"
                  onClick={() => { if (post.user?.id) navigate(`/profile/${post.user.id}`); }}
                  style={{ cursor: 'pointer' }}
                  title={`View ${authorName}'s profile`}
                >
                  <UserAvatar
                    avatarUrl={post.user?.avatarUrl}
                    name={authorName}
                    userId={post.userId}
                    size="md"
                  />
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
                  {(post.content || '').match(/#\w+/g)?.map(tag => (
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
                  const goToCommentAuthor = () => {
                    if (c.user?.id) navigate(`/profile/${c.user.id}`);
                  };
                  return (
                    <div key={c.id} className="comment-item">
                      <UserAvatar
                        avatarUrl={c.user?.avatarUrl}
                        name={cName}
                        userId={c.user?.id}
                        size="sm"
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                        onClick={goToCommentAuthor}
                        title={`View ${cName}'s profile`}
                      />
                      <div className="comment-body">
                        <div className="comment-header">
                          <span
                            className="comment-author"
                            style={{ cursor: 'pointer' }}
                            onClick={goToCommentAuthor}
                          >
                            @{c.user?.username || 'user'}
                          </span>
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
                  onKeyDown={handleCommentKeyDown}
                  ref={commentInputRef}
                />
                <button 
                  className="btn btn-primary btn-sm" 
                  disabled={!comment || addCommentMutation.isPending} 
                  id="pd-send-btn"
                  onClick={handleSendComment}
                >
                  {addCommentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
