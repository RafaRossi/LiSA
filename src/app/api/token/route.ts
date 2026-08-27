import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const room = request.nextUrl.searchParams.get('room');
    const name = request.nextUrl.searchParams.get('name');
    const role = request.nextUrl.searchParams.get('role');

    if (!name || !room) {
        return NextResponse.json({ error: 'faltando parâmetros' }, { status: 400 });
    }

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: name }
    );

    at.addGrant({
        room: room,
        roomJoin: true,
        canPublish: role === 'host',
        canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token });
}