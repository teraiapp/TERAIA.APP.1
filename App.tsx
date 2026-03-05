import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Role } from './types';
import { irrigationService } from './services/irrigationService';
import { livestockService } from './services/livestockService';
import { inboxService } from './services/inboxService';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layout & Core
import MainLayout from './layouts/MainLayout';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import NotFoundPage from './pages/NotFoundPage';

// Real Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductionPage from './pages/production/ProductionPage';
import QuadernoCampagnaPage from './pages/quaderno/QuadernoCampagnaPage';
import MeteoPage from './pages/meteo/MeteoPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InboxPage from './pages/inbox/InboxPage';
import DocumentDetailPage from './pages/inbox/DocumentDetailPage';
import EconomyPage from './pages/economy/EconomyPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ScadenzePage from './pages/scadenze/ScadenzePage';
import VisionAiPage from './pages/ai/VisionAiPage';
import AiPredictivePage from './pages/ai/AiPredictivePage';
import AiSeasonalPage from './pages/ai/AiSeasonalPage';
import AiForecastPage from './pages/ai/AiForecastPage';
import IrrigazionePage from './pages/irrigazione/IrrigazionePage';
import SettingsPage from './pages/settings/SettingsPage';  // ← AGGIUNGI QUESTA

// Livestock Hub
import LivestockHomePage from './pages/allevamento/LivestockHomePage';
import LivestockUnitsPage from './pages/allevamento/LivestockUnitsPage';
import LivestockGroupsPage from './pages/allevamento/LivestockGroupsPage';
import LivestockAnimalsPage from './pages/allevamento/LivestockAnimalsPage';
import LivestockProductionPage from './pages/allevamento/LivestockProductionPage';
import LivestockFeedingPage from './pages/allevamento/LivestockFeedingPage';
import LivestockSanitaryPage from './pages/allevamento/LivestockSanitaryPage';
import LivestockVaccinesPage from './pages/allevamento/LivestockVaccinesPage';
import LivestockAlertsPage from './pages/allevamento/LivestockAlertsPage';
import LivestockUnitDetailPage from './pages/allevamento/LivestockUnitDetailPage';

const AppRoutes: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { companyProfile, currentUser } = useAppContext();
    
    // 🔍 DEBUG - Aggiungi questi log
    console.log('🔍 DEBUG:', {
        user: user?.email,
        currentUser: currentUser?.name,
        currentUserRole: currentUser?.role,
        hasCompanyProfile: !!companyProfile,
        authLoading
    });
    
    useEffect(() => {
        if (user) {
            livestockService.seedDemo();
            inboxService.seed();
        }
    }, [user]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Caricamento...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - show login/register
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    // Authenticated but no currentUser set (shouldn't happen but safety check)
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <p className="text-text-secondary">Inizializzazione TeraIA...</p>
            </div>
        );
    }

    // Authenticated but no company profile - show onboarding (only for certain roles)
    if (!companyProfile && [Role.AGRICOLTORE, Role.ALLEVATORE, Role.AZIENDA_MISTA].includes(currentUser.role)) {
        return (
            <Routes>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="*" element={<Navigate to="/onboarding" />} />
            </Routes>
        );
    }

    // Fully authenticated and configured - show main app
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="produzione" element={<ProductionPage />} />
                <Route path="quaderno-campagna" element={<QuadernoCampagnaPage />} />
                <Route path="meteo" element={<MeteoPage />} />
                <Route path="magazzino" element={<InventoryPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="inbox/:id" element={<DocumentDetailPage />} />
                <Route path="economia" element={<EconomyPage />} />
                <Route path="notifiche" element={<NotificationsPage />} />
                <Route path="scadenze" element={<ScadenzePage />} />
                <Route path="vision-ai" element={<VisionAiPage />} />
                <Route path="ai-predittiva" element={<AiPredictivePage />} />
                <Route path="ai-stagionale" element={<AiSeasonalPage />} />
                <Route path="ai-previsioni" element={<AiForecastPage />} />
                <Route path="irrigazione" element={<IrrigazionePage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* ALLEVAMENTO HUB */}
                <Route path="allevamento">
                    <Route index element={<LivestockHomePage />} />
                    <Route path="unita" element={<LivestockUnitsPage />} />
                    <Route path="unita/:id" element={<LivestockUnitDetailPage />} />
                    <Route path="gruppi" element={<LivestockGroupsPage />} />
                    <Route path="animali" element={<LivestockAnimalsPage />} />
                    <Route path="produzione" element={<LivestockProductionPage />} />
                    <Route path="alimentazione" element={<LivestockFeedingPage />} />
                    <Route path="sanita" element={<LivestockSanitaryPage />} />
                    <Route path="vaccini" element={<LivestockVaccinesPage />} />
                    <Route path="alert" element={<LivestockAlertsPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </AppProvider>
        </AuthProvider>
    );
};

export default App;