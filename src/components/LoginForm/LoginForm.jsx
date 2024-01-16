// LoginForm.jsx

import React, { useState } from "react";
import { login } from '../../utilities/users-service';

const LoginForm = ({ setUser }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (evt) => {
    setCredentials({
      ...credentials,
      [evt.target.name]: evt.target.value,
    });
    setError("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const user = await login(credentials);
      setUser(user); // Assuming login function returns user data
    } catch {
      setError("Login Failed - Try Again");
    }
  };

  return (
    <div>
      <div className="form-container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="example@mail.com" // Placeholder text
            required
          />
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="********" // Placeholder text with stars
              required
            />
            <div style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', color: 'gray' }}>
              {/* Add any icon or text you want to use for password visibility */}
              &#9679;&#9679;&#9679;&#9679;
            </div>
          </div>
          <button type="submit">LOG IN</button>
        </form>
      </div>
      <p className="error-message">&nbsp;{error}</p>
    </div>
  );
};

export default LoginForm;


