import { useState } from 'react';
import { Heart, MessageSquare, UserPlus, AtSign } from 'lucide-react';
import './NotificationsPage.css';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    icon: Heart,
    iconColor: '#e05c6e',
    actor: 'Elena Rostova',
    actorColor: '#e05c8e',
    action: 'liked your post',
    timeAgo: '2m ago',
    preview: '"The neon lights in Neo-Tokyo are absolutely breathtaking tonight. Can\'t wait to share the full gallery! 🌆✨"',
    unread: true,
  },
  {
    id: 2,
    type: 'comment',
    icon: MessageSquare,
    iconColor: '#5c9cbf',
    actor: 'Marcus Chen',
    actorColor: '#5c9cbf',
    action: 'commented on your photo',
    timeAgo: '1h ago',
    preview: '"Incredible composition here. What lens did you use for this shot?"',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=80&q=80',
    unread: false,
  },
  {
    id: 3,
    type: 'follow',
    icon: UserPlus,
    iconColor: '#7c5cbf',
    actor: 'Sarah Jenkins',
    actorColor: '#bf5c7c',
    action: 'started following you',
    timeAgo: '3h ago',
    unread: false,
    showFollowBack: true,
  },
  {
    id: 4,
    type: 'mention',
    icon: AtSign,
    iconColor: '#bf7c5c',
    actor: 'Alex River',
    actorColor: '#7cbf5c',
    action: 'mentioned you in a comment',
    timeAgo: 'Yesterday',
    preview: '"@AuraSocial check out this design setup, reminds me of your recent post!"',
    unread: false,
  },
];

const TABS = ['All', 'Mentions', 'Follows'];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const filtered = activeTab === 'All'
    ? notifications
    : activeTab === 'Mentions'
      ? notifications.filter(n => n.type === 'mention' || n.type === 'comment')
      : notifications.filter(n => n.type === 'follow');

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button className="mark-read-btn" onClick={markAllRead} id="mark-all-read-btn">
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="notifications-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`notif-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`notif-tab-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="notifications-list">
        {filtered.map(notif => (
          <div
            key={notif.id}
            className={`notif-item ${notif.unread ? 'unread' : ''}`}
            id={`notif-${notif.id}`}
          >
            <div className="notif-avatar-wrap">
              <div
                className="avatar-placeholder"
                style={{
                  background: `linear-gradient(135deg, ${notif.actorColor}, ${notif.actorColor}88)`,
                  width: 44, height: 44, fontSize: 17,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, flexShrink: 0
                }}
              >
                {notif.actor[0]}
              </div>
              <div className="notif-type-icon" style={{ background: notif.iconColor + '22', color: notif.iconColor }}>
                <notif.icon size={12} />
              </div>
            </div>

            <div className="notif-content">
              <p className="notif-text">
                <strong>{notif.actor}</strong> {notif.action}
              </p>
              <p className="notif-time">{notif.timeAgo}</p>
              {notif.preview && (
                <p className="notif-preview">{notif.preview}</p>
              )}
            </div>

            <div className="notif-right">
              {notif.unread && <span className="unread-indicator" />}
              {notif.image && (
                <img src={notif.image} alt="" className="notif-image" />
              )}
              {notif.showFollowBack && (
                <button className="btn btn-secondary btn-sm" id={`follow-back-${notif.id}`}>
                  Follow Back
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
