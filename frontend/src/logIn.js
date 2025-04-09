import React from 'react';
import './Login.css';
import logo from './assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

function Login() {
  return (
    <div className="login-wrapper">
      {/* Background section */}
      <div className="login-background"></div>

      {/* Overlay section */}
      <div className="login-overlay">
        <div className="login-content">
          {/* Logo */}
          <img src={logo} alt="Customs Logo" className="login-logo" />

          {/* Title */}
          <h1 className="login-title">SenseAI</h1>

          {/* Form */}
          <form className="login-form">
            <div className="input-group">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="email" placeholder="Email" />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" placeholder="Password" />
            </div>

            <div className="login-extra">
              <a href="/">Forget password ?</a>
            </div>

            <button type="submit">Enter</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
