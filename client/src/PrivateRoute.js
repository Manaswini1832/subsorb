import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './contexts/userContext';

const PrivateRoute = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  return session ? children : <Navigate to="/" />;
};

export default PrivateRoute;
