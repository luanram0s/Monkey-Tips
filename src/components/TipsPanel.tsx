import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRecentTeamData, generateMatchDeepDive, analyzeBetSlipImage, analyzeReferee, analyzeMultiBet, fetchHeadToHeadData } from '../services/geminiService';
import { LIVE_VOICE_SYSTEM_INSTRUCTION } from '../services/prompts';
import { BetSlipAnalysis, DeepDiveResult, RefereeAnalysis, MultiBetAnalysis, BetLeg, MatchResult, HeadToHeadMatch } from '../types';
import { Lightbulb, Loader, ShieldAlert, BrainCircuit, Camera, UploadCloud, BarChart, Mic, MicOff, Gavel, Gamepad2, Star, ShieldCheck, Layers, PlusCircle, Trash2, Database, Search, Sword, Copy, Check, Info, Cpu } from 'lucide-react';
import Card from './ui/Card';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob } from '@google/genai';
import AnalysisResult from './ui/AnalysisResult'; // Import the new component
import LiveBasketballEngine from './AnalystPanel';

const AVAILABLE_MARKETS: Record<string, string[]> = {
  Futebol: ["Resultado Final", "Total de Gols (Mais/Menos 2.5)", "Ambas as Equipes Marcam", "Handicap Asiático", "Total de Cartões"],
  Basquete: ["Vencedor da Partida", "Total de Pontos (Mais/Menos)", "Handicap de Pontos"],
  Vôlei: ["Vencedor da Partida", "Total de Sets", "Handicap de Sets"],
};

const AVAILABLE_MARKETS_MULTI: string[] = [
    "Vitória Time A", "Empate", "Vitória Time B", "Mais de 2.5 Gols", "Menos de 2.5 Gols", "Ambas Marcam: Sim"
];

