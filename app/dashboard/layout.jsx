import React from 'react';
import Header from './_components/Header';
import Footer from './_components/Footer';

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-800 text-slate-200">
   {/* <Header /> */}
      <main className="container mx-auto px-4 py-8">
        {children}

      </main>

    </div>
  );
}

export default DashboardLayout;
