import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { RegistrationAccountType } from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { isValidEmail, passwordProblem } from "../lib/validate";

export function RegisterPage() {
  usePageTitle("Create account");
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [accountType, setAccountType] = useState<RegistrationAccountType>("client");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; organizationName?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    const pw = passwordProblem(password);
    if (pw) next.password = pw;
    if (accountType === "organization_owner" && organizationName.trim().length < 2) {
      next.organizationName = "Enter your organization name.";
    }
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      await register(name, email, password, accountType, organizationName.trim() || undefined);
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card stack-lg">
        <div className="stack">
          <span className="eyebrow">OptiFreight AI</span>
          <h1>Create your account</h1>
        </div>
        {api.mode === "mock" && (
          <p className="banner banner--demo">
            Demonstration mode: this account is kept in this browser only. Do not reuse a real password.
          </p>
        )}
        <form className="stack" onSubmit={submit} noValidate>
          <TextField label="Your name" autoComplete="name" value={name} error={errors.name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
          <label className="field">
            <span className="field__label">Account type</span>
            <select className="field__control" value={accountType} onChange={(e) => setAccountType(e.target.value as RegistrationAccountType)}>
              <option value="client">Client</option>
              <option value="organization_owner">Owner</option>
              <option value="driver">Container driver</option>
            </select>
            <span className="field__hint">Owner accounts manage an organization and its drivers.</span>
          </label>
          {accountType === "organization_owner" && (
            <TextField
              label="Organization name"
              value={organizationName}
              error={errors.organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          )}
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="small">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
