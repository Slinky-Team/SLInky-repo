import React, { useState } from 'react';

const Register = ({ form, errors, currentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ color: '#4A90E2' }}>
          Create Your Account
        </h2>
        <p className="text-center mb-4" style={{ color: '#7A7A7A' }}>
          Fill in the details to register.
        </p>

        {/* Display validation errors */}
        {errors && errors.map((error, index) => (
          <div className="alert alert-danger" key={index}>{error}</div>
        ))}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control border-primary"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control border-primary"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-control border-primary"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2">
            Register
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <a href="/login" className="text-primary">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
