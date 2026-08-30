'use client';

import { useRouter } from 'next/navigation';
import { useState } from "react";
import { customAlphabet } from "nanoid";

const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

export default function Home() {
  const router = useRouter();

  const [view, setView] = useState<'menu' | 'join'>('menu');
  const [code, setCode] = useState('');

  const [error, setError] = useState('');

  function handleStartHosting() {
    const roomId = generateRoomCode();
    router.push(`/room/${roomId}/host`);
  }

  async function handleJoinByCode(){
    const trimmedCode = code.trim().toUpperCase();
    if(!trimmedCode) return;

    setError('');

    const res = await fetch(`api/room-exists?room=${trimmedCode}`);
    const { exists } = await res.json();

    if (!exists) {
      setError('Sala não encontrada. Confira o código e tente de novo.');
      return;
    }

    router.push(`/room/${trimmedCode}/watch`);
  }

  return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-128 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full bg-zinc-900/80 border border-zinc-800 p-8 pb-4 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col gap-6">

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              LiSA
            </h1>
            <p className="text-zinc-400 text-md">
              Compartilhe sua tela instantaneamente sem complicações.
            </p>
          </div>
          <div
              className="relative w-full overflow-hidden transition-[height] duration-500 ease-in-out"
          >
            <div
                className="flex w-full transition-transform duration-500 ease-in-out items-center"
                style={{ transform: view === 'menu' ? 'translateX(0%)' : 'translateX(-50%)', width: '200%' }}
            >
              <div className="w-full flex flex-col  px-1" style={{flex: '0 0 50%'}}>
                <button
                    onClick={handleStartHosting}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Iniciar Transmissão
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="h-px bg-zinc-800 flex-1"></div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Ou</span>
                  <div className="h-px bg-zinc-800 flex-1"></div>
                </div>

                <button
                    onClick={() => { setView('join'); setError(''); }}
                    className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold border border-zinc-700 rounded-xl shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Entrar com Código
                </button>
              </div>

              <div className="w-full flex flex-col gap-3 px-1" style={{flex: '0 0 50%'}}>
                <input
                    autoFocus={view === 'join'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
                    placeholder="Digite o código"
                    className="w-full py-3 px-4 bg-zinc-950/50 border border-zinc-700 rounded-xl placeholder-zinc-500 text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all"
                />

                <p className={`text-red-400 text-sm ${error ? 'visible' : 'visible'}`}>
                  {error || 'placeholder'}
                </p>

                <button
                    onClick={handleJoinByCode}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-95 cursor-pointer mt-1"
                >
                  Entrar na Sala
                </button>

                <button
                    onClick={() => setView('menu')}
                    className="w-full py-2 text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
  );
}