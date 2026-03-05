
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Plan } from '../types';

interface UpgradeBannerProps {
    featureName: string;
    requiredPlan: Plan;
    className?: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ featureName, requiredPlan, className }) => {
    return (
        <div className={`p-4 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Star className="h-8 w-8 mr-4" fill="white"/>
                    <div>
                        <h3 className="font-extrabold text-lg">Potenzia la tua azienda con il piano {requiredPlan}</h3>
                        <p className="text-sm">Sblocca {featureName} e molto altro per una gestione ottimale.</p>
                    </div>
                </div>
                <Link 
                    to="/piani" 
                    className="flex items-center px-4 py-2 bg-white text-primary font-bold rounded-lg shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                    Scopri di più <ArrowRight size={16} className="ml-2"/>
                </Link>
            </div>
        </div>
    );
};

export default UpgradeBanner;
