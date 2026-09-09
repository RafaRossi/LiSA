'use client';

import { useRouter } from 'next/navigation';
import { useState } from "react";
import { customAlphabet } from "nanoid";
import { MenuPanel } from './components/home/MenuPanel';
import { JoinPanel } from './components/home/JoinPanel';
import { CreatePanel } from './components/home/CreatePanel';
import {checkRoomExists, createRoom} from "@/app/room/rooms";

const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

type DetailPanel = 'join' | 'create';

export default function Home() {
  const router = useRouter();

  const [showDetail, setShowDetail] = useState(false);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>('join');

  const [code, setCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  function openDetail(panel: DetailPanel) {
      setDetailPanel(panel);
      setShowDetail(true);
  }

  function backToMenu() {
      setError('');
      setShowDetail(false);
  }

  async function handleStartHosting() {
      const roomId = generateRoomCode();

      setError('');
      setIsLoading(true);

      try{
          const { ok } = await createRoom(roomId, roomName);
          if (ok) {
            router.push(`/room/${roomId}/host`);
            return;
          }
          setError('Não foi possível criar a sala. Tente novamente.');
      } catch {
          setError('Erro de conexão. Tente novamente.');
      } finally {
          setIsLoading(false);
      }
  }

  async function handleJoinByCode() {
      const trimmedCode = code.trim().toUpperCase();
      if (!trimmedCode) return;

      setError('');
      setIsLoading(true);

      try{
          const exists = await checkRoomExists(trimmedCode);
            if (!exists) {
              setError('Sala não encontrada. Confira o código e tente de novo.');
            return;
          }
          router.push(`/room/${trimmedCode}/watch`);
      } catch {
          setError('Erro de conexão. Tente novamente.');
      } finally {
          setIsLoading(false);
      }
  }

  return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-lg h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full bg-zinc-900/80 border border-zinc-800 p-8 pb-4 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col gap-6">
            <div className="relative w-full overflow-hidden" style={{ minHeight: '220px' }}>
                <div
                    className="flex w-full h-full items-center transition-transform duration-500 ease-in-out"
                    style={{
                        transform: showDetail ? 'translateX(-50%)' : 'translateX(0%)',
                        width: '200%',
                    }}
                >
                    <div style={{ flex: '0 0 50%' }} className="flex items-center justify-center h-full">
                        <MenuPanel
                            onCreate={() => openDetail('create')}
                            onJoin={() => openDetail('join')}
                        />
                    </div>
                    <div style={{ flex: '0 0 50%' }} className="flex items-center justify-center h-full">
                        {detailPanel === 'join' ? (
                            <JoinPanel
                                active={showDetail}
                                code={code}
                                setCode={setCode}
                                error={error}
                                isLoading={isLoading}
                                onSubmit={handleJoinByCode}
                                onBack={backToMenu}
                            />
                        ) : (
                            <CreatePanel
                                active={showDetail}
                                roomName={roomName}
                                error={error}
                                isLoading={isLoading}
                                setRoomName={setRoomName}
                                onSubmit={handleStartHosting}
                                onBack={backToMenu}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
  );
}