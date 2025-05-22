import { useBudget } from './context/BudgetContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session } = useBudget();
  
  if (!session.isActive) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;