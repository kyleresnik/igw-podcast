import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

// layout wrapper component for site structure
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
