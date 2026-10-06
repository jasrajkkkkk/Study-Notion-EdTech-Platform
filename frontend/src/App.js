import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InstructorDashboard from "./pages/instructor/Dashboard";
import CourseForm from "./pages/instructor/CourseForm";
import StudentDashboard from "./pages/student/Dashboard";
import CourseDetail from "./pages/student/CourseDetail";
import Checkout from "./pages/student/Checkout";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "INSTRUCTOR" ? "/instructor" : "/student"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/instructor" element={
            <ProtectedRoute role="INSTRUCTOR"><InstructorDashboard /></ProtectedRoute>
          } />
          <Route path="/instructor/courses/new" element={
            <ProtectedRoute role="INSTRUCTOR"><CourseForm /></ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id" element={
            <ProtectedRoute role="INSTRUCTOR"><CourseForm /></ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/courses/:id" element={
            <ProtectedRoute role="STUDENT"><CourseDetail /></ProtectedRoute>
          } />
          <Route path="/student/checkout/:courseId" element={
            <ProtectedRoute role="STUDENT"><Checkout /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
