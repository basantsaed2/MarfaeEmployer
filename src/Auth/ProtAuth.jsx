// ProtAuth.js
import { Navigate } from 'react-router-dom';

const ProtAuth = ({ children }) => {
  try {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    if (userLocal) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return children;
  }
};

export default ProtAuth;