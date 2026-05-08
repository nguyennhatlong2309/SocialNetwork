import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Grid, AtSign, Bookmark } from 'lucide-react';
import './UserProfilePage.css';

const PROFILE = {
  name: 'Alex Nova',
  username: '@alexnova_design',
  bio: 'Digital artist & UI architect. Exploring the intersection of glassmorphism and deep spatial design.',
  posts: 142,
  followers: 12400,
  following: 890,
  verified: true,
};

const GALLERY_ITEMS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', span: 'large' },
  { id: 2, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', span: 'small' },
  { id: 3, image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80', span: 'small' },
  { id: 4, image: 'https://images.unsplash.com/photo-1535223289429-462edb9df97d?w=400&q=80', span: 'full' },
];

const TABS = [
  { id: 'gallery', label: 'Gallery', icon: Grid },
  { id: 'mentions', label: 'Mentions', icon: AtSign },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <div className="profile-page">
      {/* Cover */}
      <div className="profile-cover" />

      {/* Profile info */}
      <div className="profile-info-bar">
        <div className="profile-info-left">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar avatar-placeholder"
              style={{ background: 'linear-gradient(135deg, #7c5cbf, #9b7fe8)', width: 80, height: 80, fontSize: 28 }}>
              A
            </div>
          </div>
          <div className="profile-info-text">
            <div className="profile-name-row">
              <h2>{PROFILE.name}</h2>
              {PROFILE.verified && <span className="verified-badge">✓</span>}
            </div>
            <p className="profile-username">{PROFILE.username}</p>
            <p className="profile-bio">{PROFILE.bio}</p>
          </div>
        </div>

        <div className="profile-info-right">
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{PROFILE.posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatCount(PROFILE.followers)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{PROFILE.following}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm edit-profile-btn" id="edit-profile-btn">
            <Edit3 size={14} /> Edit Profile
          </button>
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

      {/* Gallery */}
      {activeTab === 'gallery' && (
        <div className="profile-gallery animate-fade-in">
          {GALLERY_ITEMS.map(item => (
            <div
              key={item.id}
              className={`gallery-item gallery-item-${item.span}`}
              onClick={() => navigate(`/post/${item.id}`)}
            >
              <img src={item.image} alt="" />
              <div className="gallery-overlay">
                <Heart size={20} color="white" />
              </div>
            </div>
          ))}
        </div>
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

function Heart({ size, color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill={color} stroke={color} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
