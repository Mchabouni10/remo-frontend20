// src/App.jsx
import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getUser } from './utilities/users-service';
import Navbar from './components/Navbar/Navbar';
import AuthPage from './components/AuthPage/AuthPage';
import UserLogOut from './components/UserLogOut/UserLogOut';
import HomePage from './components/HomePage/HomePage';
import CustomersList from './components/CustomersList/CustomersList';
import EstimateSummaryPage from './components/EstimateSummary/EstimateSummary';

export default function App() {
  const [user, setUser] = useState(getUser());

  return (
    <div className="App">
      <div className="backgroundEffects"></div>
      {user ? (
        <>
          <Navbar user={user} setUser={setUser} />
          <main className="mainContent">
            <Routes>
              <Route path="/home/customer" element={<HomePage />} />
              <Route path="/home/customer/:id" element={<HomePage />} />
              <Route path="/home/edit/:id" element={<HomePage />} />
              <Route path="/home/customers" element={<CustomersList />} />
              <Route path="/home/estimate/:id" element={<EstimateSummaryPage />} />
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