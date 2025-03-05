import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/dashboard", { withCredentials: true })
      .then(response => setMessage(response.data.message))
      .catch(() => navigate("/"));
  }, [navigate]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{message}</p>
      <button onClick={() => axios.post("http://127.0.0.1:5000/api/logout").then(() => navigate("/"))}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
