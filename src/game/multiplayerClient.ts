import { CharacterAppearance } from './stage1Data';

export interface PublicRoomSummary {
  code: string;
  name: string;
  isPublic: boolean;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  stage: 1 | 2 | 3;
  createdAt: number;
}

export interface RemotePlayerSnapshot {
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
  appearance: Partial<CharacterAppearance>;
}

export interface MultiplayerChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  presetId?: string;
  timestamp: number;
}

export interface MultiplayerSessionSnapshot {
  connectionStatus: 'offline' | 'connecting' | 'connected';
  clientId: string | null;
  room: PublicRoomSummary | null;
  hostClientId: string | null;
  members: RemotePlayerSnapshot[];
  chatMessages: MultiplayerChatMessage[];
  lastError: string | null;
}

export const SAFE_QUICK_CHAT_PRESETS = [
  { id: 'greet', label: 'Halo semuanya!', text: 'Halo semuanya! Mari bangun Nusantara!' },
  { id: 'stage2', label: 'Ayo ke Kota Industri', text: 'Ayo naik kapal menuju Kota Industri Stage 2!' },
  { id: 'stage3', label: 'Ayo ke Kota Digital!', text: 'Ayo naik Kereta Cepat menuju Kota Digital Stage 3!' },
  { id: 'factory', label: 'Produksi siap!', text: 'Pabrik & rantai pasok sudah berjalan lancar!' },
  { id: 'photo', label: 'Ayo pose foto!', text: 'Ayo kumpul di Menara Nusantara dan berpose bersama!' },
];

export const SAFE_EMOTE_OPTIONS = [
  { id: 'wave', label: 'Lambaikan Tangan' },
  { id: 'cheer', label: 'Sorak Semangat' },
  { id: 'pose', label: 'Pose Pemimpin' },
];

export function buildRoomInviteUrl(code: string): string {
  if (typeof window === 'undefined') return `?room=${code}`;
  const url = new URL(window.location.href);
  url.searchParams.set('room', code);
  return url.toString();
}

export function extractRoomCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const code = new URLSearchParams(window.location.search).get('room');
  return code ? code.trim().toUpperCase() : null;
}

