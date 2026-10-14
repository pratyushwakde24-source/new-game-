export interface RoomPlayer {
  id: string;
  username: string;
  isHost: boolean;
  ready: boolean;
  score: number;
  health: number;
  lastPing: number;
}

export interface Room {
  id: string;
  code: string;
  seed: number;
  mode: string;
  status: 'lobby' | 'countdown' | 'in_game' | 'results';
  createdAt: number;
  players: Map<string, RoomPlayer>;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  public createRoom(hostId: string, hostUsername: string, mode = 'friend'): Room {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const seed = Math.floor(Math.random() * 1000000);
    const room: Room = {
      id: 'room_' + Date.now(),
      code,
      seed,
      mode,
      status: 'lobby',
      createdAt: Date.now(),
      players: new Map(),
    };

    room.players.set(hostId, {
      id: hostId,
      username: hostUsername,
      isHost: true,
      ready: true,
      score: 0,
      health: 3,
      lastPing: Date.now(),
    });

    this.rooms.set(code, room);
    return room;
  }

  public joinRoom(code: string, playerId: string, username: string): Room | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (room.players.size >= 4) return null; // Room full

    room.players.set(playerId, {
      id: playerId,
      username,
      isHost: false,
      ready: false,
      score: 0,
      health: 3,
      lastPing: Date.now(),
    });

    return room;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public setPlayerReady(code: string, playerId: string, ready: boolean): boolean {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return false;
    const player = room.players.get(playerId);
    if (!player) return false;
    player.ready = ready;

    // Check if all players ready
    let allReady = true;
    room.players.forEach((p) => {
      if (!p.ready) allReady = false;
    });

    if (allReady && room.players.size >= 2) {
      room.status = 'countdown';
    }

    return true;
  }
}

export const roomManager = new RoomManager();
