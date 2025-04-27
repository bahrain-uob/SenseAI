
import React, { useState } from 'react';
import './Login.css';
import leftLogo from './assets/logo-left.png';
import rightLogo from './assets/logo-right.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { loginUser } from './cognitoAuth';
import { useNavigate } from "react-router-dom";

function Login({onLogin}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await loginUser(email, password);
      console.log('Login Success:', res);
      setSuccess('Login successful!'); 
      if (onLogin) onLogin(); //  redirect user
      navigate("/");
      
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-header">
        <div className="logo-container">
          <img src={leftLogo} alt="Bahrain Logo" height={50} />
          <img src={rightLogo} alt="Customs Logo" height={50} />
        </div>
        <div className="header-text">
          <div>KINGDOM OF BAHRAIN</div>
          <div>MINISTRY OF INTERIOR</div>
          <div>CUSTOMS AFFAIRS</div>
        </div>
      </div>

      <div className="title-container">
        <h1 className="senseai-title">SenseAI</h1>
        <p className="login-subtitle">Login</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Sign in to your account</h2>

        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div className="input-group">
          <FontAwesomeIcon icon={faLock} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Sign in</button>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
      </form>
    </div>
  );
}

export default Login;

