import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MAX_PLAYERS_PER_ROOM = 12;

export interface RemoteAvatarPayload {
  id: string;
  name: string;
  titleId: string;
  stage: 1 | 2 | 3;
  x: number;
  y: number;
  z: number;
  facingYaw: number;
  speed: number;
  grounded: boolean;
  ridingKind: string | null;
  emote: string | null;
  appearance: Record<string, string>;
}

interface RoomMember {
  clientId: string;
  ws: WebSocket;
  player: RemoteAvatarPayload;
}

interface MultiplayerRoom {
  code: string;
  name: string;
  isPublic: boolean;
  hostClientId: string;
  createdAt: number;
  members: Map<string, RoomMember>;
  chatHistory: {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    presetId?: string;
    timestamp: number;
  }[];
}

const rooms = new Map<string, MultiplayerRoom>();

function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, maxLen);
}

function safeSend(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToRoom(room: MultiplayerRoom, payload: unknown, excludeClientId?: string): void {
  const encoded = JSON.stringify(payload);
  for (const [cid, member] of room.members.entries()) {
    if (excludeClientId && cid === excludeClientId) continue;
    if (member.ws.readyState === WebSocket.OPEN) {
      member.ws.send(encoded);
    }
  }
}

function serializeRoomSummary(room: MultiplayerRoom) {
  const host = room.members.get(room.hostClientId);
  return {
    code: room.code,
    name: room.name,
    isPublic: room.isPublic,
    hostName: host?.player.name ?? 'Wali Kota',
    playerCount: room.members.size,
    maxPlayers: MAX_PLAYERS_PER_ROOM,
    stage: host?.player.stage ?? 1,
    createdAt: room.createdAt,
  };
}

function serializeRoomMembers(room: MultiplayerRoom): RemoteAvatarPayload[] {
  return Array.from(room.members.values()).map((m) => m.player);
}

function leaveCurrentRoom(clientId: string, currentRoomCode: string | null): string | null {
  if (!currentRoomCode) return null;
  const room = rooms.get(currentRoomCode);
  if (!room) return null;
  const leaving = room.members.get(clientId);
  room.members.delete(clientId);
  if (room.members.size === 0) {
    rooms.delete(currentRoomCode);
  } else {
    if (room.hostClientId === clientId) {
      const nextHost = room.members.keys().next().value;
      if (nextHost) room.hostClientId = nextHost;
    }
    broadcastToRoom(room, {
      type: 'player:left',
      clientId,
      playerName: leaving?.player.name ?? 'Pemain',
      hostClientId: room.hostClientId,
      members: serializeRoomMembers(room),
    });
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mode: 'multiplayer-ws-ready',
      activeRooms: rooms.size,
      timestamp: Date.now(),
    });
  });

  app.get('/api/rooms', (_req, res) => {
    const publicRooms = Array.from(rooms.values())
      .filter((r) => r.isPublic && r.members.size > 0)
      .map(serializeRoomSummary);
    res.json({ rooms: publicRooms });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientId = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    let activeRoomCode: string | null = null;

    safeSend(ws, { type: 'session:ready', clientId });

    ws.on('message', (rawBuf) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(rawBuf.toString('utf8')) as Record<string, unknown>;
      } catch {
        safeSend(ws, { type: 'error', message: 'Format pesan tidak valid.' });
        return;
      }

      const type = msg.type;
      if (typeof type !== 'string') return;

      if (type === 'room:create') {
        activeRoomCode = leaveCurrentRoom(clientId, activeRoomCode);
        const roomName = sanitizeText(msg.roomName, 36) || 'Kota Nusantara Bersama';
        const isPublic = msg.isPublic !== false;
        const playerInput = (msg.player as Partial<RemoteAvatarPayload>) ?? {};
        const player: RemoteAvatarPayload = {
          id: clientId,
          name: sanitizeText(playerInput.name, 24) || 'Wali Kota Muda',
          titleId: sanitizeText(playerInput.titleId, 40) || 'title-wali-pemula',
          stage: playerInput.stage === 3 ? 3 : playerInput.stage === 2 ? 2 : 1,
          x: Number(playerInput.x) || -7.5,
          y: Number(playerInput.y) || 0,
          z: Number(playerInput.z) || 0.4,
          facingYaw: Number(playerInput.facingYaw) || 0,
          speed: 0,
          grounded: true,
          ridingKind: null,
          emote: null,
          appearance: (playerInput.appearance as Record<string, string>) ?? {},
        };

        const code = generateRoomCode();
        const room: MultiplayerRoom = {
          code,
          name: roomName,
          isPublic,
          hostClientId: clientId,
          createdAt: Date.now(),
          members: new Map([[clientId, { clientId, ws, player }]]),
          chatHistory: [],
        };
        rooms.set(code, room);
        activeRoomCode = code;

        safeSend(ws, {
          type: 'room:joined',
          clientId,
          room: serializeRoomSummary(room),
          hostClientId: room.hostClientId,
          members: serializeRoomMembers(room),
          chatHistory: room.chatHistory,
        });
        return;
      }

      if (type === 'room:join') {
        const rawCode = sanitizeText(msg.code, 10).toUpperCase();
        const room = rooms.get(rawCode);
        if (!room) {
          safeSend(ws, { type: 'error', message: `Ruang dengan kode "${rawCode}" tidak ditemukan.` });
          return;
        }
        if (room.members.size >= MAX_PLAYERS_PER_ROOM && !room.members.has(clientId)) {
          safeSend(ws, { type: 'error', message: 'Ruang sudah penuh (maksimal 12 pemain).' });
          return;
        }

        if (activeRoomCode && activeRoomCode !== rawCode) {
          activeRoomCode = leaveCurrentRoom(clientId, activeRoomCode);
        }

        const playerInput = (msg.player as Partial<RemoteAvatarPayload>) ?? {};
        const player: RemoteAvatarPayload = {
          id: clientId,
          name: sanitizeText(playerInput.name, 24) || 'Penjelajah Nusantara',
          titleId: sanitizeText(playerInput.titleId, 40) || 'title-wali-pemula',
          stage: playerInput.stage === 3 ? 3 : playerInput.stage === 2 ? 2 : 1,
          x: Number(playerInput.x) || -7.5,
          y: Number(playerInput.y) || 0,
          z: Number(playerInput.z) || 0.4,
          facingYaw: Number(playerInput.facingYaw) || 0,
          speed: 0,
          grounded: true,
          ridingKind: null,
          emote: null,
          appearance: (playerInput.appearance as Record<string, string>) ?? {},
        };

        room.members.set(clientId, { clientId, ws, player });
        activeRoomCode = rawCode;

        safeSend(ws, {
          type: 'room:joined',
          clientId,
          room: serializeRoomSummary(room),
          hostClientId: room.hostClientId,
          members: serializeRoomMembers(room),
          chatHistory: room.chatHistory,
        });

        broadcastToRoom(
          room,
          {
            type: 'player:joined',
            player,
            hostClientId: room.hostClientId,
            members: serializeRoomMembers(room),
          },
          clientId
        );
        return;
      }

      if (type === 'room:leave') {
        activeRoomCode = leaveCurrentRoom(clientId, activeRoomCode);
        safeSend(ws, { type: 'room:left' });
        return;
      }

      if (type === 'player:update' && activeRoomCode) {
        const room = rooms.get(activeRoomCode);
        const member = room?.members.get(clientId);
        if (!room || !member) return;

        const patch = (msg.player as Partial<RemoteAvatarPayload>) ?? {};
        member.player = {
          ...member.player,
          name: sanitizeText(patch.name, 24) || member.player.name,
          titleId: sanitizeText(patch.titleId, 40) || member.player.titleId,
          stage: patch.stage === 3 ? 3 : patch.stage === 2 ? 2 : 1,
          x: typeof patch.x === 'number' && Number.isFinite(patch.x) ? patch.x : member.player.x,
          y: typeof patch.y === 'number' && Number.isFinite(patch.y) ? patch.y : member.player.y,
          z: typeof patch.z === 'number' && Number.isFinite(patch.z) ? patch.z : member.player.z,
          facingYaw:
            typeof patch.facingYaw === 'number' && Number.isFinite(patch.facingYaw)
              ? patch.facingYaw
              : member.player.facingYaw,
          speed: typeof patch.speed === 'number' ? patch.speed : 0,
          grounded: patch.grounded !== false,
          ridingKind: typeof patch.ridingKind === 'string' ? patch.ridingKind : null,
          emote: typeof patch.emote === 'string' ? sanitizeText(patch.emote, 24) : null,
          appearance:
            patch.appearance && typeof patch.appearance === 'object'
              ? (patch.appearance as Record<string, string>)
              : member.player.appearance,
        };

        broadcastToRoom(
          room,
          {
            type: 'player:updated',
            player: member.player,
          },
          clientId
        );
        return;
      }

      if (type === 'chat:send' && activeRoomCode) {
        const room = rooms.get(activeRoomCode);
        const member = room?.members.get(clientId);
        if (!room || !member) return;

        const text = sanitizeText(msg.text, 160);
        if (!text) return;
        const chatItem = {
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          senderId: clientId,
          senderName: member.player.name,
          text,
          presetId: typeof msg.presetId === 'string' ? sanitizeText(msg.presetId, 24) : undefined,
          timestamp: Date.now(),
        };
        room.chatHistory = [...room.chatHistory.slice(-39), chatItem];
        broadcastToRoom(room, { type: 'chat:message', message: chatItem });
      }
    });

    ws.on('close', () => {
      activeRoomCode = leaveCurrentRoom(clientId, activeRoomCode);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Nusantara Tycoon server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
