// Cloudflare Worker: khi server local / Tunnel tắt -> hiện trang chờ có mini game (Flappy Bug, Bi-a, Caro, Ma sói).
import { renderOffline } from './src/page/render.js';
import { handleGameSocket } from './src/game-socket.js';
import miniMotorways from './src/page/games/Mini_Motorways.html';
import bombArena from './src/page/games/bomb-arena.generated.js';
import stickmanFight from './src/page/games/stickman-fight.generated.js';
import tienLen from './src/page/games/tien-len.generated.js';

// Durable Object phải được export từ file entry
export { PoolRoom } from './src/pool-room.js';
export { WolfRoom } from './src/wolf/room.js';
export { BombRoom } from './src/bomb-room.js';
export { StickmanRoom } from './src/stickman-room.js';
export { TienLenRoom } from './src/tienlen-room.js';

const OFFLINE_STATUS = new Set([502, 503, 504, 521, 522, 523, 524, 530]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (['/tien-len', '/tien-len/', '/__game/tien-len'].includes(url.pathname)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : tienLen, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (['/stickman-fight', '/stickman-fight/', '/__game/stickman-fight'].includes(url.pathname)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : stickmanFight, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/__game/bomb-arena') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      }
      return new Response(request.method === 'HEAD' ? null : bombArena, {
        headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }
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
