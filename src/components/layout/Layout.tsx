import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;