import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { CompanyProfile, User, Role, Farm, AssetType, Assignment, UIPrefs } from '../types';
import { MOCK_USERS, MOCK_FARMS, MOCK_ASSIGNMENTS } from '../data/mockDataV4';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/AuthContext';

interface AppContextType {
    currentUser: User | null;
    companyProfile: CompanyProfile | null;
    activeFarm: Farm | null;
    simulatedRole: Role;
    uiPrefs: UIPrefs;
    setSimulatedRole: (r: Role) => void;
    setUiPrefs: (p: Partial<UIPrefs>) => void;
    setCompanyProfile: (p: CompanyProfile | null) => void;
    setCurrentUser: (u: User | null) => void;
    setActiveFarm: (f: Farm | null) => void;
    switchUser: (id: string) => void;
    assignments: Assignment[];
    farms: Farm[];
    loadingProfile: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Identity - Crea User da Supabase authUser
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Sincronizza currentUser con authUser di Supabase
    useEffect(() => {
        if (authUser) {
            // Crea un User dall'utente Supabase
            const userData: User = {
                id: authUser.id,
                name: authUser.user_metadata?.full_name || authUser.email || 'Utente',
                email: authUser.email || '',
                role: Role.AGRICOLTORE, // Default role, può essere cambiato dopo
                plan: 'Pro' as any
            };
            setCurrentUser(userData);
            localStorage.setItem('teraia_user_v4', JSON.stringify(userData));
        } else {
            setCurrentUser(null);
            localStorage.removeItem('teraia_user_v4');
        }
    }, [authUser]);

    // Profile & Assets
    const [companyProfile, setCompanyProfileState] = useState<CompanyProfile | null>(() => {
        const saved = localStorage.getItem('teraia_profile_v4');
        return saved ? JSON.parse(saved) : null;
    });

    // Load company profile from Supabase when authenticated
    useEffect(() => {
        const loadCompanyProfile = async () => {
            if (!authUser) {
                setCompanyProfileState(null);
                setLoadingProfile(false);
                return;
            }

            try {
                setLoadingProfile(true);
                const { data, error } = await supabase
                    .from('company_profiles')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .single();

                if (error) {
                    // No profile found (404) is not an error - user needs to complete onboarding
                    if (error.code === 'PGRST116') {
                        setCompanyProfileState(null);
                        localStorage.removeItem('teraia_profile_v4');
                    } else {
                        console.error('Error loading company profile:', error);
                    }
                } else if (data) {
                    // Transform database data to CompanyProfile type
                    const profile: CompanyProfile = {
                        localization: data.details?.localization || {
                            regionCode: data.details?.regionCode || "",
                            provinceCode: data.details?.provinceCode || "",
                            communeCode: data.details?.communeCode || "",
                            regionName: data.region || "",
                            provinceName: data.province || "",
                            communeName: data.city || ""
                        },
                        businessType: data.details?.businessType || 'agricoltura',
                        assets: data.assets,
                        goals: data.details?.goals || [],
                        operatingModes: data.operating_modes || [],
                        technology: data.technology,
                        constraints: data.constraints || []
                    };
                    setCompanyProfileState(profile);
                    // Cache in localStorage for performance
                    localStorage.setItem('teraia_profile_v4', JSON.stringify(profile));
                }
            } catch (err) {
                console.error('Unexpected error loading profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadCompanyProfile();
    }, [authUser]);

    // Simulation Role
    const [simulatedRole, setSimulatedRoleState] = useState<Role>(() => {
        const saved = localStorage.getItem('teraia.simRole');
        if (saved) return saved as Role;
        
        // Fallback default based on setup
        if (companyProfile) {
            const hasLivestock = companyProfile.assets.includes(AssetType.ALLEVAMENTO);
            const hasAgri = companyProfile.assets.some(a => a !== AssetType.ALLEVAMENTO);
            if (hasAgri && hasLivestock) return Role.AZIENDA_MISTA;
            if (hasLivestock) return Role.ALLEVATORE;
        }
        return Role.AGRICOLTORE;
    });

    const [uiPrefs, setUiPrefsState] = useState<UIPrefs>(() => {
        const saved = localStorage.getItem('teraia_ui_prefs_v1');
        return saved ? JSON.parse(saved) : { compactMode: false, sidebarOpen: true, lastVisited: '/' };
    });

    const [activeFarm, setActiveFarm] = useState<Farm | null>(() => {
        const saved = localStorage.getItem('teraia_active_farm_v4');
        return saved ? JSON.parse(saved) : null;
    });

    // Syncers
    useEffect(() => { localStorage.setItem('teraia_ui_prefs_v1', JSON.stringify(uiPrefs)); }, [uiPrefs]);
    useEffect(() => { localStorage.setItem('teraia.simRole', simulatedRole); }, [simulatedRole]);
    
    const setCompanyProfile = (profile: CompanyProfile | null) => {
        setCompanyProfileState(profile);
        if (profile) {
            localStorage.setItem('teraia_profile_v4', JSON.stringify(profile));
            // Reset simulated role if current one is not valid anymore
            const hasLivestock = profile.assets.includes(AssetType.ALLEVAMENTO);
            if (!hasLivestock && simulatedRole !== Role.AGRICOLTORE) {
                setSimulatedRole(Role.AGRICOLTORE);
            }
        } else {
            localStorage.removeItem('teraia_profile_v4');
        }
    };

    const setSimulatedRole = (role: Role) => {
        setSimulatedRoleState(role);
    };

    const setUiPrefs = (updates: Partial<UIPrefs>) => {
        setUiPrefsState(prev => ({ ...prev, ...updates }));
    };

    const switchUser = (id: string) => {
        const user = MOCK_USERS.find(u => u.id === id);
        if (user) {
            setCurrentUser(user);
            setActiveFarm(null);
            // Default simulated role when switching physical identity
            setSimulatedRole(user.role);
        }
    };

    const value = useMemo(() => ({
        currentUser, companyProfile, activeFarm, simulatedRole, uiPrefs, 
        assignments: MOCK_ASSIGNMENTS, farms: MOCK_FARMS, loadingProfile,
        setSimulatedRole, setUiPrefs, setCompanyProfile, setCurrentUser, setActiveFarm, switchUser
    }), [currentUser, companyProfile, activeFarm, simulatedRole, uiPrefs, loadingProfile]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};