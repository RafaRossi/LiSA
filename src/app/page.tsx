'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  function handleStartHosting() {
    const roomId = crypto.randomUUID();
    router.push(`/room/${roomId}/host`);
  }

  return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Live Streaming App
            </h1>
            <p className="text-zinc-400 text-sm">
              Compartilhe sua tela instantaneamente sem complicações.
            </p>
          </div>

          <button
              onClick={handleStartHosting}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Iniciar Transmissão
          </button>
        </div>
      </main>
  );
}