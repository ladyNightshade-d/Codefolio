import { useState } from 'react';
import { api } from './api';
import './login.css';

function AuthCodeMark() {
  return (
    <svg
      aria-hidden="true"
      className="login-form__mark-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.2 7.1 2.3 12l3.9 4.9" />
      <path d="M13.2 4.1 10 19.9" />
      <path d="m17.8 7.1 3.9 4.9-3.9 4.9" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="google-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.6 12.23c0-.7-.06-1.38-.19-2.04H12v3.86h5.39a4.6 4.6 0 0 1-2 3.01v2.5h3.23c1.9-1.75 2.98-4.33 2.98-7.33Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.75-5.58-4.1H3.09v2.57A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.42 13.92A5.98 5.98 0 0 1 6.1 12c0-.67.12-1.32.32-1.92V7.51H3.09A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.09 4.49l3.33-2.57Z"
        fill="#FBBC04"
      />
      <path
        d="M12 5.98c1.47 0 2.79.5 3.82 1.48l2.87-2.88C16.95 2.96 14.7 2 12 2a9.99 9.99 0 0 0-8.91 5.51l3.33 2.57c.78-2.36 2.98-4.1 5.58-4.1Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthPage({ title, showNotification, onAuthSuccess }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('email address');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setError('');

    const nextEmail = email.trim();
    if (!nextEmail) return;

    setIsLoading(true);
    try {
      const data = await api.sendCode(nextEmail);

      if (data.error) {
        setError(data.error);
        if (typeof showNotification === 'function') showNotification(data.error);
      } else {
        setSentTo(nextEmail);
        setStep('code');
        if (typeof showNotification === 'function') {
          showNotification(`Verification code sent to ${nextEmail}`);
        }
      }
    } catch (err) {
      setError('Connection failed');
      if (typeof showNotification === 'function') showNotification('Connection failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeSubmit(event) {
    event.preventDefault();
    setError('');

    if (!accessCode.trim()) return;

    setIsLoading(true);
    try {
      const data = await api.verifyCode(sentTo, accessCode);

      if (data.error) {
        setError(data.error);
        if (typeof showNotification === 'function') showNotification(data.error);
      } else {
        const user = data.user;
        const mappedUser = {
          ...user,
          accountEmail: user.email,
          image: user.avatar_url
        };
        onAuthSuccess(mappedUser);
        if (typeof showNotification === 'function') {
          showNotification('Successfully signed in');
        }
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      setError('Verification failed');
      if (typeof showNotification === 'function') showNotification('Verification failed');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  function handleEditEmail() {
    setStep('email');
    setAccessCode('');
  }

  return (
    <section className="login-page" aria-labelledby="auth-heading">
      <div className="login-page__panel">
        <div className="login-form">
          <div className="login-form__mark" aria-hidden="true">
            <AuthCodeMark />
          </div>

          <h1 className="login-form__title" id="auth-heading">
            {title}
          </h1>

          {step === 'email' ? (
            <div className="login-form__stack">
              <button className="login-form__social" type="button" onClick={handleGoogleLogin}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="login-form__divider" aria-hidden="true">
                <span className="login-form__divider-line" />
                <span className="login-form__divider-copy">or</span>
                <span className="login-form__divider-line" />
              </div>

              <form className="login-form__fields" onSubmit={handleEmailSubmit}>
                <label className="sr-only" htmlFor="auth-email">
                  Email address
                </label>
                <input
                  className="login-form__input"
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                />

                <button className="login-form__submit" type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </form>
            </div>
          ) : (
            <div className="login-form__code-step">
              <p className="login-form__message">
                We sent a temporary access code to{' '}
                <span className="login-form__message-accent">{sentTo}</span>
              </p>

              <button className="login-form__switch" type="button" onClick={handleEditEmail}>
                Not you?
              </button>

              <form className="login-form__fields login-form__fields--code" onSubmit={handleCodeSubmit}>
                <label className="sr-only" htmlFor="auth-code">
                  Access code
                </label>
                <input
                  className="login-form__input"
                  id="auth-code"
                  name="accessCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  disabled={isLoading}
                />

                <button className="login-form__submit" type="submit" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          <p className="login-form__legal">
            By clicking Continue, you agree to our <a href="/#/terms">Terms of Use</a> and{' '}
            <a href="/#/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>

      <div className="login-page__visual" aria-hidden="true">
        <img className="login-page__visual-image" src="/login.png" alt="" />
      </div>
    </section>
  );
}

export default AuthPage;

