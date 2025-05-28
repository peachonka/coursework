// components/Layout/AuthLayout.tsx
import { Outlet } from 'react-router-dom';
import React from 'react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 p-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600 pb-10">
          Семейный бюджет
        </h2>
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;