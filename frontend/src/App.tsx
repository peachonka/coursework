
import type React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { BudgetProvider } from "./context/BudgetContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import AppLayout from "./components/Layout/AppLayout"
import AuthLayout from "./components/Layout/AuthLayout"
import AuthForm from "./components/Auth/AuthForm"
import CreateFamily from "./components/Auth/CreateFamily"
import FirstTimeSetup from "./components/Auth/FirstTimeSetup"
import Dashboard from "./components/Dashboard/Dashboard"
import FamilyMembersList from "./components/Family/FamilyMembersList"
import IncomeList from "./components/Income/IncomeList"
import ExpenseList from "./components/Expenses/ExpenseList"
import ReportView from "./components/Reports/ReportView"

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BudgetProvider>
          <Routes>
            {/* Auth routes with AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<AuthForm mode="signin" />} />
              <Route path="/auth/register" element={<AuthForm mode="signup" />} />
              <Route path="/auth/first-setup" element={<FirstTimeSetup />} />
              <Route path="/families/create" element={<CreateFamily />} />
            </Route>

            {/* Main routes with AppLayout */}
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family"
                element={
                  <ProtectedRoute>
                    <FamilyMembersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/income"
                element={
                  <ProtectedRoute>
                    <IncomeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpenseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportView />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirects */}
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/signin" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BudgetProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
