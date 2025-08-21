// ProtAuth.js
import { Navigate } from 'react-router-dom';

const ProtAuth = ({ children }) => {
  try {
    const userLocal = JSON.parse(localStorage.getItem('employer'));
    if (userLocal) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('Error parsing employer from localStorage:', error);
    return children;
  }
};

export default ProtAuth;