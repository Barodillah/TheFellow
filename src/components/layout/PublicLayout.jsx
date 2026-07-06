import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-surface-warm text-slate-800 font-sans antialiased">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
