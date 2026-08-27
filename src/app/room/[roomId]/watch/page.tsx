'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export default function WatchPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const roomRef = useRef<Room | null>(null);

    const [status, setStatus] = useState('Conectando à transmissão...');
    const [isConnected, setIsConnected] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function joinRoom() {
            const viewerName = `viewer_${Math.random().toString(36).substring(7)}`;
            const res = await fetch(`/api/token?room=${roomId}&name=${viewerName}&role=viewer`);
            const { token } = await res.json();

            const room = new Room();

            room.on(RoomEvent.TrackSubscribed, (track) => {
                if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
                    if (videoRef.current) {
                        track.attach(videoRef.current);
                    }
                }
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
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    <button
                        onClick={toggleFullscreen}
                        className="absolute bottom-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-white p-2.5 rounded-xl border border-zinc-700/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs font-medium shadow-lg"
                        title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                    >
                        {isFullscreen ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 4l5 5m0 0l-5 0m5 0l0-5M9 15l-5 5m0 0l5 0m-5 0l0-5m11-10l5-5m0 0l-5 0m5 0l0 5" />
                                </svg>
                                <span>Sair</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span>Tela Cheia</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}