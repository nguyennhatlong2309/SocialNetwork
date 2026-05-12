import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import postApi from '../api/postApi';
import { useToggleLike, postKeys } from '../hooks/usePosts';
import { useComments, useAddComment } from '../hooks/useComments';
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
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);
  const commentInputRef = useRef(null);

  // ─── Fetch post detail ──────────────────────────────────────────────────
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const res = await postApi.getPostById(postId);
      // axiosClient unwrap lần 1 → res = ApiResponse<PostDetailDto>
      return res?.data ?? res;
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 phút
  });

  // ─── Fetch comments (riêng để refetch độc lập) ──────────────────────────
  const { data: comments = [] } = useComments(postId);

  // ─── Toggle Like (optimistic) ───────────────────────────────────────────
  const toggleLikeMutation = useToggleLike();

  // Derive liked state từ post data (server là source of truth)
  const liked = post?.liked ?? false;
  const likeCount = post?.likeCount ?? 0;

  const handleToggleLike = () => {
    if (!post) return;
    toggleLikeMutation.mutate({ postId: Number(postId), liked });
  };

  // ─── Add Comment ────────────────────────────────────────────────────────
  const addCommentMutation = useAddComment();

  const handleSendComment = () => {
    const trimmed = comment.trim();
    if (!trimmed || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { postId: Number(postId), content: trimmed },
      {
        onSuccess: () => {
          setComment(''); // clear input sau khi submit thành công
          commentInputRef.current?.blur();
        },
        onError: (err) => {
          console.error('Failed to add comment:', err);
        },
      }
    );
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // ─── Loading / Error states ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="post-detail-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading post...</div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="post-detail-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
          Post not found. <button className="text-link" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const authorName = post.user?.fullName || post.user?.username || 'Unknown';
  const authorColor = AVATAR_COLORS[(post.user?.id ?? 0) % AVATAR_COLORS.length];

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
            onClick={handleToggleLike}
            disabled={toggleLikeMutation.isPending}
            id="detail-like-btn"
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            <span>{formatCount(likeCount)}</span>
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
            {post.content?.match(/#\w+/g)?.map(tag => (
              <span key={tag} className="post-hashtag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Comments list */}
        <div className="comments-list">
          {comments.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No comments yet. Be the first!
            </p>
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
                      <Heart size={12} /> {c.likeCount || 0}
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
            ref={commentInputRef}
            type="text"
            className="input-field comment-input"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            disabled={addCommentMutation.isPending}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSendComment}
            disabled={!comment.trim() || addCommentMutation.isPending}
            id="send-comment-btn"
          >
            {addCommentMutation.isPending
              ? <span style={{ fontSize: '0.75rem' }}>...</span>
              : <Send size={14} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
