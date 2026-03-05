
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Camera, Upload, Zap, Search, History, 
    CheckCircle, X, ShieldAlert, Info, 
    ArrowRight, RefreshCw, Eye, Image as ImageIcon,
    DatabaseZap, LayoutGrid, FileText, Share2,
    Trash2, AlertTriangle, Scan, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { analyzeImage, saveVisionReport, getVisionHistory } from '../../utils/visionAiEngine';
import { VisionReport, Role } from '../../types';
import { addEventToQuaderno } from '../../utils/quadernoBridge';
import { saveCase } from '../../utils/collectiveMemoryEngineV2';

const VisionAiPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, companyProfile } = useAppContext();
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    
    // --- STATE ---
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewImg, setPreviewImg] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<VisionReport | null>(null);
    const [history, setHistory] = useState<VisionReport[]>(getVisionHistory());
    const videoRef = useRef<HTMLVideoElement>(null);

    // --- CAMERA HANDLERS ---
    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            alert("Impossibile accedere alla fotocamera. Verifica i permessi.");
        }
    };

    const stopCamera = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
    };

    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        if (videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const img = canvas.toDataURL('image/jpeg');
            setPreviewImg(img);
            stopCamera();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImg(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!previewImg) return;
        setIsAnalyzing(true);
        const result = await analyzeImage(previewImg);
        setReport(result);
        saveVisionReport(result);
        setHistory(getVisionHistory());
        setIsAnalyzing(false);
    };

    // --- INTEGRATION HANDLERS ---
    const handleRegisterInQuaderno = (unitId: string) => {
        if (!report) return;
        addEventToQuaderno({
            date: new Date().toISOString().split('T')[0],
            type: 'nota',
            unitId,
            unitName: 'Unità da Vision AI',
            crop: report.detectedCrop,
            description: `Diagnosi Vision AI: ${report.problemLabel}. Confidenza: ${report.confidence}%`,
            operator: currentUser?.name || 'Operatore AI',
            source: 'Sensori', // Vision AI mappata come sensore intelligente
            status: 'confermato',
            notes: report.description
        });
        alert("Diagnosi registrata nel Quaderno di Campagna!");
    };

    const handleShareAsCase = () => {
        if (!report || !companyProfile) return;
        const newCase: any = {
            id: `case-vis-${Date.now()}`,
            ownerId: currentUser?.id || 'anon',
            timestamp: new Date().toISOString(),
            territory: companyProfile.localization,
            unitType: 'Campi aperti',
            target: report.detectedCrop,
            problem: report.problemLabel,
            intervention: 'Identificato tramite Vision AI. In attesa di trattamento.',
            outcome: 'risolto',
            source: 'ai_trattamenti',
            privacy: { consent: true, level: 'nazionale' },
            quality: { completeness: 90, reliability: report.confidence, moderationStatus: 'approved' }
        };
        saveCase(newCase);
        alert("Caso condiviso con la community! Grazie per il tuo contributo.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tighter">
                        <Scan className="text-primary animate-pulse" size={36} /> Vision AI Expert
                    </h1>
                    <p className="text-text-secondary text-sm font-medium">Diagnostica visiva avanzata e riconoscimento patogeni.</p>
                </div>
                <div className="flex p-1 bg-gray-100 rounded-2xl shadow-inner">
                    <button onClick={() => setActiveTab('new')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}>Nuova Analisi</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}>Storico ({history.length})</button>
                </div>
            </div>

            {activeTab === 'new' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* CAMERA / UPLOAD BOX */}
                    <div className="lg:col-span-7 space-y-6">
                        {!previewImg && !stream ? (
                            <div className="bg-white rounded-[48px] p-20 border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                                <div className="p-8 bg-gray-50 rounded-full mb-8 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={64} className="text-gray-300 group-hover:text-primary"/>
                                </div>
                                <h2 className="text-2xl font-black text-text-primary uppercase mb-2">Analizza la tua coltura</h2>
                                <p className="text-text-secondary max-w-xs mb-10 font-medium">Scatta una foto nitida alla foglia o al frutto per identificare malattie o insetti.</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                    <button onClick={startCamera} className="flex-1 py-5 bg-primary text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-primary-dark">
                                        <Camera size={18}/> Scatta Foto
                                    </button>
                                    <label className="flex-1 py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black cursor-pointer">
                                        <Upload size={18}/> Carica File
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
                                    </label>
                                </div>
                            </div>
                        ) : stream ? (
                            <div className="bg-black rounded-[48px] overflow-hidden relative shadow-2xl border-8 border-white aspect-video flex items-center justify-center">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                                    <button onClick={stopCamera} className="p-5 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-white/40"><X/></button>
                                    <button onClick={takePhoto} className="p-8 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform"><Camera size={32}/></button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl border-4 border-white relative group">
                                <img src={previewImg!} alt="Preview" className="w-full aspect-video object-cover"/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button onClick={() => setPreviewImg(null)} className="p-4 bg-white text-red-600 rounded-2xl font-black uppercase text-xs">Annulla</button>
                                    <button onClick={runAnalysis} disabled={isAnalyzing} className="p-4 bg-primary text-white rounded-2xl font-black uppercase text-xs flex items-center gap-2">
                                        {isAnalyzing ? <RefreshCw className="animate-spin" size={16}/> : <Zap size={16}/>}
                                        {isAnalyzing ? 'Analisi AI...' : 'Avvia Analisi Vision'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ANALYZER QUALITY INFO */}
                        <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex items-start gap-4">
                            <Info className="text-blue-600 shrink-0" size={24}/>
                            <div>
                                <h4 className="text-xs font-black uppercase text-blue-900 tracking-tight">Qualità della Diagnosi</h4>
                                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">Assicurati che la foto sia a fuoco e ben illuminata. L'AI analizza i margini fogliari e le discromie per identificare i patogeni. Se la confidenza è bassa (&lt;50%), scatta una nuova foto da un'angolazione diversa.</p>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS PANEL */}
                    <div className="lg:col-span-5 space-y-6">
                        {!report && !isAnalyzing ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200 text-center">
                                <Scan size={48} className="text-gray-200 mb-4"/>
                                <p className="text-sm font-black text-gray-400 uppercase">In attesa di acquisizione...</p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-[48px] shadow-xl text-center space-y-6">
                                <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <div>
                                    <h3 className="text-xl font-black uppercase">Deep Scanning...</h3>
                                    <p className="text-text-secondary text-sm">Confronto campioni con dataset TeraIA Cloud.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right duration-500 space-y-6">
                                {/* MAIN RESULT CARD */}
                                <div className="bg-gray-900 text-white rounded-[48px] p-8 shadow-2xl border-t-8 border-primary">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest">Confidenza {report!.confidence}%</span>
                                            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest">{report!.severity} RISCHIO</span>
                                        </div>
                                        <button onClick={() => setReport(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={16}/></button>
                                    </div>
                                    
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none">{report!.problemLabel}</h2>
                                    <p className="text-sm text-white/60 mb-8 font-medium">Rilevato su: <span className="text-primary font-black uppercase">{report!.detectedCrop}</span></p>
                                    
                                    <div className="space-y-3 bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                                        <p className="text-[10px] font-black uppercase text-primary mb-2">Perché questa diagnosi?</p>
                                        {report!.why.map((reason, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs font-medium text-white/80">
                                                <CheckCircle size={14} className="text-primary shrink-0 mt-0.5"/>
                                                {reason}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <button 
                                            onClick={() => navigate('/ai/trattamenti', { state: { problem: report!.problemLabel.toLowerCase() }})}
                                            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            Verifica Protocolli Legali <ArrowRight size={18}/>
                                        </button>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRegisterInQuaderno('unit-1')} className="flex-1 py-3 bg-white/10 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20">Registra Quaderno</button>
                                            <button onClick={handleShareAsCase} className="flex-1 py-3 bg-white/10 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20">Condividi Caso</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100 flex items-start gap-4">
                                    <AlertTriangle className="text-orange-600 shrink-0" size={24}/>
                                    <p className="text-[11px] text-orange-800 font-bold uppercase leading-relaxed">
                                        <b>Nota AI:</b> La diagnosi visiva è un supporto. <br/>Per attacchi virulenti si consiglia il prelievo di un campione per analisi di laboratorio.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {history.map(item => (
                        <div key={item.id} onClick={() => {setReport(item); setPreviewImg(item.imageUrl); setActiveTab('new');}} className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-gray-100 group cursor-pointer hover:shadow-2xl transition-all">
                            <div className="h-40 relative">
                                <img src={item.imageUrl} alt="Analsi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black rounded uppercase">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-5">
                                <h4 className="font-black text-sm uppercase text-text-primary truncate">{item.problemLabel}</h4>
                                <p className="text-[10px] font-bold text-text-secondary uppercase">{item.detectedCrop} • Confidenza {item.confidence}%</p>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="col-span-full py-20 text-center text-text-secondary italic bg-gray-50 rounded-[40px] border-2 border-dashed">
                            Nessuna analisi salvata nello storico.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VisionAiPage;
