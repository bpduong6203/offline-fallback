// Cloudflare Worker: khi server local / Tunnel tắt -> hiện trang chờ có mini game (Flappy Bug, Bi-a, Caro, Ma sói).
import { renderOffline } from './src/page/render.js';
import { handleGameSocket } from './src/game-socket.js';
import miniMotorways from './src/page/games/Mini_Motorways.html';

// Durable Object phải được export từ file entry
export { PoolRoom } from './src/pool-room.js';
export { WolfRoom } from './src/wolf/room.js';

const OFFLINE_STATUS = new Set([502, 503, 504, 521, 522, 523, 524, 530]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/__game/mini-motorways') {
      return new Response(miniMotorways, {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'no-store'
        }
      });
    }
    // Kênh WebSocket cho game online: Worker tự xử lý, không phụ thuộc server local
    if (url.pathname === '/__game/ws') return handleGameSocket(request, env, url);
    try {
      const response = await fetch(request);
      if (OFFLINE_STATUS.has(response.status)) {
        return renderOffline(request);
      }
      return response;
    } catch (error) {
      return renderOffline(request);
    }
  }
};
