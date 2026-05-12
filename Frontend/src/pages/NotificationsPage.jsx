import { useState } from 'react';
import { Heart, MessageSquare, UserPlus, AtSign, Bell, MessageCircle } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import './NotificationsPage.css';

// ─── Icon component map ───────────────────────────────────────────────────────
const ICON_MAP = {
  Heart,
  MessageSquare,
  UserPlus,
  AtSign,
  MessageCircle,
  Bell,
};

const TABS = ['All', 'Mentions', 'Follows'];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All');

  // ─── Data từ API thật ──────────────────────────────────────────────────
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // ─── Filter theo tab ───────────────────────────────────────────────────
  const filtered = activeTab === 'All'
    ? notifications
    : activeTab === 'Mentions'
      ? notifications.filter(n => n.type === 'mention' || n.type === 'comment')
      : notifications.filter(n => n.type === 'follow');

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotifClick = (notif) => {
    if (notif.unread) {
      markAsReadMutation.mutate(notif.id);
    }
    // TODO: navigate đến post/profile tương ứng dựa vào notif.type + notif.referenceId
  };

  // ─── Loading / Error states ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>
        <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Failed to load notifications. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button
          className="mark-read-btn"
          onClick={handleMarkAllRead}
          disabled={markAllAsReadMutation.isPending}
          id="mark-all-read-btn"
        >
          {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
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
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem 0', textAlign: 'center' }}>
            No notifications here yet.
          </p>
        )}

        {filtered.map(notif => {
          // Lấy icon component từ iconName string
          const IconComponent = ICON_MAP[notif.iconName] ?? Bell;

          return (
            <div
              key={notif.id}
              className={`notif-item ${notif.unread ? 'unread' : ''}`}
              id={`notif-${notif.id}`}
              onClick={() => handleNotifClick(notif)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notif-avatar-wrap">
                <div
                  className="avatar-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${notif.actorColor}, ${notif.actorColor}88)`,
                    width: 44, height: 44, fontSize: 17,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {(notif.actor || '?')[0].toUpperCase()}
                </div>
                <div className="notif-type-icon" style={{ background: notif.iconColor + '22', color: notif.iconColor }}>
                  <IconComponent size={12} />
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
                {notif.showFollowBack && (
                  <button
                    className="btn btn-secondary btn-sm"
                    id={`follow-back-${notif.id}`}
                    onClick={e => e.stopPropagation()} // không trigger notif click
                  >
                    Follow Back
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
