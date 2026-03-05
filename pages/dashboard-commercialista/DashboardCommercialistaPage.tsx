
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, FileDown, Printer, TrendingUp, TrendingDown, Landmark, LayoutGrid, Calendar, Filter, FileText } from 'lucide-react';
import { Transaction } from '../../data/economiaData';

const readLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-surface rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

const DashboardCommercialistaPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Filtri
    const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const transactions = readLocalStorage<Transaction[]>('teraia_economia_transazioni_v1', []);
    const units = readLocalStorage<any[]>('teraia_production_units_v1', []);

    // Calcolo statistiche filtrate
    const stats = useMemo(() => {
        const filtered = transactions.filter(t => {
            const date = new Date(t.date);
            const matchUnit = selectedUnitId === 'all' || String(t.unitId) === String(selectedUnitId);
            const matchMonth = date.getMonth() === selectedMonth;
            const matchYear = date.getFullYear() === selectedYear;
            return matchUnit && matchMonth && matchYear;
        });

        const costs = filtered.filter(t => t.type === 'cost').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const revenues = filtered.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        
        return { 
            costs, 
            revenues, 
            balance: revenues - costs,
            count: filtered.length 
        };
    }, [transactions, selectedUnitId, selectedMonth, selectedYear]);

    const handleExportFullCSV = () => {
        const headers = ["Data", "Descrizione", "Unità", "Categoria", "Importo (€)"];
        const rows = transactions.map(t => [
            t.date, t.description, t.linkedTo, t.category, t.amount
        ].join(';'));
        const blob = new Blob([`\uFEFF${headers.join(';')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bilancio_completo_${new Date().getFullYear()}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-text-primary">Portale Fiscale</h1>
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm">
                    <Landmark size={16}/> Accesso Professionista Certificato
                </div>
            </div>

            {/* Barra Filtri Professionale */}
            <Card className="bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-text-secondary font-black uppercase text-[10px] tracking-widest">
                    <Filter size={14}/> Filtri Analisi Periodica
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">UNITA' PRODUTTIVA</label>
                        <select 
                            value={selectedUnitId} 
                            onChange={e => setSelectedUnitId(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="all">Tutte le Unità</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">MESE</label>
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            {["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">ANNO</label>
                        <select 
                            value={selectedYear} 
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg bg-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => { setSelectedUnitId('all'); setSelectedMonth(new Date().getMonth()); }}
                            className="w-full p-2 text-xs font-bold text-text-secondary hover:text-primary transition-colors underline"
                        >
                            Reset Filtri
                        </button>
                    </div>
                </div>
            </Card>

            {/* Riepilogo Economico Filtrato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-green-500">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">Ricavi Periodo</h3>
                        <TrendingUp size={20} className="text-green-500"/>
                    </div>
                    <p className="text-3xl font-black text-green-600">{formatCurrency(stats.revenues)}</p>
                    <p className="text-[10px] text-text-secondary mt-1 italic">Basato su {stats.count} movimenti</p>
                </Card>
                <Card className="border-t-4 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">Costi Periodo</h3>
                        <TrendingDown size={20} className="text-red-500"/>
                    </div>
                    <p className="text-3xl font-black text-red-600">{formatCurrency(stats.costs)}</p>
                </Card>
                <Card className={`border-t-4 ${stats.balance >= 0 ? 'border-primary' : 'border-orange-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">Margine Operativo</h3>
                        <Calendar size={20} className="text-primary"/>
                    </div>
                    <p className={`text-3xl font-black ${stats.balance >= 0 ? 'text-primary' : 'text-orange-600'}`}>{formatCurrency(stats.balance)}</p>
                </Card>
            </div>

            {/* Sezione Export e Reportistica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileDown className="text-primary"/> Export per Contabilità</h2>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        Scarica i dati economici pronti per l'importazione nel tuo software gestionale di studio. I file includono tutte le transazioni registrate dall'azienda.
                    </p>
                    <div className="space-y-3">
                        <button onClick={handleExportFullCSV} className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-primary/5 hover:border-primary transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><FileText size={18}/></div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">Export Excel/CSV</p>
                                    <p className="text-[10px] text-text-secondary">Tutte le transazioni dell'anno {selectedYear}</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors"/>
                        </button>
                        <button onClick={() => window.print()} className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-primary/5 hover:border-primary transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Printer size={18}/></div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">Genera Report PDF</p>
                                    <p className="text-[10px] text-text-secondary">Riepilogo margini e voci di costo del mese</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors"/>
                        </button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><LayoutGrid className="text-primary"/> Analisi Unità</h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {units.length > 0 ? units.map(u => {
                            const unitTx = transactions.filter(t => String(t.unitId) === String(u.id));
                            const unitRev = unitTx.filter(t => t.type === 'revenue').reduce((s,t) => s + t.amount, 0);
                            const unitCost = unitTx.filter(t => t.type === 'cost').reduce((s,t) => s + Math.abs(t.amount), 0);
                            const unitMargin = unitRev - unitCost;

                            return (
                                <div key={u.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-transparent hover:border-gray-200 transition-all">
                                    <div>
                                        <p className="font-bold text-sm text-text-primary">{u.name}</p>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold">{u.type} • {u.area} ha</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-sm ${unitMargin >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                            {formatCurrency(unitMargin)}
                                        </p>
                                        <p className="text-[9px] text-text-secondary font-black uppercase">Margine Netto</p>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-center py-8 text-text-secondary italic">Nessuna unità configurata.</p>}
                    </div>
                    <button onClick={() => navigate('/economia')} className="mt-6 w-full py-2 text-xs font-bold text-primary hover:underline flex items-center justify-center gap-2">
                        Analisi Dettagliata Movimenti <ArrowRight size={14}/>
                    </button>
                </Card>
            </div>
        </div>
    );
};

// Helper component for arrows
const ArrowRight: React.FC<{size?: number, className?: string}> = ({size = 16, className}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
);

export default DashboardCommercialistaPage;
