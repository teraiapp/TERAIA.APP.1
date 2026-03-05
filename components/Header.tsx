import React, { useMemo } from 'react';
import { UserCircle, Building2, Terminal, Maximize, Minimize, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Role, AssetType } from '../types';

const Header: React.FC = () => {
    const { simulatedRole, setSimulatedRole, companyProfile, activeFarm, uiPrefs, setUiPrefs, currentUser } = useAppContext();
    const navigate = useNavigate();

    const availableSimRoles = useMemo(() => {
        const roles = [Role.AGRICOLTORE];
        const hasLivestock = companyProfile?.assets.includes(AssetType.ALLEVAMENTO);
        if (hasLivestock) {
            roles.push(Role.ALLEVATORE);
            roles.push(Role.AZIENDA_MISTA);
        }
        return roles;
    }, [companyProfile]);

    return (
        <header className="h-20 bg-surface flex items-center justify-between px-8 border-b border-gray-100">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                    <div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase text-text-secondary opacity-60">
                        <UserCog size={14}/>
                        <span>Simula:</span>
                    </div>
                    <select
                        value={simulatedRole}
                        onChange={e => setSimulatedRole(e.target.value as Role)}
                        className="p-2 border-none rounded-xl bg-white text-xs font-black uppercase tracking-tighter focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
                    >
                        {availableSimRoles.map(r => (
                            <option key={r} value={r}>{r.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {activeFarm && (
                    <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 text-primary">
                        <Building2 size={16}/>
                        <span className="text-xs font-black uppercase tracking-widest">{activeFarm.name}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setUiPrefs({ compactMode: !uiPrefs.compactMode })}
                    className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 ${uiPrefs.compactMode ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-transparent text-text-secondary'}`}
                    title="Compact Mode"
                >
                    {uiPrefs.compactMode ? <Maximize size={18}/> : <Minimize size={18}/>}
                    <span className="text-[10px] font-black uppercase hidden md:inline">Compact</span>
                </button>

                {currentUser?.role === Role.ADMIN && (
                    <button onClick={() => navigate('/admin/diagnostica')} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black shadow-lg" title="System Diagnostics">
                        <Terminal size={18}/>
                    </button>
                )}

                <button 
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-3 pl-4 border-l hover:bg-gray-50 px-3 py-2 rounded-xl transition-all cursor-pointer group"
                    title="Vai alle Impostazioni"
                >
                    <div className="text-right hidden sm:block">
                        <p className="font-black text-sm text-text-primary uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{currentUser?.name}</p>
                        <p className="text-[9px] font-bold text-primary uppercase mt-1">{currentUser?.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden group-hover:border-primary transition-all">
                        {currentUser?.avatar ? <img src={currentUser.avatar} /> : <UserCircle className="text-gray-400 group-hover:text-primary transition-colors" size={32} />}
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;