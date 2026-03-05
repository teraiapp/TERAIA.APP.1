import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ChevronDown, ChevronRight, PawPrint, Inbox } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { ROUTE_REGISTRY, SECTION_LABELS } from '../constants';
import { Role, RouteConfig, AssetType } from '../types';
import { inboxService } from '../services/inboxService';

const Sidebar: React.FC = () => {
    const { currentUser, companyProfile, activeFarm, simulatedRole } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [openSections, setOpenSections] = useState<string[]>(['main', 'operativita', 'intelligence', 'amministrazione']);
    const [newDocsCount, setNewDocsCount] = useState(0);

    useEffect(() => {
        const checkNewDocs = () => {
            const docs = inboxService.getDocuments();
            setNewDocsCount(docs.filter(d => d.status === 'NEW').length);
        };
        
        checkNewDocs();
        window.addEventListener('teraia:inbox-changed', checkNewDocs);
        return () => window.removeEventListener('teraia:inbox-changed', checkNewDocs);
    }, []);

    const toggleSection = (section: string) => {
        setOpenSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
    };

    const groupedNav = useMemo(() => {
        if (!currentUser) return {};

        const currentActivities = activeFarm ? activeFarm.activities : (companyProfile?.assets || []);

        return ROUTE_REGISTRY.reduce((acc, route) => {
            // Check Ruolo Simulato
            const hasRoleAccess = route.roles.includes('*') || route.roles.includes(simulatedRole);
            if (!hasRoleAccess && simulatedRole !== Role.ADMIN) return acc;

            // Check Asset
            if (route.assets && route.assets.length > 0) {
                const hasMatchingAsset = route.assets.some(a => currentActivities.includes(a));
                if (!hasMatchingAsset && simulatedRole !== Role.ADMIN) return acc;
            }

            if (!acc[route.section]) acc[route.section] = [];
            acc[route.section].push(route);
            return acc;
        }, {} as Record<string, RouteConfig[]>);
    }, [simulatedRole, companyProfile, activeFarm, currentUser]);

    if (!currentUser) return null;

    const sections = Object.keys(SECTION_LABELS).filter(s => groupedNav[s]);

    return (
        <div className="w-72 bg-surface flex-shrink-0 flex flex-col shadow-2xl border-r border-gray-100 z-50">
            <div className="flex items-center justify-center h-24 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50">
                <Leaf className="h-10 w-10 text-primary" />
                <span className="ml-2 text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">TeraIA <span className="text-primary font-black">OS</span></span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 scrollbar-hide px-4">
                <nav className="space-y-8">
                    {sections.map(sectionId => (
                        <div key={sectionId} className="space-y-2">
                            <button 
                                onClick={() => toggleSection(sectionId)}
                                className="w-full flex items-center justify-between px-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 hover:text-primary transition-colors"
                            >
                                {SECTION_LABELS[sectionId as keyof typeof SECTION_LABELS]}
                                {openSections.includes(sectionId) ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                            </button>
                            
                            {openSections.includes(sectionId) && (
                                <ul className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                                    {groupedNav[sectionId].map(route => (
                                        <li key={route.id}>
                                            <NavLink
                                                to={route.path}
                                                end={route.path === '/'}
                                                className={({ isActive }) =>
                                                    `flex items-center px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-[11px] uppercase tracking-widest group ${
                                                        isActive || (route.path !== '/' && location.pathname.startsWith(route.path))
                                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1'
                                                            : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                                                    }`
                                                }
                                            >
                                                <route.icon className={`h-4 w-4 mr-3 shrink-0 transition-colors ${
                                                    location.pathname === route.path || (route.path !== '/' && location.pathname.startsWith(route.path))
                                                        ? 'text-white' 
                                                        : 'text-text-secondary group-hover:text-primary'
                                                }`} />
                                                <span className="truncate">{route.label}</span>
                                                {route.id === 'inbox' && newDocsCount > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                                        {newDocsCount}
                                                    </span>
                                                )}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                <button
                    onClick={() => navigate('/settings')}
                    className="w-full p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                    title="Vai alle Impostazioni"
                >
                    <p className="text-[9px] font-black text-text-secondary uppercase mb-2 opacity-50 tracking-widest group-hover:text-primary transition-colors">Utente Attivo</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">{currentUser.name.charAt(0)}</div>
                        <div className="overflow-hidden flex-1 text-left">
                            <p className="text-xs font-black text-text-primary truncate uppercase tracking-tighter group-hover:text-primary transition-colors">{currentUser.name}</p>
                            <p className="text-[9px] font-bold text-primary uppercase truncate mt-1">{simulatedRole}</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;