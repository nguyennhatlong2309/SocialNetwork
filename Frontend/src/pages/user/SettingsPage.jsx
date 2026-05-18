import { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Eye, Palette, Trash2,
  Camera, Check, ChevronRight, Shield, Globe,
  Moon, Sun, Smartphone, Mail, AlertCircle, Loader2,
  Monitor, Type, LayoutDashboard, Zap,
  PanelLeft, AlignJustify, Minus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../api/userApi';
import { getStoredAppearance, saveAppearance, applyAppearance } from '../../hooks/useAppearance';
import './SettingsPage.css';
import '../admin/AdminSettingsPage.css';

/* ── Sidebar sections ─────────────────────────────────────── */
const SECTIONS = [
  { id: 'profile',       icon: User,      label: 'Profile'        },
  { id: 'account',       icon: Lock,      label: 'Account'        },
  { id: 'privacy',       icon: Eye,       label: 'Privacy'        },
  { id: 'notifications', icon: Bell,      label: 'Notifications'  },
  { id: 'appearance',    icon: Palette,   label: 'Appearance'     },
  { id: 'danger',        icon: Trash2,    label: 'Danger Zone'    },
];

/* ── Toggle switch ────────────────────────────────────────── */
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

/* ── Setting Row ──────────────────────────────────────────── */
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

/* ── Section wrapper ──────────────────────────────────────── */
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
export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [active, setActive] = useState('profile');
  const [saved, setSaved] = useState(false);

  /* Profile state */
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || 'Your Name');
  const [bio, setBio]       = useState('Building cool things ✨');
  const [website, setWebsite] = useState('');

  /* Account state */
  const [email, setEmail]   = useState(user?.email || 'user@example.com');
  const [emailStatus, setEmailStatus] = useState(''); // 'saving', 'saved', 'error'
  const [emailErrorMsg, setEmailErrorMsg] = useState('');
  
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState('');
  const [pwErrorMsg, setPwErrorMsg] = useState('');

  /* Privacy state */
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowDMs, setAllowDMs]             = useState(true);
  const [showActivity, setShowActivity]     = useState(true);
  const [indexable, setIndexable]           = useState(true);

  /* Notification state */
  const [emailNotif, setEmailNotif]     = useState(true);
  const [pushNotif, setPushNotif]       = useState(true);
  const [likesNotif, setLikesNotif]     = useState(true);
  const [commentsNotif, setCommentsNotif] = useState(true);
  const [followsNotif, setFollowsNotif] = useState(true);
  const [mentionsNotif, setMentionsNotif] = useState(true);

  /* Appearance state */
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

  const handleSaveAppearance = () => {
    saveAppearance({
      theme, accentColor, density, sidebarStyle,
      reducedMotion, highContrast, colorBlindMode, fontSize
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
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
    <div className="settings-page" id="settings-page">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="st-page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and privacy</p>
      </div>

      <div className="st-layout">

        {/* ── Left nav ──────────────────────────────────────── */}
        <nav className="st-nav">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`st-nav-item ${active === id ? 'active' : ''} ${id === 'danger' ? 'danger' : ''}`}
              onClick={() => setActive(id)}
            >
              <Icon size={16} />
              {label}
              <ChevronRight size={14} className="st-nav-arrow" />
            </button>
          ))}
        </nav>

        {/* ── Right panel ───────────────────────────────────── */}
        <div className="st-panel">

          {/* ── PROFILE ──────────────────────────────────────── */}
          {active === 'profile' && (
            <>
              <SectionCard title="Profile Information" description="Update your public profile details">
                {/* Avatar */}
                <div className="st-avatar-row">
                  <div className="st-avatar-wrap">
                    <div className="st-avatar-placeholder">
                      {(displayName[0] || 'U').toUpperCase()}
                    </div>
                    <button className="st-avatar-edit" title="Change avatar">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="st-avatar-info">
                    <p>Profile Photo</p>
                    <span>JPG, PNG or GIF · Max 5 MB</span>
                    <div className="st-avatar-btns">
                      <button className="btn btn-secondary btn-sm">Upload Photo</button>
                      <button className="btn btn-ghost btn-sm">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="st-divider" />

                <SettingRow label="Display Name" sub="Your name shown publicly">
                  <input
                    className="input-field st-input"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                  />
                </SettingRow>

                <SettingRow label="Username" sub="@handle used to mention you">
                  <div className="st-input-prefix-wrap">
                    <span className="st-input-prefix">@</span>
                    <input
                      className="input-field st-input st-input-prefix"
                      defaultValue={user?.username || 'username'}
                      placeholder="username"
                    />
                  </div>
                </SettingRow>

                <SettingRow label="Bio" sub="Short description (max 160 chars)">
                  <textarea
                    className="input-field st-textarea"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={3}
                    maxLength={160}
                    placeholder="Tell people about yourself…"
                  />
                </SettingRow>

                <SettingRow label="Website" sub="Your personal or portfolio URL">
                  <div className="st-input-prefix-wrap">
                    <Globe size={14} className="st-input-icon" />
                    <input
                      className="input-field st-input st-input-icon-pad"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
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
              <SectionCard title="Email Address" description="Update the email linked to your account">
                <SettingRow label="Email Address">
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

              <SectionCard title="Change Password" description="Use a strong password you don't use elsewhere">
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

              <SectionCard title="Active Sessions" description="Devices currently signed in to your account">
                <div className="st-session-list">
                  {[
                    { device: 'Chrome on Windows', location: 'Ho Chi Minh City, VN', current: true  },
                    { device: 'Mobile App — iOS',  location: 'Ho Chi Minh City, VN', current: false },
                  ].map((s, i) => (
                    <div key={i} className="st-session-item">
                      <Smartphone size={16} className="st-session-icon" />
                      <div className="st-session-info">
                        <p>{s.device} {s.current && <span className="st-current-tag">Current</span>}</p>
                        <span>{s.location}</span>
                      </div>
                      {!s.current && (
                        <button className="st-revoke-btn">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ── PRIVACY ──────────────────────────────────────── */}
          {active === 'privacy' && (
            <>
              <SectionCard title="Account Privacy" description="Control who can see your content">
                <SettingRow label="Private Account" sub="Only approved followers can see your posts">
                  <Toggle id="private" checked={privateAccount} onChange={setPrivateAccount} />
                </SettingRow>
                <SettingRow label="Allow Direct Messages" sub="Let people send you messages">
                  <Toggle id="dms" checked={allowDMs} onChange={setAllowDMs} />
                </SettingRow>
                <SettingRow label="Show Activity Status" sub="Let others know when you're active">
                  <Toggle id="activity" checked={showActivity} onChange={setShowActivity} />
                </SettingRow>
                <SettingRow label="Search Engine Indexing" sub="Allow search engines to find your profile">
                  <Toggle id="indexable" checked={indexable} onChange={setIndexable} />
                </SettingRow>
              </SectionCard>

              <SectionCard title="Blocked Users" description="Accounts you have blocked">
                <div className="st-empty-state">
                  <Shield size={32} />
                  <p>No blocked users</p>
                  <span>Users you block won't be able to find or interact with you.</span>
                </div>
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
              <SectionCard title="Delivery Methods" description="How you receive notifications">
                <SettingRow label="Email Notifications" sub="Get notified via email">
                  <Toggle id="email-notif" checked={emailNotif} onChange={setEmailNotif} />
                </SettingRow>
                <SettingRow label="Push Notifications" sub="Browser and mobile push">
                  <Toggle id="push-notif" checked={pushNotif} onChange={setPushNotif} />
                </SettingRow>
              </SectionCard>

              <SectionCard title="Activity Alerts" description="Choose what you're notified about">
                <SettingRow label="Likes" sub="When someone likes your post">
                  <Toggle id="likes" checked={likesNotif} onChange={setLikesNotif} />
                </SettingRow>
                <SettingRow label="Comments" sub="When someone comments on your post">
                  <Toggle id="comments" checked={commentsNotif} onChange={setCommentsNotif} />
                </SettingRow>
                <SettingRow label="New Followers" sub="When someone follows you">
                  <Toggle id="follows" checked={followsNotif} onChange={setFollowsNotif} />
                </SettingRow>
                <SettingRow label="Mentions" sub="When you're mentioned in a post">
                  <Toggle id="mentions" checked={mentionsNotif} onChange={setMentionsNotif} />
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
              <SectionCard title="Theme" description="Choose the overall colour scheme of the application">
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
              <SectionCard title="Font Size" description="Controls base text size across the application">
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
              <SectionCard title="Sidebar Style" description="How the sidebar behaves by default">
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

          {/* ── DANGER ZONE ───────────────────────────────────── */}
          {active === 'danger' && (
            <SectionCard title="Danger Zone" description="Irreversible and destructive actions">
              <div className="st-danger-list">
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Deactivate Account</p>
                    <span>Temporarily hide your account. You can reactivate anytime.</span>
                  </div>
                  <button className="st-danger-btn warning">Deactivate</button>
                </div>
                <div className="st-danger-divider" />
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Download My Data</p>
                    <span>Export a copy of all your posts, messages, and account data.</span>
                  </div>
                  <button className="st-danger-btn neutral">Export Data</button>
                </div>
                <div className="st-danger-divider" />
                <div className="st-danger-item">
                  <div className="st-danger-info">
                    <p>Delete Account</p>
                    <span>Permanently delete your account and all associated data. This cannot be undone.</span>
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
