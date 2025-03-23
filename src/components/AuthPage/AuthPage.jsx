import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import SignUpForm from '../SignUpForm/SignUpForm';
import LoginForm from '../LoginForm/LoginForm';

export default function AuthPage({ setUser }) {
  const [showLogin, setShowLogin] = useState(true);
  const [animate, setAnimate] = useState(false);

  const handleToggle = (isLogin) => {
    setAnimate(true);
    setTimeout(() => {
      setShowLogin(isLogin);
      setAnimate(false);
    }, 300);
  };

  return (
    <main className={styles.AuthPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Rawdah Remodeling</h1>
          <p className={styles.subtitle}>Professional Project Management</p>
        </div>

        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${showLogin ? styles.active : ''}`}
            onClick={() => handleToggle(true)}
          >
            <span>Login</span>
          </button>
          <button
            className={`${styles.toggleButton} ${!showLogin ? styles.active : ''}`}
            onClick={() => handleToggle(false)}
          >
            <span>Sign Up</span>
          </button>
        </div>

        <div className={`${styles.formWrapper} ${animate ? styles.animate : ''}`}>
          {showLogin ? (
            <LoginForm setUser={setUser} />
          ) : (
            <SignUpForm setUser={setUser} />
          )}
        </div>

        <div className={styles.footer}>
          <p>Protected by Quantum Encryption</p>
        </div>
      </div>
    </main>
  );
}