export class NusantaraMultiplayerClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<(snap: MultiplayerSessionSnapshot) => void>();
  private snapshot: MultiplayerSessionSnapshot = {
    connectionStatus: 'offline',
    clientId: null,
    room: null,
    hostClientId: null,
    members: [],
    chatMessages: [],
    lastError: null,
  };
  private pendingAction: (() => void) | null = null;

  public subscribe(fn: (snap: MultiplayerSessionSnapshot) => void): () => void {
    this.listeners.add(fn);
    fn(this.snapshot);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getSnapshot(): MultiplayerSessionSnapshot {
    return this.snapshot;
  }

  private emit(patch: Partial<MultiplayerSessionSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const fn of this.listeners) fn(this.snapshot);
  }

  public async fetchPublicRooms(): Promise<PublicRoomSummary[]> {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) return [];
      const data = (await res.json()) as { rooms?: PublicRoomSummary[] };
      return data.rooms ?? [];
    } catch {
      return [];
    }
  }

  private ensureSocket(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('WebSocket tidak tersedia.'));
    }

    return new Promise((resolve, reject) => {
      this.emit({ connectionStatus: 'connecting', lastError: null });
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      const timeout = window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          this.emit({
            connectionStatus: 'offline',
            lastError: 'Server multiplayer tidak terjangkau. Berjalan di Mode Solo Offline.',
          });
          reject(new Error('Connection timeout'));
        }
      }, 3500);

      socket.onopen = () => {
        window.clearTimeout(timeout);
        this.emit({ connectionStatus: 'connected', lastError: null });
        if (this.pendingAction) {
          const act = this.pendingAction;
          this.pendingAction = null;
          act();
        }
        resolve();
      };

      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as Record<string, unknown>;
          this.handleServerMessage(msg);
        } catch {
          // ignore malformed packet
        }
      };

      socket.onerror = () => {
        window.clearTimeout(timeout);
        this.emit({
          connectionStatus: 'offline',
          lastError: 'Koneksi multiplayer terganggu. Beralih ke Mode Solo Offline.',
        });
        reject(new Error('WebSocket error'));
      };

      socket.onclose = () => {
        window.clearTimeout(timeout);
        this.ws = null;
        this.emit({
          connectionStatus: 'offline',
          room: null,
          members: [],
          hostClientId: null,
        });
      };
    });
  }

  private handleServerMessage(msg: Record<string, unknown>) {
    const type = msg.type;
    if (type === 'session:ready' && typeof msg.clientId === 'string') {
      this.emit({ clientId: msg.clientId });
      return;
    }

    if (type === 'room:joined') {
      this.emit({
        connectionStatus: 'connected',
        clientId: typeof msg.clientId === 'string' ? msg.clientId : this.snapshot.clientId,
        room: (msg.room as PublicRoomSummary) ?? null,
        hostClientId: typeof msg.hostClientId === 'string' ? msg.hostClientId : null,
        members: Array.isArray(msg.members) ? (msg.members as RemotePlayerSnapshot[]) : [],
        chatMessages: Array.isArray(msg.chatHistory)
          ? (msg.chatHistory as MultiplayerChatMessage[])
          : [],
        lastError: null,
      });
      return;
    }

    if (type === 'room:left') {
      this.emit({ room: null, members: [], hostClientId: null, chatMessages: [] });
      return;
    }

    if (type === 'player:joined' || type === 'player:left') {
      this.emit({
        hostClientId:
          typeof msg.hostClientId === 'string' ? msg.hostClientId : this.snapshot.hostClientId,
        members: Array.isArray(msg.members)
          ? (msg.members as RemotePlayerSnapshot[])
          : this.snapshot.members,
      });
      return;
    }

    if (type === 'player:updated' && msg.player) {
      const updated = msg.player as RemotePlayerSnapshot;
      const exists = this.snapshot.members.some((m) => m.id === updated.id);
      const members = exists
        ? this.snapshot.members.map((m) => (m.id === updated.id ? updated : m))
        : [...this.snapshot.members, updated];
      this.emit({ members });
      return;
    }

    if (type === 'chat:message' && msg.message) {
      const chat = msg.message as MultiplayerChatMessage;
      this.emit({
        chatMessages: [...this.snapshot.chatMessages.slice(-49), chat],
      });
      return;
    }

    if (type === 'error' && typeof msg.message === 'string') {
      this.emit({ lastError: msg.message });
    }
  }

  public async createRoom(opts: {
    roomName: string;
    isPublic: boolean;
    player: Omit<RemotePlayerSnapshot, 'id'>;
  }): Promise<boolean> {
    try {
      await this.ensureSocket();
      this.ws?.send(
        JSON.stringify({
          type: 'room:create',
          roomName: opts.roomName,
          isPublic: opts.isPublic,
          player: opts.player,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  public async joinRoom(opts: {
    code: string;
    player: Omit<RemotePlayerSnapshot, 'id'>;
  }): Promise<boolean> {
    try {
      await this.ensureSocket();
      this.ws?.send(
        JSON.stringify({
          type: 'room:join',
          code: opts.code.trim().toUpperCase(),
          player: opts.player,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  public leaveRoom(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'room:leave' }));
    }
    this.emit({ room: null, members: [], hostClientId: null, chatMessages: [] });
  }

  public disconnectToOffline(): void {
    this.ws?.close();
    this.ws = null;
    this.emit({
      connectionStatus: 'offline',
      room: null,
      members: [],
      hostClientId: null,
      chatMessages: [],
      lastError: null,
    });
  }

  public sendPlayerUpdate(player: Omit<RemotePlayerSnapshot, 'id'>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.snapshot.room) return;
    this.ws.send(JSON.stringify({ type: 'player:update', player }));
  }

  public sendChat(text: string, presetId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.snapshot.room) return;
    const clean = text.trim();
    if (!clean) return;
    this.ws.send(JSON.stringify({ type: 'chat:send', text: clean, presetId }));
  }
}
