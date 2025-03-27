// src/App.jsx
import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getUser } from './utilities/users-service';
import Navbar from './components/Navbar/Navbar';
import AuthPage from './components/AuthPage/AuthPage';
import UserLogOut from './components/UserLogOut/UserLogOut';
import HomePage from './components/HomePage/HomePage';
import CustomersList from './components/CustomersList/CustomersList';
import CustomerProjects from './components/CustomerProjects/CustomerProjects';
import EstimateSummaryPage from './components/EstimateSummary/EstimateSummary';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference for initial theme
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Effect to toggle dark mode class and persist to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="App">
      <div className="backgroundEffects"></div>
      {user ? (
        <>
          <Navbar user={user} setUser={setUser} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
          <main className="mainContent">
            <Routes>
              <Route path="/home/customer" element={<HomePage />} />
              <Route path="/home/customer/:id" element={<HomePage />} />
              <Route path="/home/edit/:id" element={<HomePage />} />
              <Route path="/home/customers" element={<CustomersList />} />
              <Route path="/home/customer-projects" element={<CustomerProjects />} />
              <Route path="/home/estimate/:id" element={<EstimateSummaryPage />} />
              <Route path="/home/new-customer-project" element={<HomePage />} />
              <Route path="/logout" element={<UserLogOut user={user} setUser={setUser} />} />
              <Route path="/" element={<Navigate to="/home/customers" />} />
            </Routes>
          </main>
        </>
      ) : (
        <AuthPage setUser={setUser} />
      )}
    </div>
  );
}