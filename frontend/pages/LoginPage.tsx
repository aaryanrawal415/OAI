import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { isValidEmail } from "../lib/validate";

export function LoginPage() {
  usePageTitle("Sign in");
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (password.length === 0) next.password = "Enter your password.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card stack-lg">
        <div className="stack">
          <span className="eyebrow">OptiFreight AI</span>
          <h1>Sign in</h1>
          <p className="muted">Find compatible extra cargo along the route you are already driving.</p>
        </div>
        {api.mode === "mock" && (
          <p className="banner banner--demo">
            Demonstration mode: accounts are kept in this browser only and are not real security.
          </p>
        )}
        <form className="stack" onSubmit={submit} noValidate>
          <TextField label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" autoComplete="current-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="small">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
