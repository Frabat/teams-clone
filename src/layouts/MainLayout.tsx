import React from 'react';
import LeftSidebar from '../components/LeftSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-[#1F1F1F] text-white">
      <LeftSidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-[#1F1F1F]">
        {/* Header would go here */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 