type Sport = keyof typeof AVAILABLE_MARKETS;
type ToolTab = 'deep-dive' | 'live-basketball-engine' | 'multi-bet' | 'image-analysis' | 'referee' | 'live-voice';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as Base64."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- Funções de áudio para a API Live ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const TipsPanel: React.FC = () => {
    const [activeToolTab, setActiveToolTab] = useState<ToolTab>('deep-dive');
    
    // State for match analysis
    const [teamA, setTeamA] = useState('');
    const [teamB, setTeamB] = useState('');
    const [sport, setSport] = useState<Sport>('Futebol');
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatorError, setGeneratorError] = useState<string | null>(null);
    const [deepDiveResult, setDeepDiveResult] = useState<DeepDiveResult | null>(null);
    // State for data collector
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [teamAData, setTeamAData] = useState<MatchResult[] | null>(null);
    const [teamBData, setTeamBData] = useState<MatchResult[] | null>(null);
    const [headToHeadData, setHeadToHeadData] = useState<HeadToHeadMatch[] | null>(null);

    // State for referee analysis
    const [refereeNameToAnalyze, setRefereeNameToAnalyze] = useState('');
    const [isAnalyzingReferee, setIsAnalyzingReferee] = useState(false);
    const [refereeAnalysisError, setRefereeAnalysisError] = useState<string | null>(null);
    const [refereeAnalysisResult, setRefereeAnalysisResult] = useState<RefereeAnalysis | null>(null);

    // State for bet slip analysis
    const [betSlipImage, setBetSlipImage] = useState<File | null>(null);
    const [betSlipPreview, setBetSlipPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<BetSlipAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // State for live voice session
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStatus, setSessionStatus] = useState('Inativo');
    const [conversation, setConversation] = useState<{ speaker: 'user' | 'ai'; text: string }[]>([]);
    
    // State for multi-bet analysis
    const [multiBetLegs, setMultiBetLegs] = useState<BetLeg[]>([{ id: 1, teamA: '', teamB: '', market: AVAILABLE_MARKETS_MULTI[0] }]);
    const [isAnalyzingMultiBet, setIsAnalyzingMultiBet] = useState(false);
    const [multiBetError, setMultiBetError] = useState<string | null>(null);
    const [multiBetResult, setMultiBetResult] = useState<MultiBetAnalysis | null>(null);

    // Refs for live session management
    const sessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const conversationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const stopLiveSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setIsSessionActive(false);
        setSessionStatus('Inativo');
    }, []);

    useEffect(() => {
        return () => {
            stopLiveSession();
        };
    }, [stopLiveSession]);

    const startLiveSession = useCallback(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        try {
            if (isSessionActive) {
                stopLiveSession();
                return;
            }
            setConversation([]);
            setSessionStatus('Conectando...');
            setIsSessionActive(true);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionStatus('Conectado. Fale agora!');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: GenaiBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then(session => {
                                if (session) {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                }
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);

                            const sourceNode = outputAudioContext.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContext.destination);

                            sourceNode.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(sourceNode);
                                if (audioSourcesRef.current.size === 0) {
                                    setSessionStatus('Ouvindo...');
                                }
                            });

                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(sourceNode);
                        }

                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const aiResponse = currentOutputTranscriptionRef.current.trim();

                            setConversation(prev => {
                                const newTurns = [];
                                if (userInput) newTurns.push({ speaker: 'user' as const, text: userInput });
                                if (aiResponse) newTurns.push({ speaker: 'ai' as const, text: aiResponse });
                                return [...prev, ...newTurns];
                            });

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setSessionStatus('Erro');
                        setConversation(prev => [...prev, { speaker: 'ai', text: 'Ocorreu um erro na conexão. A sessão foi encerrada.' }]);
                        stopLiveSession();
                    },
                    onclose: () => {
                        stopLiveSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: LIVE_VOICE_SYSTEM_INSTRUCTION,
                },
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error('Failed to start live session:', error);
            setSessionStatus('Erro');
            setConversation([{ speaker: 'ai', text: 'Não foi possível iniciar a sessão. Verifique as permissões do microfone.' }]);
            setIsSessionActive(false);
        }
    }, [isSessionActive, stopLiveSession]);

    const handleMarketChange = (market: string) => {
        setSelectedMarkets(prev =>
            prev.includes(market)
                ? prev.filter(m => m !== market)
                : [...prev, market]
        );
    };

    const handleFetchData = async () => {
        if (!teamA || !teamB) {
            setGeneratorError('Por favor, preencha os nomes dos dois times para buscar os dados.');
            return;
        }
        setIsFetchingData(true);
        setGeneratorError(null);
        setDeepDiveResult(null);
        setTeamAData(null);
        setTeamBData(null);
        setHeadToHeadData(null);
        try {
            const [dataA, dataB, h2h] = await Promise.all([
                fetchRecentTeamData(teamA),
                fetchRecentTeamData(teamB),
                fetchHeadToHeadData(teamA, teamB),
            ]);
            setTeamAData(dataA);
            setTeamBData(dataB);
            setHeadToHeadData(h2h);
        } catch (err) {
            setGeneratorError('Falha ao buscar os dados recentes. Tente novamente.');
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleGenerateDeepDive = async () => {
        if (!teamA || !teamB || selectedMarkets.length === 0) {
            setGeneratorError('Por favor, preencha os times e selecione ao menos um mercado.');
            return;
        }
        setIsGenerating(true);
        setGeneratorError(null);
        setDeepDiveResult(null);

        const recentData = teamAData && teamBData ? { teamA: teamAData, teamB: teamBData } : undefined;
        const h2hData = headToHeadData ? headToHeadData : undefined;

        try {
            const result = await generateMatchDeepDive(teamA, teamB, sport, selectedMarkets, recentData, h2hData);
            setDeepDiveResult(result);
        } catch (err) {
            setGeneratorError((err as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalyzeReferee = async () => {
        if (!refereeNameToAnalyze.trim()) {
            setRefereeAnalysisError("Por favor, insira o nome do árbitro.");
            return;
        }
        setIsAnalyzingReferee(true);
        setRefereeAnalysisError(null);
        setRefereeAnalysisResult(null);

        try {
            const result = await analyzeReferee(refereeNameToAnalyze);
            setRefereeAnalysisResult(result);
        } catch (err) {
            setRefereeAnalysisError((err as Error).message);
        } finally {
            setIsAnalyzingReferee(false);
        }
    };
    
    const processImageFile = useCallback((file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setBetSlipImage(file);
            if (betSlipPreview) {
                URL.revokeObjectURL(betSlipPreview);
            }
            setBetSlipPreview(URL.createObjectURL(file));
            setAnalysisResult(null);
            setAnalysisError(null);
        } else {
            setAnalysisError("Arquivo inválido. Por favor, envie uma imagem.");
        }
    }, [betSlipPreview]);
    
    useEffect(() => {
        const handleGlobalPaste = (event: ClipboardEvent) => {
            if (activeToolTab !== 'image-analysis') return;
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;
            const items = event.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                        processImageFile(file);
                        event.preventDefault();
                        return;
                    }
                }
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [processImageFile, activeToolTab]);

    useEffect(() => () => { if (betSlipPreview) URL.revokeObjectURL(betSlipPreview) }, [betSlipPreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) processImageFile(e.target.files[0]);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processImageFile(e.dataTransfer.files[0]);
    };

    const handleAnalyzeSlip = async () => {
        if (!betSlipImage) {
            setAnalysisError("Por favor, selecione uma imagem para analisar.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        try {
            const base64Data = await blobToBase64(betSlipImage);
            const imageData = { data: base64Data, mimeType: betSlipImage.type };
            const result = await analyzeBetSlipImage(imageData);
            setAnalysisResult(result);
        } catch (err) {
            setAnalysisError((err as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddMultiBetLeg = () => setMultiBetLegs(prev => [...prev, { id: Date.now(), teamA: '', teamB: '', market: AVAILABLE_MARKETS_MULTI[0] }]);
    const handleRemoveMultiBetLeg = (id: number) => setMultiBetLegs(prev => prev.filter(leg => leg.id !== id));
    const handleMultiBetLegChange = (id: number, field: keyof Omit<BetLeg, 'id'>, value: string) => setMultiBetLegs(prev => prev.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));

    const handleAnalyzeMultiBet = async () => {
        const isValid = multiBetLegs.every(leg => leg.teamA.trim() && leg.teamB.trim());
        if (!isValid) {
            setMultiBetError("Por favor, preencha os nomes dos times para todas as seleções.");
            return;
        }
        setIsAnalyzingMultiBet(true);
        setMultiBetError(null);
        setMultiBetResult(null);
        try {
            const result = await analyzeMultiBet(multiBetLegs);
            setMultiBetResult(result);
        } catch (err) {
            setMultiBetError((err as Error).message);
        } finally {
            setIsAnalyzingMultiBet(false);
        }
    };

    const getTabClass = (tabName: ToolTab) =>
        `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
        activeToolTab === tabName
            ? 'border-brand-accent text-brand-accent'
            : 'border-transparent text-brand-subtle hover:text-brand-text'
        }`;
    
    const renderResult = (isLoading: boolean, error: string | null, resultComponent: React.ReactNode) => (
      <div className="min-h-[200px]">
        {(isLoading || error || resultComponent) && (
          <Card>
            <div className="p-6">
              {isLoading && (
                <div className="flex flex-col justify-center items-center h-48 text-brand-subtle">
                  <Loader size={32} className="animate-spin text-brand-accent" />
                  <p className="mt-4">Analisando com a IA...</p>
                </div>
              )}
              {error && (
                <div className="text-red-400 flex items-start gap-3 p-4 bg-red-900/20 rounded-lg">
                  <ShieldAlert size={20} className="flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Erro na Análise</h4>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              {!isLoading && !error && resultComponent}
            </div>
          </Card>
        )}
      </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-text flex items-center gap-2">
                <BrainCircuit className="text-brand-accent" />
                Painel de Análise - Monkey Tips AI
            </h2>

            <div className="flex flex-wrap border-b border-zinc-700">
                <button onClick={() => setActiveToolTab('deep-dive')} className={getTabClass('deep-dive')}><Gamepad2 size={16} /> Análise de Partida</button>
                <button onClick={() => setActiveToolTab('live-basketball-engine')} className={getTabClass('live-basketball-engine')}><Cpu size={16} /> Motor de Basquete Ao Vivo</button>
                <button onClick={() => setActiveToolTab('multi-bet')} className={getTabClass('multi-bet')}><Layers size={16} /> Análise de Múltipla</button>
                <button onClick={() => setActiveToolTab('image-analysis')} className={getTabClass('image-analysis')}><Camera size={16} /> Bilhete por Imagem</button>
                <button onClick={() => setActiveToolTab('referee')} className={getTabClass('referee')}><Gavel size={16} /> Análise de Árbitro</button>
                <button onClick={() => setActiveToolTab('live-voice')} className={getTabClass('live-voice')}><Mic size={16} /> Analista de Voz (Live)</button>
            </div>

            {activeToolTab === 'deep-dive' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-brand-accent">Análise de Partida (Deep Dive)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="Time da Casa" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                                <input type="text" value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="Time Visitante" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            </div>
                            <div>
                                <label className="text-sm text-brand-subtle mb-2 block">Esporte</label>
                                <select value={sport} onChange={(e) => { setSport(e.target.value as Sport); setSelectedMarkets([]); }} className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                                    {Object.keys(AVAILABLE_MARKETS).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-brand-subtle mb-2 block">Mercados de Interesse</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_MARKETS[sport].map(market => (
                                        <label key={market} className="flex items-center gap-2 text-sm p-2 bg-brand-dark rounded-md cursor-pointer hover:bg-zinc-800">
                                            <input type="checkbox" checked={selectedMarkets.includes(market)} onChange={() => handleMarketChange(market)} className="accent-brand-accent"/>
                                            {market}
                                        </label>
                                    ))}
                                </div>
                            </div>
                             <button onClick={handleFetchData} disabled={isFetchingData} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-zinc-500">
                                {isFetchingData ? <Loader size={20} className="animate-spin" /> : <Database size={20} />}
                                {isFetchingData ? 'Buscando dados...' : '1. Buscar Dados Recentes'}
                            </button>
                            <button onClick={handleGenerateDeepDive} disabled={isGenerating || !teamAData} className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-zinc-500 disabled:text-zinc-400">
                                {isGenerating ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                                {isGenerating ? 'Analisando...' : '2. Gerar Análise'}
                            </button>
                        </div>
                    </Card>
                    {renderResult(isGenerating || isFetchingData, generatorError, <AnalysisResult result={deepDiveResult} type="deep-dive" />)}
                </div>
            )}
            
            {activeToolTab === 'live-basketball-engine' && <LiveBasketballEngine />}
            
            {activeToolTab === 'multi-bet' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-brand-accent mb-4">Análise de Aposta Múltipla</h3>
                            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                                {multiBetLegs.map((leg, index) => (
                                    <div key={leg.id} className="p-3 bg-brand-dark rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-brand-subtle">Seleção {index + 1}</span>
                                            {multiBetLegs.length > 1 && <button onClick={() => handleRemoveMultiBetLeg(leg.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Time A" value={leg.teamA} onChange={e => handleMultiBetLegChange(leg.id, 'teamA', e.target.value)} className="w-full text-sm bg-brand-secondary border border-zinc-700 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                                            <input type="text" placeholder="Time B" value={leg.teamB} onChange={e => handleMultiBetLegChange(leg.id, 'teamB', e.target.value)} className="w-full text-sm bg-brand-secondary border border-zinc-700 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-accent" />
                                        </div>
                                        <select value={leg.market} onChange={e => handleMultiBetLegChange(leg.id, 'market', e.target.value)} className="w-full text-sm bg-brand-secondary border border-zinc-700 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-accent">
                                            {AVAILABLE_MARKETS_MULTI.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddMultiBetLeg} className="w-full flex items-center justify-center gap-2 text-sm border-2 border-dashed border-zinc-600 text-zinc-400 py-2 rounded-lg hover:border-brand-accent hover:text-brand-accent transition-colors mb-4"><PlusCircle size={16}/>Adicionar Seleção</button>
                            <button onClick={handleAnalyzeMultiBet} disabled={isAnalyzingMultiBet} className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-zinc-500">
                                {isAnalyzingMultiBet ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                                {isAnalyzingMultiBet ? 'Analisando...' : 'Analisar Múltipla'}
                            </button>
                        </div>
                    </Card>
                    {renderResult(isAnalyzingMultiBet, multiBetError, <AnalysisResult result={multiBetResult} type="multi-bet" />)}
                </div>
            )}

            {activeToolTab === 'image-analysis' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-brand-accent mb-4">Análise de Bilhete por Imagem</h3>
                            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-accent bg-brand-dark' : 'border-zinc-600 hover:border-zinc-500'}`}>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {betSlipPreview ? (
                                    <img src={betSlipPreview} alt="Pré-visualização do bilhete" className="max-h-60 w-auto object-contain rounded-md" />
                                ) : (
                                    <div className="text-center text-brand-subtle">
                                        <UploadCloud size={48} className="mx-auto mb-2" />
                                        <p className="font-semibold">Arraste e solte a imagem do bilhete aqui</p>
                                        <p className="text-sm">ou clique para selecionar o arquivo</p>
                                        <p className="text-xs mt-2">(ou cole da área de transferência com Ctrl+V)</p>
                                    </div>
                                )}
                            </div>
                            {betSlipPreview && <button onClick={() => { setBetSlipImage(null); setBetSlipPreview(null); }} className="w-full mt-2 text-center text-sm text-red-400 hover:underline">Remover imagem</button>}
                            <button onClick={handleAnalyzeSlip} disabled={isAnalyzing || !betSlipImage} className="w-full mt-4 flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-zinc-500">
                                {isAnalyzing ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                                {isAnalyzing ? 'Analisando...' : 'Analisar Bilhete'}
                            </button>
                        </div>
                    </Card>
                    {renderResult(isAnalyzing, analysisError, <AnalysisResult result={analysisResult} type="image-analysis" />)}
                </div>
            )}
            
            {activeToolTab === 'referee' && (
                 <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-brand-accent mb-4">Análise de Árbitro</h3>
                            <p className="text-sm text-brand-subtle mb-4">Insira o nome completo de um árbitro para gerar um perfil estatístico e de estilo, ideal para mercados de cartões.</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" size={20} />
                                <input type="text" value={refereeNameToAnalyze} onChange={(e) => setRefereeNameToAnalyze(e.target.value)} placeholder="Ex: Wilton Pereira Sampaio" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-accent mb-4"/>
                            </div>
                            <button onClick={handleAnalyzeReferee} disabled={isAnalyzingReferee} className="w-full flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-zinc-500">
                                {isAnalyzingReferee ? <Loader size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                                {isAnalyzingReferee ? 'Analisando...' : 'Gerar Perfil do Árbitro'}
                            </button>
                        </div>
                    </Card>
                    {renderResult(isAnalyzingReferee, refereeAnalysisError, <AnalysisResult result={refereeAnalysisResult} type="referee" />)}
                </div>
            )}
            
            {activeToolTab === 'live-voice' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <h3 className="text-xl font-bold text-brand-accent mb-2">Analista de Voz (Live)</h3>
                            <p className="text-brand-subtle mb-6">Converse em tempo real com a IA para obter insights rápidos.</p>
                            <button onClick={startLiveSession} className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isSessionActive ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
                            </button>
                            <p className="mt-4 text-sm font-semibold text-brand-text h-5">{sessionStatus}</p>
                             <div className="mt-4 p-2 bg-brand-dark/50 rounded-lg text-xs text-brand-subtle text-left flex items-start gap-2">
                                <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-400" />
                                <p><strong>Dica:</strong> Pergunte sobre estatísticas, probabilidades ou peça uma análise rápida de um jogo. Ex: "Qual a probabilidade de mais de 2.5 gols no jogo do Flamengo?"</p>
                             </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-6 h-[60vh] flex flex-col">
                            <h4 className="text-lg font-bold text-brand-text mb-4">Conversa</h4>
                            <div className="flex-grow bg-brand-dark p-3 rounded-lg overflow-y-auto space-y-4">
                                {conversation.map((turn, index) => (
                                    <div key={index} className={`flex gap-2 ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${turn.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-brand-text'}`}>
                                            {turn.text}
                                        </div>
                                    </div>
                                ))}
                                {!conversation.length && (
                                    <div className="flex items-center justify-center h-full text-brand-subtle text-sm">
                                        <p>A transcrição da conversa aparecerá aqui.</p>
                                    </div>
                                )}
                                <div ref={conversationEndRef}></div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default TipsPanel;