
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Inbox, Search, Filter, PlusCircle, Camera, 
    FileText, Clock, CheckCircle2, Archive, 
    ChevronRight, AlertCircle, Trash2, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inboxService } from '../../services/inboxService';
import { InboxDocument, InboxStatus, InboxDocType } from '../../types';

const InboxPage: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<InboxDocument[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<InboxStatus | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<InboxDocType | 'ALL'>('ALL');

    useEffect(() => {
        const load = () => setDocuments(inboxService.getDocuments());
        load();
        window.addEventListener('teraia:inbox-changed', load);
        return () => window.removeEventListener('teraia:inbox-changed', load);
    }, []);

    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase()) || 
                                doc.supplierName.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
            const matchesType = typeFilter === 'ALL' || doc.docType === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [documents, search, statusFilter, typeFilter]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            inboxService.uploadDocument({
                name: file.name,
                mime: file.type,
                dataUrl: dataUrl
            });
        };
        reader.readAsDataURL(file);
    };

    const getStatusBadge = (status: InboxStatus) => {
        switch (status) {
            case 'NEW': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Da Verificare</span>;
            case 'PARSED': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><FileText size={10}/> Elaborato</span>;
            case 'CONFIRMED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Registrato</span>;
            case 'ARCHIVED': return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Archive size={10}/> Archiviato</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Inbox className="text-primary" size={36} /> Inbox Documenti
                    </h1>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">v1.0 • Gestione Documentale Intelligente</p>
                </div>
                <div className="flex gap-2">
                    <label className="px-5 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                        <Camera size={16}/> Scatta Foto
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <label className="px-5 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer">
                        <PlusCircle size={16}/> Carica Documento
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* FILTRI */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-50 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18}/>
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="Cerca per fornitore o nome file..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                >
                    <option value="ALL">Tutti gli stati</option>
                    <option value="NEW">Da Verificare</option>
                    <option value="PARSED">Elaborati</option>
                    <option value="CONFIRMED">Registrati</option>
                    <option value="ARCHIVED">Archiviati</option>
                </select>
                <select 
                    className="p-3 bg-gray-50 rounded-xl font-bold text-sm border-none outline-none focus:ring-2 focus:ring-primary"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as any)}
                >
                    <option value="ALL">Tutti i tipi</option>
                    <option value="FATTURA">Fattura</option>
                    <option value="SCONTRINO">Scontrino</option>
                    <option value="DDT">DDT</option>
                    <option value="BOLLETTA">Bolletta</option>
                    <option value="PREVENTIVO">Preventivo</option>
                    <option value="CONTRATTO">Contratto</option>
                    <option value="ALTRO">Altro</option>
                </select>
            </div>

            {/* GRID DOCUMENTI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                    <div 
                        key={doc.id} 
                        onClick={() => navigate(`/inbox/${doc.id}`)}
                        className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 flex flex-col justify-between group hover:border-primary transition-all cursor-pointer relative overflow-hidden"
                    >
                        {doc.status === 'NEW' && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[8px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                                <AlertCircle size={10}/> Da Verificare
                            </div>
                        )}
                        
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-gray-50 rounded-3xl text-primary group-hover:bg-primary/10 transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('Eliminare?')) inboxService.deleteDocument(doc.id); }}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-tight mb-2 truncate">
                                {doc.supplierName || doc.fileName}
                            </h3>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-6">
                                {new Date(doc.docDateISO).toLocaleDateString()} • {doc.docType}
                            </p>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Totale Documento</p>
                                    <p className="text-2xl font-black text-text-primary">€ {doc.totalAmount.toFixed(2)}</p>
                                </div>
                                {getStatusBadge(doc.status)}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                                {doc.rows.length} righe rilevate
                            </span>
                            <div className="flex items-center gap-1 text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Gestisci <ChevronRight size={14}/>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Inbox size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Nessun documento trovato</h3>
                        <p className="text-text-secondary font-medium">Carica una fattura o uno scontrino per iniziare.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxPage;
