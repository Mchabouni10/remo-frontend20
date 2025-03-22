// src/App.jsx
import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getUser } from './utilities/users-service';
import Navbar from './components/Navbar/Navbar';
import AuthPage from './components/AuthPage/AuthPage';
import UserLogOut from './components/UserLogOut/UserLogOut';
import HomePage from './components/HomePage/HomePage';
import CustomersList from './components/CustomersList/CustomersList';

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
              <Route path="/home/customer" element={<HomePage />} /> {/* New project */}
              <Route path="/home/customer/:id" element={<HomePage />} /> {/* Details view */}
              <Route path="/home/edit/:id" element={<HomePage />} /> {/* Edit project */}
              <Route path="/home/customers" element={<CustomersList />} />
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