import React from 'react';

const Home = ({ currentUser }) => {
  return (
    <div className="container text-center mt-5">
      {currentUser ? (
        <>
          <h1>Welcome, {currentUser.username}!</h1>
          <p>
            You are logged in.{' '}
            <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          </p>
        </>
      ) : (
        <>
          <h1>Welcome to the Lookup Interface</h1>
          <p>Please log in or register to continue.</p>
          <a href="/login" className="btn btn-success">Log In</a>
          <a href="/register" className="btn btn-primary">Register</a>
        </>
      )}
    </div>
  );
};

export default Home;
