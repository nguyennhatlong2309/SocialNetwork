import { useNavigate } from 'react-router-dom';
import { Activity, Sparkles, Layers, ArrowRight } from 'lucide-react';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-page">
      {/* Background glow */}
      <div className="onboarding-bg-glow" />
      <div className="onboarding-bg-glow-2" />

      <div className="onboarding-content animate-fade-in">
        {/* Logo */}
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon">
            <Activity size={32} color="white" />
          </div>
          <h1 className="onboarding-title">
            Aura<span className="text-accent">Social</span>
          </h1>
          <p className="onboarding-subtitle">Premium Social Experience</p>
        </div>

        {/* Features */}
        <div className="onboarding-features card">
          <div className="feature-item">
            <div className="feature-icon">
              <Sparkles size={18} />
            </div>
            <div className="feature-text">
              <h3>Connect through Auras</h3>
              <p>Experience a new depth of digital interaction. Discover communities that resonate with your unique energy frequency.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon" style={{ background: 'rgba(124,92,191,0.3)' }}>
              <Layers size={18} />
            </div>
            <div className="feature-text">
              <h3>Immersive Depth</h3>
              <p>A fluid, glassmorphic interface designed to let the content breathe and your connections shine.</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="onboarding-actions">
          <button
            className="btn btn-primary btn-full btn-lg"
            id="get-started-btn"
            onClick={() => navigate('/register')}
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-secondary btn-full btn-lg"
            id="already-have-account-btn"
            onClick={() => navigate('/login')}
          >
            I already have an account
          </button>
        </div>

        <p className="onboarding-terms">
          By continuing, you agree to our <span className="text-accent">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
