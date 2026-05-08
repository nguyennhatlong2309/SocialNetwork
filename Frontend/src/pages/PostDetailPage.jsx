import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import './PostDetailPage.css';

const POST = {
  id: 1,
  author: { name: '@sarah_vfx', avatar: null, color: '#9b7fe8' },
  timeAgo: '2 hours ago in Explore',
  following: false,
  image: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800&q=80',
  content: 'Late night rendering sessions paying off. The refraction indices on the glass materials finally look physically accurate. Built with Custom Shaders and pure math. ✨',
  tags: ['#VFX', '#DigitalArt', '#Glassmorphism'],
  likes: 24500,
  liked: false,
  saved: false,
};

const COMMENTS = [
  {
    id: 1,
    author: '@josh_renders',
    color: '#5c9cbf',
    timeAgo: '1h',
    content: 'Insane level of detail! Would you ever consider doing a breakdown tutorial on those shader nodes?',
    likes: 124,
    replies: [
      {
        id: 2,
        author: '@sarah_vfx',
        color: '#9b7fe8',
        timeAgo: '45m',
        content: 'Thanks! Planning to drop a Patreon video on it next week. Keep an eye out 👀',
        likes: 42,
      }
    ]
  },
  {
    id: 3,
    author: '@maya_design',
    color: '#e05c8e',
    timeAgo: '30m',
    content: 'The lighting in this is absolutely perfect. Saving this to my moodboard immediately.',
    likes: 8,
    replies: []
  },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(POST);
  const [comment, setComment] = useState('');

  const toggleLike = () => {
    setPost(p => ({ ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }));
  };

  return (
    <div className="post-detail-page">
      {/* Left: Image */}
      <div className="post-detail-image-panel">
        <button className="back-btn" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={18} />
        </button>
        <img
          src={post.image}
          alt="post"
          className="post-detail-image"
        />
        {/* Bottom actions */}
        <div className="post-detail-image-actions">
          <button
            className={`action-btn ${post.liked ? 'liked' : ''}`}
            onClick={toggleLike}
            id="detail-like-btn"
          >
            <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
            <span>{formatCount(post.likes)}</span>
          </button>
          <button
            className={`action-btn ${post.saved ? 'saved' : ''}`}
            onClick={() => setPost(p => ({ ...p, saved: !p.saved }))}
            id="detail-save-btn"
          >
            <Bookmark size={20} fill={post.saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Right: Comments */}
      <div className="post-detail-comments-panel">
        {/* Author */}
        <div className="post-detail-header">
          <div className="post-author">
            <div className="avatar-placeholder avatar-md"
              style={{ background: `linear-gradient(135deg, ${post.author.color}, ${post.author.color}88)` }}>
              {post.author.name[1].toUpperCase()}
            </div>
            <div>
              <p className="post-author-name">{post.author.name}</p>
              <p className="post-time">{post.timeAgo}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" id="follow-author-btn">
            {post.following ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Content */}
        <div className="post-detail-content">
          <p>{post.content}</p>
          <div className="post-detail-tags">
            {post.tags.map(tag => (
              <span key={tag} className="post-hashtag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Comments list */}
        <div className="comments-list">
          {COMMENTS.map(c => (
            <div key={c.id} className="comment-item">
              <div className="avatar-placeholder avatar-sm"
                style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }}>
                {c.author[1].toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">{c.timeAgo}</span>
                </div>
                <p className="comment-text">{c.content}</p>
                <div className="comment-actions">
                  <button className="comment-action-btn">Reply</button>
                  <button className="comment-action-btn">
                    <Heart size={12} /> {c.likes}
                  </button>
                </div>
                {/* Replies */}
                {c.replies?.map(r => (
                  <div key={r.id} className="reply-item">
                    <div className="avatar-placeholder" style={{
                      background: `linear-gradient(135deg, ${r.color}, ${r.color}88)`,
                      width: 24, height: 24, fontSize: 10,
                      borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                    }}>
                      {r.author[1].toUpperCase()}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{r.author}</span>
                        <span className="comment-time">{r.timeAgo}</span>
                      </div>
                      <p className="comment-text">{r.content}</p>
                      <div className="comment-actions">
                        <button className="comment-action-btn">
                          <Heart size={12} /> {r.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
