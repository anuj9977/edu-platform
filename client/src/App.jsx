import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionStoreProvider } from './context/SessionStore';
import Layout from './components/Layout';
import { PageLoader } from './components/ui';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Parents from './pages/admin/Parents';
import Classes from './pages/admin/Classes';
import Subjects from './pages/admin/Subjects';
import Assignments from './pages/admin/Assignments';
import Exams from './pages/admin/Exams';
import Marks from './pages/admin/Marks';
import Results from './pages/admin/Results';
import Attendance from './pages/admin/Attendance';
import Fees from './pages/admin/Fees';
import Announcements from './pages/admin/Announcements';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAnnouncements from './pages/student/StudentAnnouncements';

// Parent
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentFees from './pages/parent/ParentFees';
import ParentAnnouncements from './pages/parent/ParentAnnouncements';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function RoleGuard({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <Outlet />;
}

function HomePage() {
  const { user } = useAuth();
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return (
    <>
      <NoSidebar />
      <LandingPage />
    </>
  );
}

function NoSidebar() {
  useEffect(() => {
    document.body.classList.add('no-sidebar');
    return () => document.body.classList.remove('no-sidebar');
  }, []);
  return null;
}

function NotFound() {
  const { user } = useAuth();
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <h2 style={{ marginTop: 8 }}>Page not found</h2>
          <p className="text-muted">The page you are looking for doesn't exist.</p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => window.location.assign(user ? `/${user.role}` : '/login')}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionStoreProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  <NoSidebar />
                  <LoginPage />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <NoSidebar />
                  <RegisterPage />
                </>
              }
            />

            <Route
              path="/"
              element={<HomePage />}
            />

            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/notifications" element={<NotificationsPage />} />

                <Route path="/admin" element={<RoleGuard role="admin" />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="parents" element={<Parents />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="exams" element={<Exams />} />
                  <Route path="marks" element={<Marks />} />
                  <Route path="results" element={<Results />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="fees" element={<Fees />} />
                  <Route path="announcements" element={<Announcements />} />
                </Route>

                <Route path="/teacher" element={<RoleGuard role="teacher" />}>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="attendance" element={<TeacherAttendance />} />
                  <Route path="marks" element={<TeacherMarks />} />
                  <Route path="announcements" element={<TeacherAnnouncements />} />
                </Route>

                <Route path="/student" element={<RoleGuard role="student" />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="announcements" element={<StudentAnnouncements />} />
                </Route>

                <Route path="/parent" element={<RoleGuard role="parent" />}>
                  <Route index element={<ParentDashboard />} />
                  <Route path="fees" element={<ParentFees />} />
                  <Route path="announcements" element={<ParentAnnouncements />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}