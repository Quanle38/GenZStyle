import { useState } from "react";
import "../assets/css/login.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: typeof errors = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Fake success
      setSuccess(true);
      console.log("Login success:", formData);
    }
  };

  return (
    <div className="retro-background">
      <div className="y2k-grid">
        <div className="grid-dots"></div>
        <div className="scanner-lines">
          <div className="scan-line scan-1"></div>
          <div className="scan-line scan-2"></div>
          <div className="scan-line scan-3"></div>
        </div>
      </div>

      <div className="floating-orbs">
        <div className="retro-orb orb-1"></div>
        <div className="retro-orb orb-2"></div>
        <div className="retro-orb orb-3"></div>
      </div>

      <div className="login-container">
        <div className="future-card">
          <div className="chrome-header">
            {/* Logo */}
            <div className="retro-logo">
              <div className="logo-chrome">
                <div className="chrome-inner">
                  {/* SVG giữ nguyên */}
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="16" stroke="url(#retroGradient)" strokeWidth="2"/>
                    <circle cx="18" cy="18" r="10" fill="url(#chromeGradient)"/>
                    <circle cx="18" cy="18" r="6" fill="url(#centerGradient)"/>
                    <defs>
                      <linearGradient id="retroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff00ff"/>
                        <stop offset="50%" stopColor="#00ffff"/>
                        <stop offset="100%" stopColor="#ffff00"/>
                      </linearGradient>
                      <radialGradient id="chromeGradient">
                        <stop offset="0%" stopColor="#e6e6fa"/>
                        <stop offset="100%" stopColor="#c0c0ff"/>
                      </radialGradient>
                      <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#ffffff"/>
                        <stop offset="100%" stopColor="#f0f0ff"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <div className="chrome-glow"></div>
              </div>
            </div>

            <h1 className="y2k-title">
              <span className="title-chrome">FUTURE</span>
              <span className="title-neon">NET</span>
            </h1>
            <p className="retro-subtitle">Access the Digital Millennium</p>
          </div>

          {/* FORM */}
          {!success ? (
            <form className="future-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="retro-field">
                <div className="field-chrome">
                  <div className="chrome-border"></div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                  <div className="field-hologram"></div>
                </div>
                {errors.email && <span className="retro-error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="retro-field">
                <div className="field-chrome">
                  <div className="chrome-border"></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Access Code</label>
                  <button
                    type="button"
                    className="retro-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    <div className="toggle-chrome">
                      {/* Show/Hide icons */}
                      {!showPassword ? (
                        <svg className="eye-future" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 3C6 3 2.5 6.5 1 10c1.5 3.5 5 7 9 7s7.5-3.5 9-7c-1.5-3.5-5-7-9-7z"
                            stroke="url(#eyeGradient)" strokeWidth="1.5" fill="none"/>
                          <circle cx="10" cy="10" r="3" stroke="url(#eyeGradient)" strokeWidth="1.5" fill="none"/>
                          <defs>
                            <linearGradient id="eyeGradient">
                              <stop offset="0%" stopColor="#00ffff"/>
                              <stop offset="100%" stopColor="#ff00ff"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      ) : (
                        <svg className="eye-hidden" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7"
                            stroke="url(#eyeHiddenGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="eyeHiddenGradient">
                              <stop offset="0%" stopColor="#ff00ff"/>
                              <stop offset="100%" stopColor="#ffff00"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>
                  </button>
                  <div className="field-hologram"></div>
                </div>
                {errors.password && <span className="retro-error">{errors.password}</span>}
              </div>

              {/* Options */}
              <div className="future-options">
                <label className="retro-checkbox">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="checkbox-chrome">
                    <div className="check-frame"></div>
                    <svg className="check-hologram" width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5l3 3 7-7" stroke="url(#checkGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="checkGradient">
                          <stop offset="0%" stopColor="#00ffff"/>
                          <stop offset="100%" stopColor="#ff00ff"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  <span className="checkbox-text">Remember Session</span>
                </label>
                <a href="#" className="future-link">Recover Access</a>
              </div>

              {/* Submit */}
              <button type="submit" className="retro-button">
                <div className="button-chrome"></div>
                <span className="button-text">ENTER THE FUTURE</span>
                <div className="button-loader">
                  <div className="y2k-spinner">
                    <div className="spinner-ring ring-1"></div>
                    <div className="spinner-ring ring-2"></div>
                    <div className="spinner-ring ring-3"></div>
                  </div>
                </div>
                <div className="button-hologram"></div>
              </button>
            </form>
          ) : (
            <div className="retro-success">
              <div className="success-portal">
                <div className="portal-rings">
                  <div className="portal-ring ring-1"></div>
                  <div className="portal-ring ring-2"></div>
                  <div className="portal-ring ring-3"></div>
                  <div className="portal-ring ring-4"></div>
                </div>
                <div className="success-core">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 16l6 6 12-12" stroke="url(#successGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="successGradient">
                        <stop offset="0%" stopColor="#00ffff"/>
                        <stop offset="50%" stopColor="#ff00ff"/>
                        <stop offset="100%" stopColor="#ffff00"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="success-title">WELCOME TO THE FUTURE</h3>
              <p className="success-desc">Initializing digital interface...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
