import { useState, useEffect } from 'react';
import {
  Users, FileText, ShieldAlert, TrendingUp,
  Activity, ArrowUpRight, ArrowDownRight, Eye,
  UserCheck, UserX, Flag, CheckCircle
} from 'lucide-react';
import './AdminDashboardPage.css';

/* ── Mock Data ─────────────────────────────────────────────── */
const STATS = [
  {
    id: 'users',
    label: 'Total Users',
    value: '12,847',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: '#7c5cbf',
  },
  {
    id: 'posts',
    label: 'Active Posts',
    value: '48,293',
    change: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: '#4caf7d',
  },
  {
    id: 'reports',
    label: 'Reports Pending',
    value: '3',
    change: '-40%',
    trend: 'down',
    icon: ShieldAlert,
    color: '#e05c6e',
  },
  {
    id: 'new_today',
    label: 'New Today',
    value: '142',
    change: '+5.1%',
    trend: 'up',
    icon: TrendingUp,
    color: '#f0a05a',
  },
];

const ACTIVITY_LOG = [
  { id: 1, type: 'user_ban',    icon: UserX,       text: 'User @toxic_guy123 has been banned',         time: '2 min ago',  color: '#e05c6e' },
  { id: 2, type: 'post_remove', icon: Flag,        text: 'Reported post #8821 removed by admin',        time: '15 min ago', color: '#f0a05a' },
  { id: 3, type: 'user_verify', icon: UserCheck,   text: 'User @sarah_dev verified as Creator',         time: '1h ago',     color: '#4caf7d' },
  { id: 4, type: 'report_ok',   icon: CheckCircle, text: 'Report #4491 reviewed — no action needed',    time: '2h ago',     color: '#7c5cbf' },
  { id: 5, type: 'user_ban',    icon: UserX,       text: 'User @spammer_bot banned (auto-detected)',     time: '3h ago',     color: '#e05c6e' },
  { id: 6, type: 'post_remove', icon: Flag,        text: 'Inappropriate image in post #7732 removed',   time: '5h ago',     color: '#f0a05a' },
];

const TOP_USERS = [
  { id: 1, username: 'aurora_designer', avatar: null, posts: 342, followers: '12.4K', status: 'active',  role: 'Creator' },
  { id: 2, username: 'tech_wizard_99',  avatar: null, posts: 289, followers: '8.1K',  status: 'active',  role: 'Member'  },
  { id: 3, username: 'dev_sarah',       avatar: null, posts: 201, followers: '6.7K',  status: 'active',  role: 'Creator' },
  { id: 4, username: 'night_coder',     avatar: null, posts: 187, followers: '4.2K',  status: 'active',  role: 'Member'  },
  { id: 5, username: 'pixel_artistry',  avatar: null, posts: 165, followers: '3.9K',  status: 'banned',  role: 'Member'  },
];

const CHART_DATA = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 82 },
  { day: 'Wed', value: 74 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 112 },
  { day: 'Sun', value: 142 },
];

const maxBar = Math.max(...CHART_DATA.map(d => d.value));

/* ── Helper ─────────────────────────────────────────────────── */
function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

/* ── Component ──────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="admin-dashboard" id="admin-dashboard">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Admin Dashboard</h1>
          <p className="adm-subtitle">{dateStr}</p>
        </div>
        <div className="adm-clock">
          <Activity size={14} />
          {timeStr}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="adm-stats-grid">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          return (
            <div key={stat.id} className="adm-stat-card">
              <div className="adm-stat-top">
                <span className="adm-stat-label">{stat.label}</span>
                <div className="adm-stat-icon" style={{ background: `${stat.color}22`, color: stat.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="adm-stat-value">{stat.value}</div>
              <div className={`adm-stat-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {stat.change} vs last week
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Row ────────────────────────────────────────── */}
      <div className="adm-bottom-grid">

        {/* Chart */}
        <div className="adm-card adm-chart-card">
          <div className="adm-card-header">
            <h3>New Registrations</h3>
            <span className="adm-card-subtitle">Last 7 days</span>
          </div>
          <div className="adm-bar-chart">
            {CHART_DATA.map((d) => (
              <div key={d.day} className="adm-bar-group">
                <div className="adm-bar-wrap">
                  <div
                    className="adm-bar"
                    style={{ height: `${(d.value / maxBar) * 100}%` }}
                    title={`${d.value} users`}
                  />
                </div>
                <span className="adm-bar-label">{d.day}</span>
                <span className="adm-bar-value">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="adm-card adm-activity-card">
          <div className="adm-card-header">
            <h3>Recent Activity</h3>
            <span className="adm-card-subtitle">Admin actions</span>
          </div>
          <div className="adm-activity-list">
            {ACTIVITY_LOG.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="adm-activity-item">
                  <div className="adm-activity-icon" style={{ background: `${item.color}22`, color: item.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="adm-activity-content">
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Users Table ───────────────────────────────────── */}
      <div className="adm-card adm-table-card">
        <div className="adm-card-header">
          <h3>Top Active Users</h3>
          <button className="adm-view-all-btn">
            <Eye size={13} /> View All
          </button>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Posts</th>
              <th>Followers</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {TOP_USERS.map((user, idx) => (
              <tr key={user.id}>
                <td className="adm-table-rank">{idx + 1}</td>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar-sm">
                      {getInitials(user.username)}
                    </div>
                    <span>@{user.username}</span>
                  </div>
                </td>
                <td>{user.posts}</td>
                <td>{user.followers}</td>
                <td>
                  <span className={`adm-role-badge adm-role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`adm-status-badge adm-status-${user.status}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
