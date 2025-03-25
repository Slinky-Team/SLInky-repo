import React from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST", credentials: "include" });

      if (response.ok) {
        setCurrentUser(null); // Clear user state
        navigate("/"); // Redirect to home after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="container text-center mt-5">
      {currentUser ? (
        <>
          <h1>Welcome, {currentUser.username}!</h1>
          <p>
            You are logged in.
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary mx-2">
              Go to Dashboard
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </p>
        </>
      ) : (
        <>
          <h1>Welcome to the Lookup Interface</h1>
          <p>Please log in or register to continue.</p>
          <button onClick={() => navigate("/login")} className="btn btn-success mx-2">
            Log In
          </button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">
            Register
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
