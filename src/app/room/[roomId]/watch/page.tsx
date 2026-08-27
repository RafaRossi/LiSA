'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export default function WatchPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const roomRef = useRef<Room | null>(null);

    const [status, setStatus] = useState('Conectando à transmissão...');
    const [isConnected, setIsConnected] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [needAudioPermission, setNeedAudioPermission] = useState(false);

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function joinRoom() {
            const viewerName = `viewer_${Math.random().toString(36).substring(7)}`;
            const res = await fetch(`/api/token?room=${roomId}&name=${viewerName}&role=viewer`);
            const { token } = await res.json();

            const room = new Room();

            // Detecta se o navegador bloqueou o áudio automático
            room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
                if (!room.canPlaybackAudio) {
                    setNeedAudioPermission(true);
                } else {
                    setNeedAudioPermission(false);
                }
            });

            room.on(RoomEvent.TrackSubscribed, (track) => {
                if (track.kind === Track.Kind.Video && videoRef.current) {
                    track.attach(videoRef.current);
                } else if (track.kind === Track.Kind.Audio && audioRef.current) {
                    track.attach(audioRef.current);
                    audioRef.current.volume = volume;
                    audioRef.current.muted = isMuted;

                    // Tenta iniciar a reprodução do áudio e captura bloqueio de autoplay
                    if (!room.canPlaybackAudio) {
                        setNeedAudioPermission(true);
                    }
                }
            });

            room.on(RoomEvent.TrackUnsubscribed, (track) => {
                track.detach();
            });

            room.on(RoomEvent.Disconnected, () => {
                setStatus('A transmissão foi encerrada.');
                setIsConnected(false);
            });

            await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

            if (!isMounted) {
                room.disconnect();
                return;
            }

            roomRef.current = room;
            setIsConnected(true);
            setStatus('Aguardando o host transmitir...');
        }

        joinRoom().catch((err) => {
            console.error(err);
            setStatus('Erro ao conectar: ' + err.message);
        });

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            isMounted = false;
            roomRef.current?.disconnect();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [roomId]);

    // Libera o áudio travado pelo navegador após clique do usuário
    async function handleEnableAudio() {
        if (roomRef.current) {
            await roomRef.current.startAudio();
            setNeedAudioPermission(false);
        }
    }

    function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            const shouldMute = newVolume === 0;
            audioRef.current.muted = shouldMute;
            setIsMuted(shouldMute);
        }

        if (needAudioPermission) {
            handleEnableAudio();
        }
    }

    function toggleMute() {
        if (!audioRef.current) return;

        if (needAudioPermission) {
            handleEnableAudio();
        }

        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        audioRef.current.muted = nextMuted;

        if (!nextMuted && volume === 0) {
            setVolume(0.5);
            audioRef.current.volume = 0.5;
        }
    }

    function toggleFullscreen() {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error('Erro ao ativar tela cheia:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
            <audio ref={audioRef} autoPlay />

            <div className="max-w-5xl w-full flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    <h1 className="text-lg font-bold">Assistindo Transmissão</h1>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xs text-zinc-400">{status}</span>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="relative group w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center"
                >
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

                    {/* Botão de aviso para liberar Autoplay do áudio se o navegador bloquear */}
                    {needAudioPermission && (
                        <button
                            onClick={handleEnableAudio}
                            className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-indigo-400/30 backdrop-blur-md animate-bounce cursor-pointer z-20"
                        >
                            🔊 Clique aqui para ativar o áudio da transmissão
                        </button>
                    )}

                    {/* Overlay de Controles */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3 bg-zinc-900/80 px-3 py-2 rounded-xl border border-zinc-700/50 backdrop-blur-md">
                            <button
                                onClick={toggleMute}
                                className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title={isMuted ? 'Desmutar' : 'Mutar'}
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : volume < 0.5 ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.314M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                )}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 sm:w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                            />
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2.5 rounded-xl border border-zinc-700/50 backdrop-blur-md cursor-pointer flex items-center gap-2 text-xs font-medium shadow-lg transition-colors"
                            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        >
                            {isFullscreen ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 4l5 5m0 0l-5 0m5 0l0-5M9 15l-5 5m0 0l5 0m-5 0l0-5m11-10l5-5m0 0l-5 0m5 0l0 5" />
                                    </svg>
                                    <span className="hidden sm:inline">Sair</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                    <span className="hidden sm:inline">Tela Cheia</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}