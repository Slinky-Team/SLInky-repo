import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="home-container">
      <div className="home-card">
        {currentUser ? (
          <>
          
          </>
        ) : (
          <>
            <div className="home-header">
              <h1>Welcome to the Security Lookup Interface</h1>
              <p>Please log in or register to continue.</p>
            </div>
            <div className="home-buttons">
              <button onClick={() => navigate("/login")} className="btn btn-success">
                Log In
              </button>
              <button onClick={() => navigate("/register")} className="btn btn-primary">
                Register
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
