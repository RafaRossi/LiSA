export async function createRoom(roomCode : string, title : string) : Promise<{ ok: boolean }> {
    const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, title }),
    });

    return { ok: res.ok };
}

export async function checkRoomExists(roomCode: string): Promise<boolean> {
    const res = await fetch(`/api/room-exists?room=${roomCode}`);

    if (!res.ok) {
        throw new Error('Falha ao verificar a sala');
    }

    const { exists } = await res.json();
    return exists;
}