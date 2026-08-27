'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {Room, Track, LocalTrackPublication, ConnectionState} from 'livekit-client';

export default function HostPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const roomRef = useRef<Room | null>(null);
    const publicationsRef = useRef<LocalTrackPublication[]>([]);

    const [status, setStatus] = useState('Conectando...');
    const [shareUrl, setShareUrl] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function connectToRoom() {
            const res = await fetch(`/api/token?room=${roomId}&name=host&role=host`);
            const { token } = await res.json();

            const room = new Room();
            await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

            if (!isMounted) {
                room.disconnect();
                return;
            }

            roomRef.current = room;
            setStatus('Pronto para transmitir');
            setShareUrl(`${window.location.origin}/room/${roomId}/watch`);
        }

        connectToRoom().catch((err) => {
            console.error(err);
            setStatus('Erro ao conectar: ' + err.message);
        });

        return () => {
            isMounted = false;
            roomRef.current?.disconnect();
            roomRef.current = null;
        };
    }, [roomId]);

    async function handleStartSharing() {
        const room = roomRef.current;

        if (!room || room.state !== ConnectionState.Connected) {
            setStatus('Aguarde a conexão com a sala ser estabelecida...');
            return;
        }

        try {
            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true,
                });
            } catch (err: any) {
                if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    console.warn('Áudio do sistema indisponível. Iniciando apenas vídeo...');
                    mediaStream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false,
                    });
                } else {
                    throw err;
                }
            }

            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                const videoPub = await room.localParticipant.publishTrack(videoTrack, {
                    source: Track.Source.ScreenShare,
                });
                publicationsRef.current.push(videoPub);

                videoTrack.addEventListener('ended', () => {
                    handleStopSharing();
                });
            }

            const audioTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack) {
                try {
                    const audioPub = await room.localParticipant.publishTrack(audioTrack, {
                        source: Track.Source.ScreenShareAudio,
                    });
                    publicationsRef.current.push(audioPub);
                } catch (audioErr) {
                    console.warn('Não foi possível publicar o áudio:', audioErr);
                }
            }

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setIsSharing(true);
            setStatus('Transmitindo ao vivo!');
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setStatus('Compartilhamento de tela cancelado por você.');
            } else {
                console.error(err);
                setStatus('Erro ao iniciar transmissão: ' + err.message);
            }
        }
    }

    function handleStopSharing() {
        const room = roomRef.current;
        if (!room) return;

        publicationsRef.current.forEach((pub) => {
            const track = pub.track;
            if (track) {
                room.localParticipant.unpublishTrack(track);
                track.stop();
            }
        });
        publicationsRef.current = [];

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsSharing(false);
        setStatus('Compartilhamento encerrado');
    }

    function copyLink() {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full flex flex-col gap-6">

                {/* Header com Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Painel do Host</h1>
                        <p className="text-xs text-zinc-400">Sala: {roomId}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-950/60 px-3 py-1.5 rounded-full border border-zinc-800">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSharing ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-xs font-medium text-zinc-300">{status}</span>
                    </div>
                </div>

                {/* Área do Link de Compartilhamento */}
                {shareUrl && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                        <span className="text-sm text-zinc-400 whitespace-nowrap">Link dos Espectadores:</span>
                        <div className="flex w-full gap-2">
                            <input
                                readOnly
                                value={shareUrl}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyLink}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                            >
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        {!isSharing ? (
                            <button
                                onClick={handleStartSharing}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                            >
                                Compartilhar tela
                            </button>
                        ) : (
                            <button
                                onClick={handleStopSharing}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 font-semibold rounded-lg text-sm transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
                            >
                                Parar de compartilhar
                            </button>
                        )}
                    </div>

                    <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center shadow-2xl">
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-contain" />
                        {!isSharing && (
                            <div className="absolute text-zinc-500 text-sm font-medium">
                                Nenhuma tela sendo compartilhada no momento
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}