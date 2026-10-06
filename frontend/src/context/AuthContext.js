import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, username, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.user_id, username: decoded.username, role: decoded.role });
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const decoded = jwtDecode(data.access);
    const loggedInUser = { id: decoded.user_id, username: decoded.username, role: decoded.role };
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (username, email, password, role) => {
    await api.post("/auth/register/", { username, email, password, role });
    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
