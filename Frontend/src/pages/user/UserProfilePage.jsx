import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Grid, List, AtSign, Bookmark, UserPlus, UserMinus, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useInboxState } from '../../contexts/PageStateContext';
import { userService } from '../../services/userService';
import messageApi from '../../api/messageApi';
import UserAvatar from '../../components/ui/UserAvatar';
import { useQueryClient } from '@tanstack/react-query';
import { messageKeys, formatConversation } from '../../hooks/useMessages';
import './UserProfilePage.css';

const TABS = [
  { id: 'gallery', label: 'Posts', icon: Grid },
  { id: 'mentions', label: 'Mentions', icon: AtSign },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n || 0;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryView, setGalleryView] = useState('grid'); // 'grid' | 'list'
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const { setSelectedId } = useInboxState();
  const queryClient = useQueryClient();

  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = String(targetUserId) === String(currentUser?.id);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileData, postsData] = await Promise.all([
          userService.getUserProfile(targetUserId),
          userService.getUserPosts(targetUserId, 1, 20)
        ]);
        
        setProfile(profileData);
        setIsFollowing(profileData.isFollowing);
        setPosts(postsData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (targetUserId) {
      loadData();
    }
  }, [targetUserId]);

  const handleToggleFollow = async () => {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const res = await userService.toggleFollow(targetUserId);
      setIsFollowing(res.isFollowing);
      
      // Update followers count
      setProfile(prev => ({
        ...prev,
        followersCount: res.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      setMessageLoading(true);
      const res = await messageApi.getOrCreateConversation(targetUserId);
      const rawConv = res?.data || res;
      const conversationId = rawConv?.id;
      
      if (conversationId) {
        // Update cache so InboxPage can render immediately
        queryClient.setQueryData(messageKeys.conversations, (old) => {
          const newConv = formatConversation(rawConv, currentUser?.id);
          if (!old) return [newConv];
          if (old.some(c => c.id === conversationId)) return old;
          return [newConv, ...old];
        });
        // Invalidate just in case to ensure we have the absolute latest list
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
        
        setSelectedId(conversationId);
        navigate('/inbox');
      }
    } catch (error) {
      console.error('Failed to create/get conversation', error);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Cover */}
      <div className="profile-cover" />

      {/* Profile info */}
      <div className="profile-info-bar">
        <div className="profile-info-left">
          <div className="profile-avatar-wrap">
            <UserAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName || profile.username || 'A'}
              userId={profile.id}
              size="lg"
              className="profile-avatar"
            />
          </div>
          <div className="profile-info-text">
            <div className="profile-name-row">
              <h2>{profile.fullName || profile.username}</h2>
            </div>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio}</p>
          </div>
        </div>

        <div className="profile-info-right">
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{profile.postsCount}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatCount(profile.followersCount)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatCount(profile.followingCount)}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          
          {isOwnProfile ? (
            <button className="btn btn-secondary btn-sm edit-profile-btn" id="edit-profile-btn">
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : isFollowing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={handleToggleFollow}
                disabled={followLoading}
              >
                <UserMinus size={14} /> Unfollow
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleMessage}
                disabled={messageLoading}
              >
                <MessageCircle size={14} /> Message
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-sm btn-primary" 
              onClick={handleToggleFollow}
              disabled={followLoading}
            >
              <UserPlus size={14} /> Follow
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'gallery' && (
        <>
          {/* View toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', padding: '0 1rem 0.5rem' }}>
            <button
              className={`btn btn-sm ${galleryView === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setGalleryView('grid')}
              title="Grid view"
              id="view-grid-btn"
            >
              <Grid size={14} />
            </button>
            <button
              className={`btn btn-sm ${galleryView === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setGalleryView('list')}
              title="List view"
              id="view-list-btn"
            >
              <List size={14} />
            </button>
          </div>

          {/* Grid view */}
          {galleryView === 'grid' && (
            <div className="profile-gallery animate-fade-in">
              {posts.length > 0 ? posts.map((post, index) => {
                const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                const mediaUrl = firstMedia?.mediaUrl?.startsWith('http')
                  ? firstMedia.mediaUrl
                  : firstMedia ? `http://localhost:5231${firstMedia.mediaUrl}` : null;

                return (
                  <div
                    key={post.id}
                    className={`gallery-item ${index % 3 === 0 ? 'gallery-item-large' : 'gallery-item-small'}`}
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {mediaUrl ? (
                      firstMedia.mediaType?.toLowerCase() === 'video' ? (
                        <video src={mediaUrl} />
                      ) : (
                        <img src={mediaUrl} alt="Post media" />
                      )
                    ) : (
                      <div style={{
                        background: 'linear-gradient(135deg, #1e1e2e, #2a2040)',
                        width: '100%', height: '100%',
                        padding: '1rem', color: 'var(--text-secondary)',
                        fontSize: '0.82rem', overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        lineHeight: 1.5,
                      }}>
                        {post.content}
                      </div>
                    )}
                    <div className="gallery-overlay">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} color="white" /> {post.likeCount ?? 0}
                        </span>
                        <span style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={14} color="white" /> {post.commentCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="profile-empty animate-fade-in" style={{ gridColumn: '1 / -1' }}>
                  <Grid size={40} color="var(--text-muted)" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}

          {/* List view — feed-style */}
          {galleryView === 'list' && (
            <div className="profile-posts-list animate-fade-in">
              {posts.length > 0 ? posts.map(post => {
                const mediaUrls = (post.media || []).map(m =>
                  m.mediaUrl?.startsWith('http') ? m.mediaUrl : `http://localhost:5231${m.mediaUrl}`
                );
                return (
                  <article key={post.id} className="post-card card" style={{ marginBottom: '1rem', cursor: 'default' }}>
                    {/* Post header */}
                    <div className="post-header">
                      <div className="post-author">
                        <UserAvatar
                          avatarUrl={profile.avatarUrl}
                          name={profile.fullName || profile.username || 'U'}
                          userId={profile.id}
                          size="md"
                        />
                        <div>
                          <p className="post-author-name">{profile.fullName || profile.username}</p>
                          <p className="post-time">@{profile.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="post-content" style={{ cursor: 'default' }}>
                      {(post.content || '').split(/(#\w+)/g).map((part, i) =>
                        part.startsWith('#')
                          ? <span key={i} className="post-hashtag">{part}</span>
                          : part
                      )}
                    </p>

                    {/* Media */}
                    {mediaUrls.length > 0 && (
                      <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '0.5rem' }}>
                        <img
                          src={mediaUrls[0]}
                          alt="Post"
                          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="post-actions">
                      <div className="post-actions-left">
                        <button className="action-btn" style={{ pointerEvents: 'none' }}>
                          <Heart size={18} fill="none" />
                          <span>{post.likeCount ?? 0}</span>
                        </button>
                        <button className="action-btn" onClick={() => navigate(`/post/${post.id}`)}>
                          <MessageCircle size={18} />
                          <span>{post.commentCount ?? 0}</span>
                        </button>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/post/${post.id}`)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        View post
                      </button>
                    </div>
                  </article>
                );
              }) : (
                <div className="profile-empty animate-fade-in">
                  <List size={40} color="var(--text-muted)" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'mentions' && (
        <div className="profile-empty animate-fade-in">
          <AtSign size={40} color="var(--text-muted)" />
          <p>No mentions yet</p>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="profile-empty animate-fade-in">
          <Bookmark size={40} color="var(--text-muted)" />
          <p>No saved posts</p>
        </div>
      )}
    </div>
  );
}
