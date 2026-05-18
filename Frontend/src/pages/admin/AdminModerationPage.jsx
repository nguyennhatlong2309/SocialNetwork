import { useState } from 'react';
import {
  ShieldAlert, CheckCircle, XCircle, Eye,
  Flag, MessageSquare, FileText, Clock, User
} from 'lucide-react';
import './AdminModerationPage.css';

/* ── Mock Data ─────────────────────────────────────────────── */
const MOCK_REPORTS = [
  {
    id: 1, status: 'pending', type: 'post',
    reason: 'Spam / Advertisement',
    content: 'Buy crypto now! 1000x gains guaranteed! Click link in bio 🚀🚀🚀 #crypto #moon',
    reporter: 'dev_sarah', reported: 'crypto_moon_boy',
    time: '10 min ago', priority: 'high',
  },
  {
    id: 2, status: 'pending', type: 'comment',
    reason: 'Hate Speech',
    content: 'This comment contains offensive language targeting a specific group of people.',
    reporter: 'aurora_designer', reported: 'toxic_guy123',
    time: '32 min ago', priority: 'high',
  },
  {
    id: 3, status: 'pending', type: 'post',
    reason: 'Misinformation',
    content: 'BREAKING: Scientists confirm the Earth is flat and NASA has been lying for decades!',
    reporter: 'tech_wizard_99', reported: 'conspiracy_acc',
    time: '1h ago', priority: 'medium',
  },
  {
    id: 4, status: 'approved', type: 'post',
    reason: 'Nudity / Sexual Content',
    content: '[Content removed by admin — violated community guidelines §3.2]',
    reporter: 'night_coder', reported: 'pixel_artistry',
    time: '3h ago', priority: 'high',
  },
  {
    id: 5, status: 'approved', type: 'comment',
    reason: 'Harassment',
    content: 'User was sending repeated threatening messages to multiple accounts.',
    reporter: 'designer_kai', reported: 'bad_actor_77',
    time: '5h ago', priority: 'medium',
  },
  {
    id: 6, status: 'rejected', type: 'post',
    reason: 'Copyright Infringement',
    content: 'Post reviewed — content is original and does not violate copyright policy.',
    reporter: 'foodie_nguyen', reported: 'lazy_sunday',
    time: '1d ago', priority: 'low',
  },
  {
    id: 7, status: 'rejected', type: 'comment',
    reason: 'Spam / Advertisement',
    content: 'Report investigated — comment was a genuine recommendation, not spam.',
    reporter: 'anon_user', reported: 'dev_sarah',
    time: '2d ago', priority: 'low',
  },
];

const TABS = ['Pending', 'Approved', 'Rejected'];

const PRIORITY_COLOR = {
  high:   { bg: 'rgba(224,92,110,0.15)',  color: '#e05c6e' },
  medium: { bg: 'rgba(240,160,90,0.15)',  color: '#f0a05a' },
  low:    { bg: 'rgba(76,175,125,0.15)',  color: '#4caf7d' },
};

function TypeIcon({ type }) {
  return type === 'post'
    ? <FileText size={14} />
    : <MessageSquare size={14} />;
}

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

/* ── Main Component ─────────────────────────────────────────── */
export default function AdminModerationPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [activeTab, setActiveTab] = useState('Pending');
  const [expanded, setExpanded] = useState(null);

  const filtered = reports.filter(r => r.status === activeTab.toLowerCase());

  const handleApprove = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    setExpanded(null);
  };

  const handleReject = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    setExpanded(null);
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="mod-page" id="admin-moderation">

      {/* Header */}
      <div className="mod-header">
        <div>
          <h1 className="adm-title">Moderation Queue</h1>
          <p className="adm-subtitle">
            Review and act on reported content
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="mod-pending-badge">
            <ShieldAlert size={15} />
            {pendingCount} reports need attention
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mod-tabs">
        {TABS.map(tab => {
          const count = reports.filter(r => r.status === tab.toLowerCase()).length;
          return (
            <button
              key={tab}
              className={`mod-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className={`mod-tab-count ${tab === 'Pending' && count > 0 ? 'alert' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="mod-cards">
        {filtered.length === 0 ? (
          <div className="mod-empty">
            <CheckCircle size={40} className="mod-empty-icon" />
            <p>No {activeTab.toLowerCase()} reports</p>
            <span>Everything is up to date!</span>
          </div>
        ) : filtered.map(report => {
          const isExpanded = expanded === report.id;
          const prio = PRIORITY_COLOR[report.priority];

          return (
            <div
              key={report.id}
              className={`mod-card ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Card Header */}
              <div className="mod-card-top">
                <div className="mod-card-left">
                  {/* Type badge */}
                  <span className="mod-type-badge">
                    <TypeIcon type={report.type} />
                    {report.type}
                  </span>
                  {/* Priority */}
                  <span
                    className="mod-priority-badge"
                    style={{ background: prio.bg, color: prio.color }}
                  >
                    {report.priority}
                  </span>
                  {/* Reason */}
                  <span className="mod-reason">
                    <Flag size={12} />
                    {report.reason}
                  </span>
                </div>
                <div className="mod-card-right">
                  <span className="mod-time">
                    <Clock size={12} /> {report.time}
                  </span>
                  <button
                    className="um-btn-icon"
                    title="Toggle details"
                    onClick={() => setExpanded(isExpanded ? null : report.id)}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {/* Users row */}
              <div className="mod-users-row">
                <div className="mod-user-chip">
                  <User size={12} />
                  <div className="adm-avatar-sm" style={{ width: 20, height: 20, fontSize: 8 }}>
                    {getInitials(report.reporter)}
                  </div>
                  <span>Reporter: <strong>@{report.reporter}</strong></span>
                </div>
                <div className="mod-arrow">→</div>
                <div className="mod-user-chip reported">
                  <div className="adm-avatar-sm" style={{ width: 20, height: 20, fontSize: 8, background: 'rgba(224,92,110,0.3)' }}>
                    {getInitials(report.reported)}
                  </div>
                  <span>Reported: <strong>@{report.reported}</strong></span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mod-content-box">
                  <p className="mod-content-label">Reported Content:</p>
                  <p className="mod-content-text">"{report.content}"</p>
                </div>
              )}

              {/* Actions (only for pending) */}
              {report.status === 'pending' && (
                <div className="mod-actions">
                  <button
                    className="mod-action-btn approve"
                    onClick={() => handleApprove(report.id)}
                  >
                    <CheckCircle size={14} />
                    Remove Content
                  </button>
                  <button
                    className="mod-action-btn reject"
                    onClick={() => handleReject(report.id)}
                  >
                    <XCircle size={14} />
                    Dismiss Report
                  </button>
                </div>
              )}

              {/* Status tag for resolved */}
              {report.status === 'approved' && (
                <div className="mod-resolved-tag approved">
                  <CheckCircle size={13} /> Content removed
                </div>
              )}
              {report.status === 'rejected' && (
                <div className="mod-resolved-tag rejected">
                  <XCircle size={13} /> Report dismissed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
