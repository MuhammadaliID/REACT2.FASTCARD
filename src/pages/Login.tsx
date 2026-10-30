import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { isAdmin, setToken } from "../auth/token";
import Icon from "../components/Icon";
import "./Login.css";

const SHOP_URL = (import.meta.env.VITE_SHOP_URL as string) || "http://localhost:5173";

function Login() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;
    setToken(token);
    window.history.replaceState({}, "", window.location.pathname);

    if (isAdmin()) {
      navigate("/dashboard", { replace: true });
    } else {
      window.location.assign(
        `${SHOP_URL}/login?token=${encodeURIComponent(token)}`
      );
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ UserName: userName, Password: password });
      const token = res.data.data;
      if (!token) {
        setError(res.data.errors.join(", ") || "Login failed");
        return;
      }
      setToken(token);

      if (!isAdmin()) {
        window.location.assign(
          `${SHOP_URL}/login?token=${encodeURIComponent(token)}`
        );
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = (err as { response?: { data?: { errors?: string[] } } })
        .response?.data;
      setError(data?.errors?.join(", ") || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-brand">
        <div className="brand-inner">
          <p className="brand-welcome">Welcome to admin panel</p>
          <div className="brand-logo">
            <svg width="52" height="40" viewBox="0 0 30 24" fill="none" aria-hidden="true">
              <path
                d="M1 2h4l3.2 12.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.6L25.5 7H7"
                stroke="#F7A614"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="20.5" r="2.2" fill="#4880FF" />
              <circle cx="21" cy="20.5" r="2.2" fill="#F7A614" />
              <path d="M14 4h8" stroke="#4880FF" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span>fastkart</span>
          </div>
          <span className="brand-underline" />
        </div>
      </aside>

      <main className="login-side">
        <form className="login-form" onSubmit={submit}>
          <h1>Log in</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {resetSent && (
            <div className="alert alert-info">
              Contact the system administrator to reset your password.
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="text"
              placeholder="Email"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="forgot-link"
            onClick={() => setResetSent(true)}
          >
            Forgot password?
          </button>

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Login;
