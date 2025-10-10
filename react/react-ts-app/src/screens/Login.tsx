import React, { useState, useEffect } from 'react';
import { clientLogin } from '../services/loginService';
import { setAuthUserData } from '../utils/helper';
import '../styles/login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // ✅ Disable scroll when Login page mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // reset when leaving login page
    };
  }, []);

  const validate = () => {
    const e: any = {};
    if (!username) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const record: any = await clientLogin({ username, password });
      if (record?.data?.userData && (record.data.userData.roleSlug === 'admin' || record.data.userData.roleSlug === 'client')) {
        if (setAuthUserData(record.data)) {
          window.location.href = '/dashboard';
        }
      } else {
        window.alert('Un-Authorized User');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="screen">
        <div className="screen__content">
          <div className="login-header">
            <img src="/assets/img/brand/logo.png" className="brand-logo" alt="logo" />
          </div>

          <form className="login" onSubmit={onSubmit}>
            <div className="login__field">
              <i className="login__icon fa fa-user" />
              <input
                type="text"
                className="login__input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && <div className="text-danger">{errors.username}</div>}
            </div>

            <div className="login__field">
              <i className="login__icon fa fa-lock" />
              <input
                type="password"
                className="login__input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="text-danger">{errors.password}</div>}
            </div>

            <button className="button login__submit" disabled={loading}>
              <span className="button__text">{loading ? 'Logging...' : 'LOG IN'}</span>
              <i className="button__icon fa fa-chevron-right" />
            </button>
          </form>
        </div>

        <div className="screen__background">
          <span className="screen__background__shape screen__background__shape3" />
          <span className="screen__background__shape screen__background__shape2" />
          <span className="screen__background__shape screen__background__shape1" />
        </div>
      </div>

     <footer className="footer">
  <div className="copyright text-muted">
    &copy; <span className="year">{new Date().getFullYear()}</span>{' '}
    <a
      href="https://mobocheck.com"
      target="_blank"
      rel="noreferrer"
      className="brand"
    >
      MoboCheck
    </a>
  </div>
</footer>

    </div>
  );
};

export default Login;
