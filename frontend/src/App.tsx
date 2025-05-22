import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import AppLayout from './components/Layout/AppLayout';
import SessionStart from './components/Auth/SessionStart';
import FirstTimeSetup from './components/Auth/FirstTimeSetup';
import Dashboard from './components/Dashboard/Dashboard';
import FamilyMembersList from './components/Family/FamilyMembersList';
import IncomeList from './components/Income/IncomeList';
import ExpenseList from './components/Expenses/ExpenseList';
import ReportView from './components/Reports/ReportView';
import { useBudget } from './context/BudgetContext';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session } = useBudget();
  const location = useLocation();

  if (!session.isActive) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <BudgetProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<SessionStart />} />
            <Route path="/first-setup" element={<FirstTimeSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/family" element={<FamilyMembersList />} />
            <Route path="/income" element={<IncomeList />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/reports" element={<ReportView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </BudgetProvider>
  );
}

export default App;