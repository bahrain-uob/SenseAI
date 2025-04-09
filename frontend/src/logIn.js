import React from 'react';
import './Login.css';
import leftLogo from './assets/logo-left.png';
import rightLogo from './assets/logo-right.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-header">
        <img src={leftLogo} alt="Bahrain Logo" className="logo" />
        <div className="header-text">
          <div>KINGDOM OF BAHRAIN</div>
          <div>MINISTRY OF INTERIOR</div>
          <div>CUSTOMS AFFAIRS</div>
        </div>
        <img src={rightLogo} alt="Customs Logo" className="logo" />
      </div>

      <div className="title-container">
        <h1 className="senseai-title">SenseAI</h1>
        <p className="login-subtitle">Login</p>
      </div>

      <form className="login-form">
        <h2>Sign in to your account</h2>

        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input type="email" placeholder="Email address" />
        </div>

        <div className="input-group">
          <FontAwesomeIcon icon={faLock} />
          <input type="password" placeholder="Password" />
        </div>

        <div className="login-extra">
          <a href="/">Forget password?</a>
        </div>

        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

export default Login;
