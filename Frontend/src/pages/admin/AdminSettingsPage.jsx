import { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Eye, Palette, Trash2,
  Camera, Check, ChevronRight, Shield, Globe,
  Moon, Sun, Smartphone, Mail,
  Server, AlertTriangle, AlertCircle, Loader2,
  Monitor, Type, LayoutDashboard, Zap, Contrast,
  PanelLeft, AlignJustify, Minus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../api/userApi';
import { getStoredAppearance, saveAppearance, applyAppearance } from '../../hooks/useAppearance';
/* Reuse SettingsPage.css from user (shared styles) */
import '../user/SettingsPage.css';
import './AdminSettingsPage.css';

/* ── Sidebar sections ─────────────────────────────────────── */
const SECTIONS = [
  { id: 'profile',       icon: User,          label: 'Profile'          },
  { id: 'account',       icon: Lock,          label: 'Account'          },
  { id: 'privacy',       icon: Eye,           label: 'Privacy'          },
  { id: 'notifications', icon: Bell,          label: 'Notifications'    },
  { id: 'appearance',    icon: Palette,       label: 'Appearance'       },
  { id: 'system',        icon: Server,        label: 'System Settings'  },
  { id: 'security',      icon: Shield,        label: 'Security'         },
  { id: 'danger',        icon: Trash2,        label: 'Danger Zone'      },
];

function Toggle({ checked, onChange, id }) {
  return (
    <label className="st-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="st-toggle-track">
        <span className="st-toggle-thumb" />
      </span>
    </label>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div className="st-row">
      <div className="st-row-info">
        <span className="st-row-label">{label}</span>
        {sub && <span className="st-row-sub">{sub}</span>}
      </div>
      <div className="st-row-control">{children}</div>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="st-section-card">
      <div className="st-section-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="st-section-body">{children}</div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();
  const [active, setActive] = useState('profile');
  const [saved, setSaved] = useState(false);

  /* Profile */
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || 'Admin User');
  const [bio, setBio]   = useState('Platform administrator');
  const [website, setWebsite] = useState('');

  /* Account */
  const [email, setEmail] = useState(user?.email || 'admin@aura.social');
  const [emailStatus, setEmailStatus] = useState('');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState('');
  const [pwErrorMsg, setPwErrorMsg] = useState('');

  /* Privacy */
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowDMs, setAllowDMs] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  /* Notifications */
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif]   = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  /* Appearance */
  const [appearanceLoaded] = useState(() => getStoredAppearance());
  const [theme, setTheme]             = useState(appearanceLoaded.theme);
  const [accentColor, setAccentColor] = useState(appearanceLoaded.accentColor);
  const [density, setDensity]         = useState(appearanceLoaded.density);
  const [sidebarStyle, setSidebarStyle] = useState(appearanceLoaded.sidebarStyle);
  const [reducedMotion, setReducedMotion] = useState(appearanceLoaded.reducedMotion);
  const [highContrast, setHighContrast]   = useState(appearanceLoaded.highContrast);
  const [colorBlindMode, setColorBlindMode] = useState(appearanceLoaded.colorBlindMode);
  const [fontSize, setFontSize]       = useState(appearanceLoaded.fontSize);

  useEffect(() => {
    if (active === 'appearance') {
       applyAppearance({
         theme, accentColor, density, sidebarStyle,
         reducedMotion, highContrast, colorBlindMode, fontSize
       });
    } else {
       applyAppearance(getStoredAppearance());
    }
    return () => applyAppearance(getStoredAppearance());
  }, [theme, accentColor, density, sidebarStyle, reducedMotion, highContrast, colorBlindMode, fontSize, active]);

  /* System Settings */
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [postApproval, setPostApproval]         = useState(false);
  const [autoModeration, setAutoModeration]     = useState(true);
  const [maxPostLength, setMaxPostLength]       = useState('2000');
  const [maxFileSize, setMaxFileSize]           = useState('10');

  /* Security */
  const [twoFactor, setTwoFactor]         = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [ipLogging, setIpLogging]         = useState(true);
  const [auditLog, setAuditLog]           = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAppearance = () => {
    saveAppearance({
      theme, accentColor, density, sidebarStyle,
      reducedMotion, highContrast, colorBlindMode, fontSize
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateEmail = async () => {
    if (!email || email === user?.email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailErrorMsg('Invalid email format');
      return;
    }
    
    setEmailErrorMsg('');
    setEmailStatus('saving');
    try {
      await userApi.updateEmail(email);
      updateUser({ email });
      setEmailStatus('saved');
      setTimeout(() => setEmailStatus(''), 2500);
    } catch (err) {
      setEmailErrorMsg(err.response?.data?.message || err.message || 'Failed to update email');
      setEmailStatus('error');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwErrorMsg('Please fill in all password fields');
      return;
    }
    if (newPw !== confirmPw) {
      setPwErrorMsg('Passwords do not match');
      return;
    }
    
    const strongPwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&._-]{8,}$/;
    if (!strongPwRegex.test(newPw)) {
      setPwErrorMsg('Password must be 8+ chars with uppercase, lowercase & number');
      return;
    }

    setPwErrorMsg('');
    setPwStatus('saving');
    try {
      await userApi.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwStatus('saved');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwStatus(''), 2500);
    } catch (err) {
      setPwErrorMsg(err.response?.data?.message || err.message || 'Failed to update password');
      setPwStatus('error');
    }
  };

  return (
    <div className="settings-page admin-settings-page" id="admin-settings-page">

      {/* Header */}
      <div className="st-page-header">
        <h1>Admin Settings</h1>
        <p>Manage your account preferences and system configuration</p>
      </div>

      <div className="st-layout">

        {/* Left Nav */}
        <nav className="st-nav">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`st-nav-item ${active === id ? 'active' : ''} ${id === 'danger' ? 'danger' : ''} ${['system','security'].includes(id) ? 'admin-only' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={16} />
              {label}
              {['system','security'].includes(id) && (
                <span className="st-admin-tag">Admin</span>
              )}
              <ChevronRight size={14} className="st-nav-arrow" />
            </button>
          ))}
        </nav>

        {/* Right Panel */}
        <div className="st-panel">

          {/* ── PROFILE ──────────────────────────────────────── */}
          {active === 'profile' && (
            <>
              <SectionCard title="Profile Information" description="Your admin profile details">
                <div className="st-avatar-row">
                  <div className="st-avatar-wrap">
                    <div className="st-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #7c5cbf, #f0a05a)' }}>
                      {(displayName[0] || 'A').toUpperCase()}
                    </div>
                    <button className="st-avatar-edit"><Camera size={14} /></button>
                  </div>
                  <div className="st-avatar-info">
                    <p>Admin Avatar</p>
                    <span>JPG, PNG or GIF · Max 5 MB</span>
                    <div className="st-avatar-btns">
                      <button className="btn btn-secondary btn-sm">Upload Photo</button>
                      <button className="btn btn-ghost btn-sm">Remove</button>
                    </div>
                  </div>
                </div>
                <div className="st-divider" />
                <SettingRow label="Display Name">
                  <input className="input-field st-input" value={displayName}
                    onChange={e => setDisplayName(e.target.value)} />
                </SettingRow>
                <SettingRow label="Bio">
                  <textarea className="input-field st-textarea" value={bio}
                    onChange={e => setBio(e.target.value)} rows={2} />
                </SettingRow>
                <SettingRow label="Website">
                  <div className="st-input-prefix-wrap">
                    <Globe size={14} className="st-input-icon" />
                    <input className="input-field st-input st-input-icon-pad" value={website}
                      onChange={e => setWebsite(e.target.value)} placeholder="https://" />
                  </div>
                </SettingRow>
              </SectionCard>
              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {/* ── ACCOUNT ──────────────────────────────────────── */}
          {active === 'account' && (
            <>
              <SectionCard title="Email Address">
                <SettingRow label="Admin Email">
                  <div className="st-input-prefix-wrap">
                    <Mail size={14} className="st-input-icon" />
                    <input className="input-field st-input st-input-icon-pad" value={email}
                      onChange={e => {setEmail(e.target.value); setEmailErrorMsg('');}} />
                  </div>
                </SettingRow>
                {emailErrorMsg && (
                  <p className="st-error-msg" style={{ marginTop: '8px' }}><AlertCircle size={14}/> {emailErrorMsg}</p>
                )}
                <div className="st-save-row" style={{ marginTop: 0 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleUpdateEmail} disabled={emailStatus === 'saving' || email === user?.email}>
                    {emailStatus === 'saving' ? <><Loader2 size={14} className="spin" /> Updating...</> : 
                     emailStatus === 'saved' ? <><Check size={14}/> Saved!</> : 'Update Email'}
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Change Password">
                <SettingRow label="Current Password">
                  <input type="password" className="input-field st-input" value={currentPw}
                    onChange={e => {setCurrentPw(e.target.value); setPwErrorMsg('');}} placeholder="••••••••" />
                </SettingRow>
                <SettingRow label="New Password">
                  <input type="password" className="input-field st-input" value={newPw}
                    onChange={e => {setNewPw(e.target.value); setPwErrorMsg('');}} placeholder="••••••••" />
                </SettingRow>
                <SettingRow label="Confirm New Password">
                  <input type="password" className="input-field st-input" value={confirmPw}
                    onChange={e => {setConfirmPw(e.target.value); setPwErrorMsg('');}} placeholder="••••••••" />
                </SettingRow>
                {pwErrorMsg && (
                  <p className="st-error-msg"><AlertCircle size={14}/> {pwErrorMsg}</p>
                )}
                <div className="st-save-row" style={{ marginTop: 0 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleUpdatePassword} disabled={pwStatus === 'saving'}>
                    {pwStatus === 'saving' ? <><Loader2 size={14} className="spin" /> Updating...</> : 
                     pwStatus === 'saved' ? <><Check size={14}/> Password Updated!</> : 'Update Password'}
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="Active Sessions">
                <div className="st-session-list">
                  {[
                    { device: 'Chrome on Windows', location: 'Ho Chi Minh City, VN', current: true },
                    { device: 'Admin CLI Tool',     location: 'Server — 192.168.1.x',  current: false },
                  ].map((s, i) => (
                    <div key={i} className="st-session-item">
                      <Smartphone size={16} className="st-session-icon" />
                      <div className="st-session-info">
                        <p>{s.device} {s.current && <span className="st-current-tag">Current</span>}</p>
                        <span>{s.location}</span>
                      </div>
                      {!s.current && <button className="st-revoke-btn">Revoke</button>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ── PRIVACY ──────────────────────────────────────── */}
          {active === 'privacy' && (
            <>
              <SectionCard title="Account Privacy">
                <SettingRow label="Private Account" sub="Only approved followers can see your posts">
                  <Toggle id="adm-private" checked={privateAccount} onChange={setPrivateAccount} />
                </SettingRow>
                <SettingRow label="Allow Direct Messages">
                  <Toggle id="adm-dms" checked={allowDMs} onChange={setAllowDMs} />
                </SettingRow>
                <SettingRow label="Show Activity Status">
                  <Toggle id="adm-activity" checked={showActivity} onChange={setShowActivity} />
                </SettingRow>
              </SectionCard>
              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={15}/> Saved!</> : 'Save Privacy Settings'}
                </button>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ─────────────────────────────────── */}
          {active === 'notifications' && (
            <>
              <SectionCard title="Delivery Methods">
                <SettingRow label="Email Notifications">
                  <Toggle id="adm-email-n" checked={emailNotif} onChange={setEmailNotif} />
                </SettingRow>
                <SettingRow label="Push Notifications">
                  <Toggle id="adm-push-n" checked={pushNotif} onChange={setPushNotif} />
                </SettingRow>
              </SectionCard>
              <SectionCard title="Admin Alerts" description="Platform-level alerts sent only to admins">
                <SettingRow label="Content Report Alerts" sub="Notify when new reports come in">
                  <Toggle id="adm-reports" checked={reportAlerts} onChange={setReportAlerts} />
                </SettingRow>
                <SettingRow label="System Status Alerts" sub="Notify on server errors or downtime">
                  <Toggle id="adm-sys" checked={systemAlerts} onChange={setSystemAlerts} />
                </SettingRow>
              </SectionCard>
              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={15}/> Saved!</> : 'Save Notification Settings'}
                </button>
              </div>
            </>
          )}

          {/* ── APPEARANCE ────────────────────────────────────── */}
          {active === 'appearance' && (
            <>
              {/* ── Theme ── */}
              <SectionCard title="Theme" description="Choose the overall colour scheme of the admin panel">
                <div className="st-theme-grid">
                  {[
                    { id: 'dark',   icon: Moon,    label: 'Dark',   sub: 'Easy on the eyes',    preview: 'ap-prev-dark'   },
                    { id: 'light',  icon: Sun,     label: 'Light',  sub: 'Classic bright look',  preview: 'ap-prev-light'  },
                    { id: 'system', icon: Monitor, label: 'System', sub: 'Follow OS preference', preview: 'ap-prev-system' },
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`st-theme-card ap-theme-card ${theme === t.id ? 'active' : ''}`}
                      onClick={() => setTheme(t.id)}
                    >
                      {/* Mini UI preview */}
                      <div className={`ap-theme-preview ${t.preview}`}>
                        <div className="ap-prev-sidebar" />
                        <div className="ap-prev-main">
                          <div className="ap-prev-bar" />
                          <div className="ap-prev-card" />
                          <div className="ap-prev-card" />
                        </div>
                      </div>
                      <div className="ap-theme-label">
                        <t.icon size={14} />
                        <span>{t.label}</span>
                      </div>
                      <span className="st-theme-sub">{t.sub}</span>
                      {theme === t.id && (
                        <span className="ap-theme-badge"><Check size={10} /> Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* ── Accent Color ── */}
              <SectionCard title="Accent Color" description="Primary highlight colour used throughout the interface">
                <div className="ap-accent-section">
                  <div className="ap-accent-swatches">
                    {[
                      { color: '#7c5cbf', name: 'Violet'  },
                      { color: '#4f8ef7', name: 'Blue'    },
                      { color: '#2dd4bf', name: 'Teal'    },
                      { color: '#f0a05a', name: 'Amber'   },
                      { color: '#e05c6e', name: 'Rose'    },
                      { color: '#4caf7d', name: 'Emerald' },
                      { color: '#ec6f9a', name: 'Pink'    },
                      { color: '#9b59b6', name: 'Grape'   },
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        className={`ap-swatch ${accentColor === color ? 'active' : ''}`}
                        style={{ '--sw': color }}
                        title={name}
                        onClick={() => setAccentColor(color)}
                      >
                        {accentColor === color && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                  <div className="ap-accent-custom">
                    <span className="ap-accent-label">Custom</span>
                    <input
                      type="color"
                      className="ap-color-input"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                    />
                    <span className="ap-accent-hex">{accentColor.toUpperCase()}</span>
                  </div>
                  <div className="ap-accent-preview">
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Preview:</span>
                    <button className="ap-accent-demo-btn" style={{ background: accentColor }}>
                      Sample Button
                    </button>
                    <span className="ap-accent-demo-badge" style={{ color: accentColor, borderColor: accentColor }}>Badge</span>
                  </div>
                </div>
              </SectionCard>

              {/* ── Font Size ── */}
              <SectionCard title="Font Size" description="Controls base text size across the admin panel">
                <div className="st-font-options">
                  {[
                    { id: 'small',  label: 'Small',  px: '13px', desc: '13 px' },
                    { id: 'medium', label: 'Medium', px: '15px', desc: '15 px (default)' },
                    { id: 'large',  label: 'Large',  px: '17px', desc: '17 px' },
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`st-font-btn ap-font-btn ${fontSize === f.id ? 'active' : ''}`}
                      onClick={() => setFontSize(f.id)}
                    >
                      <span className={`st-font-preview st-font-${f.id}`}>Aa</span>
                      <span className="ap-font-label">{f.label}</span>
                      <span className="ap-font-desc">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* ── Layout Density ── */}
              <SectionCard title="Layout Density" description="Controls spacing and compactness of UI elements">
                <div className="ap-density-grid">
                  {[
                    { id: 'compact',     icon: Minus,           label: 'Compact',     sub: 'More info, less space'    },
                    { id: 'comfortable', icon: AlignJustify,    label: 'Comfortable', sub: 'Balanced (default)'      },
                    { id: 'spacious',    icon: LayoutDashboard, label: 'Spacious',    sub: 'Relaxed, easy to scan'   },
                  ].map(d => (
                    <button
                      key={d.id}
                      className={`ap-density-card ${density === d.id ? 'active' : ''}`}
                      onClick={() => setDensity(d.id)}
                    >
                      <d.icon size={18} className="ap-density-icon" />
                      <span className="ap-density-label">{d.label}</span>
                      <span className="ap-density-sub">{d.sub}</span>
                      {density === d.id && <Check size={12} className="ap-density-check" />}
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* ── Sidebar Style ── */}
              <SectionCard title="Sidebar Style" description="How the admin sidebar behaves by default">
                <div className="ap-sidebar-options">
                  {[
                    { id: 'fixed',     icon: PanelLeft, label: 'Always Visible',  sub: 'Sidebar pinned open at all times'   },
                    { id: 'collapsed', icon: Type,      label: 'Icons Only',       sub: 'Collapse to icon rail on load'      },
                    { id: 'hidden',    icon: Zap,       label: 'Auto-Hide',        sub: 'Appear on hover / keyboard shortcut' },
                  ].map(s => (
                    <label key={s.id} className={`ap-sidebar-option ${sidebarStyle === s.id ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="sidebar-style"
                        value={s.id}
                        checked={sidebarStyle === s.id}
                        onChange={() => setSidebarStyle(s.id)}
                      />
                      <s.icon size={18} className="ap-sidebar-icon" />
                      <div className="ap-sidebar-text">
                        <span>{s.label}</span>
                        <span className="ap-sidebar-sub">{s.sub}</span>
                      </div>
                      {sidebarStyle === s.id && <Check size={14} className="ap-sidebar-check" />}
                    </label>
                  ))}
                </div>
              </SectionCard>

              {/* ── Accessibility ── */}
              <SectionCard title="Accessibility" description="Improve readability and reduce visual strain">
                <SettingRow label="Reduce Motion" sub="Minimise animations and transitions across the UI">
                  <Toggle id="adm-motion" checked={reducedMotion} onChange={setReducedMotion} />
                </SettingRow>
                <SettingRow label="High Contrast" sub="Increase contrast ratios for better readability">
                  <Toggle id="adm-contrast" checked={highContrast} onChange={setHighContrast} />
                </SettingRow>
                <SettingRow label="Colour Blind Mode" sub="Adjust colour palette for colour vision deficiencies">
                  <select
                    className="input-field st-input"
                    style={{ maxWidth: 180 }}
                    value={colorBlindMode}
                    onChange={e => setColorBlindMode(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="deuteranopia">Deuteranopia (red-green)</option>
                    <option value="protanopia">Protanopia (red)</option>
                    <option value="tritanopia">Tritanopia (blue-yellow)</option>
                    <option value="achromatopsia">Achromatopsia (monochrome)</option>
                  </select>
                </SettingRow>
              </SectionCard>

              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSaveAppearance}>
                  {saved ? <><Check size={15}/> Saved!</> : 'Save Appearance'}
                </button>
              </div>
            </>
          )}

          {/* ── SYSTEM SETTINGS (Admin only) ──────────────────── */}
          {active === 'system' && (
            <>
              {/* System status */}
              <SectionCard title="System Status" description="Live platform health overview">
                <div className="st-system-status">
                  {[
                    { label: 'Database',        status: 'ok',   val: 'Connected — 4ms latency' },
                    { label: 'Media Storage',   status: 'ok',   val: '68% used (34 GB / 50 GB)' },
                    { label: 'Email Service',   status: 'ok',   val: 'Operational' },
                    { label: 'Push Notifications', status: 'warn', val: 'Minor delays (retry queue)' },
                    { label: 'Cache (Redis)',    status: 'ok',   val: 'Hit rate 94.2%' },
                  ].map(item => (
                    <div key={item.label} className="st-status-row">
                      <span className="st-status-label">{item.label}</span>
                      <span className={`st-status-val st-status-${item.status}`}>
                        <span className={`st-status-dot ${item.status}`} />
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Platform config */}
              <SectionCard title="Platform Configuration" description="Global platform settings affecting all users">
                <SettingRow label="Maintenance Mode" sub="Show maintenance page to all non-admin users">
                  <Toggle id="sys-maintenance" checked={maintenanceMode} onChange={setMaintenanceMode} />
                </SettingRow>
                <SettingRow label="Open Registration" sub="Allow new users to register">
                  <Toggle id="sys-registration" checked={registrationOpen} onChange={setRegistrationOpen} />
                </SettingRow>
                <SettingRow label="Post Approval Required" sub="All new posts require admin approval before publishing">
                  <Toggle id="sys-approval" checked={postApproval} onChange={setPostApproval} />
                </SettingRow>
                <SettingRow label="Auto-Moderation (AI)" sub="Automatically flag suspicious content for review">
                  <Toggle id="sys-automod" checked={autoModeration} onChange={setAutoModeration} />
                </SettingRow>
              </SectionCard>

              {/* Limits */}
              <SectionCard title="Content Limits">
                <SettingRow label="Max Post Length (chars)" sub="Maximum characters per post">
                  <input className="input-field st-input" style={{ maxWidth: 120 }}
                    type="number" value={maxPostLength}
                    onChange={e => setMaxPostLength(e.target.value)} min="100" max="10000" />
                </SettingRow>
                <SettingRow label="Max File Upload Size (MB)" sub="Maximum size per uploaded file">
                  <input className="input-field st-input" style={{ maxWidth: 120 }}
                    type="number" value={maxFileSize}
                    onChange={e => setMaxFileSize(e.target.value)} min="1" max="100" />
                </SettingRow>
              </SectionCard>

              {maintenanceMode && (
                <div className="adm-sys-warning">
                  <AlertTriangle size={16} />
                  Maintenance mode is ON — all non-admin users will see a maintenance page.
                </div>
              )}

              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={15}/> Saved!</> : 'Save System Settings'}
                </button>
              </div>
            </>
          )}

          {/* ── SECURITY (Admin only) ─────────────────────────── */}
          {active === 'security' && (
            <>
              <SectionCard title="Admin Authentication" description="Extra security for your admin account">
                <SettingRow label="Two-Factor Authentication" sub="Require 2FA on every admin login">
                  <Toggle id="sec-2fa" checked={twoFactor} onChange={setTwoFactor} />
                </SettingRow>
                <SettingRow label="Session Timeout (hours)" sub="Auto-logout after inactivity">
                  <select
                    className="input-field st-input"
                    style={{ maxWidth: 140 }}
                    value={sessionTimeout}
                    onChange={e => setSessionTimeout(e.target.value)}
                  >
                    {['1','4','8','12','24','48'].map(v => (
                      <option key={v} value={v}>{v} hour{v !== '1' ? 's' : ''}</option>
                    ))}
                  </select>
                </SettingRow>
              </SectionCard>

              <SectionCard title="Audit & Logging" description="Track admin actions for compliance">
                <SettingRow label="IP Address Logging" sub="Record IP of all admin actions">
                  <Toggle id="sec-ip" checked={ipLogging} onChange={setIpLogging} />
                </SettingRow>
                <SettingRow label="Audit Log" sub="Keep a detailed log of all admin actions">
                  <Toggle id="sec-audit" checked={auditLog} onChange={setAuditLog} />
                </SettingRow>
              </SectionCard>

              <SectionCard title="Recent Admin Actions" description="Last 5 actions in the audit log">
                <div className="st-audit-list">
                  {[
                    { action: 'Banned user @crypto_moon_boy',   time: '2 min ago',  ip: '113.22.x.x'  },
                    { action: 'Removed post #8821',             time: '15 min ago', ip: '113.22.x.x'  },
                    { action: 'Updated system settings',        time: '2h ago',     ip: '113.22.x.x'  },
                    { action: 'Dismissed report #4491',         time: '3h ago',     ip: '113.22.x.x'  },
                    { action: 'Promoted @dev_sarah to Creator', time: '5h ago',     ip: '113.22.x.x'  },
                  ].map((log, i) => (
                    <div key={i} className="st-audit-row">
                      <span className="st-audit-action">{log.action}</span>
                      <span className="st-audit-meta">{log.time} · {log.ip}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div className="st-save-row">
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? <><Check size={15}/> Saved!</> : 'Save Security Settings'}
                </button>
              </div>
            </>
          )}

          {/* ── DANGER ZONE ───────────────────────────────────── */}
          {active === 'danger' && (
            <SectionCard title="Danger Zone" description="Irreversible and destructive actions">
              <div className="st-danger-list">
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Export Platform Data</p>
                    <span>Download a full backup of all platform data including users, posts, and settings.</span>
                  </div>
                  <button className="st-danger-btn neutral">Export</button>
                </div>
                <div className="st-danger-divider" />
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Clear All Caches</p>
                    <span>Force-flush all Redis caches. This may temporarily slow down the platform.</span>
                  </div>
                  <button className="st-danger-btn warning">Clear Caches</button>
                </div>
                <div className="st-danger-divider" />
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Delete Admin Account</p>
                    <span>Permanently remove this admin account. Ensure another admin exists before proceeding.</span>
                  </div>
                  <button className="st-danger-btn danger">Delete Account</button>
                </div>
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}
