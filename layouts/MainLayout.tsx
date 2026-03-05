
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
    const location = useLocation();

    // DIAGNOSTIC LOGGER: Fondamentale per QA e stabilità
    useEffect(() => {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('web-platform');
        if (isDev) {
            console.log(`%c[NAVIGATE] %c→ ${location.pathname}${location.search}`, "color: #22c55e; font-weight: bold", "color: #64748b");
        }
    }, [location]);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 md:p-8">
                    <div className="max-w-[1440px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
