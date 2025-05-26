import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// import { useNavigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import AuthForm from './components/Auth/AuthForm';
import CreateFamily from './components/Auth/CreateFamily';
import FirstTimeSetup from './components/Auth/FirstTimeSetup';
import Dashboard from './components/Dashboard/Dashboard';
import FamilyMembersList from './components/Family/FamilyMembersList';
import IncomeList from './components/Income/IncomeList';
import ExpenseList from './components/Expenses/ExpenseList';
import ReportView from './components/Reports/ReportView';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// // Обернем компоненты, которым нужна навигация
// const LoginPage = () => {
//   return <AuthForm mode="signin"/>;
// };

// const RegisterPage = () => {
//   return <AuthForm mode="signup"/>;
// };

function App() {
  return (
    <Router>
      <AuthProvider>
        <BudgetProvider>
          <AppLayout>
            <Routes>
              <Route path="/auth/login" element={<AuthForm mode="signin"/>} />
              <Route path="/auth/register" element={<AuthForm mode="signup"/>} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <CreateFamily />
                </ProtectedRoute>
              } />
              
              <Route path="/first-setup" element={
                <ProtectedRoute>
                  <FirstTimeSetup />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/family" element={
                <ProtectedRoute>
                  <FamilyMembersList />
                </ProtectedRoute>
              } />
              
              <Route path="/income" element={
                <ProtectedRoute>
                  <IncomeList />
                </ProtectedRoute>
              } />
              
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <ExpenseList />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportView />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BudgetProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;