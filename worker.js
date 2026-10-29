// Cloudflare Worker: khi server local / Tunnel tắt -> hiện trang chờ có mini game (Flappy Bug, Bi-a, Caro, Ma sói).
import { renderOffline } from './src/page/render.js';
import { handleGameSocket } from './src/game-socket.js';
import { serveImage } from './src/image-assets.js';
import miniMotorways from './src/page/games/Mini_Motorways.html';
import bangBang from './src/page/games/Bang_Bang.html';
import bombArena from './src/page/games/bomb-arena.generated.js';
import stickmanFight from './src/page/games/stickman-fight.generated.js';
import tienLen from './src/page/games/tien-len.generated.js';
import uno from './src/page/games/uno.generated.js';
import { handleAssetRequest } from './src/asset-handler.js';
import { handleAuthRequest, requireGameLogin, requiresGameLogin } from './src/auth.js';
import monopoly from './src/page/games/mebi-monopoly.generated.js';
import chibiRush from './src/page/games/chibi-rush.html';
import partyCats from './src/page/games/party-cats.html';
import towerCity from './src/page/games/tower-city.html';
export { MonopolyRoom } from './src/monopoly-room.generated.js';
export { ChibiRushRoom } from './src/chibi-rush-room.js';
export { PartyCatsRoom } from './src/party-cats-room.js';

// Durable Object phải được export từ file entry
export { PoolRoom } from './src/pool-room.js';
export { WolfRoom } from './src/wolf/room.js';
export { BombRoom } from './src/bomb-room.js';
export { StickmanRoom } from './src/stickman-room.js';
export { BangBangQueue } from './src/bang-bang-queue.js';
export { TienLenRoom } from './src/tienlen-room.js';
export { UnoRoom } from './src/uno-room.js';

const OFFLINE_STATUS = new Set([502, 503, 504, 521, 522, 523, 524, 530]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auth/')) return handleAuthRequest(request, env);
    if (requiresGameLogin(url) && !(await requireGameLogin(request, env))) {
      if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket' && ['GET', 'HEAD'].includes(request.method)) {
        return Response.redirect(new URL('/', url), 302);
      }
      return new Response('Login required', { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/__assets' || url.pathname.startsWith('/__assets/')) {
      const resp = await serveImage(request, env, ctx);
      if (resp.status === 400 && typeof handleAssetRequest === 'function') {
        const assetResp = await handleAssetRequest(request, env);
        if (assetResp.status !== 404 && assetResp.status !== 403) {
          return assetResp;
        }
      }
      return resp;
    }
    if (['/ty-phu','/ty-phu/','/__game/mebi-monopoly'].includes(url.pathname)) {
      if (!['GET','HEAD'].includes(request.method)) return new Response('Method Not Allowed', {status:405});
      return new Response(request.method==='HEAD'?null:monopoly,{headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'no-store'}});
    }
    if (['/chibi-rush', '/chibi-rush/', '/__game/chibi-rush'].includes(url.pathname)) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : chibiRush, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (['/party-cats', '/party-cats/', '/__game/party-cats'].includes(url.pathname)) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : partyCats, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/__game/party-cats/ws') {
      if ((request.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return new Response('Cần WebSocket', { status: 426 });
      const origin = request.headers.get('Origin');
      if (origin) {
        try { if (new URL(origin).host !== url.host) return new Response('Forbidden', { status: 403 }); }
        catch { return new Response('Forbidden', { status: 403 }); }
      }
      const room = (url.searchParams.get('room') || 'main').toLowerCase().slice(0, 24);
      if (!room) return new Response('Mã phòng không hợp lệ', { status: 400 });
      return env.PARTYCATS.get(env.PARTYCATS.idFromName(room)).fetch(request);
    }
    const decodedPath = decodeURIComponent(url.pathname).toLowerCase();
    if (['/tower-city', '/tower-city/', '/__game/tower-city', '/tower city', '/tower city.html', '/tower-city.html'].includes(decodedPath)) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : towerCity, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/__game/chibi-rush/ws') {
      const origin = request.headers.get('Origin');
      if (origin) {
        try { if (new URL(origin).host !== url.host) return new Response('Forbidden', { status: 403 }); }
        catch { return new Response('Forbidden', { status: 403 }); }
      }
      const code = (url.searchParams.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (!code) return new Response('room?', { status: 400 });
      return env.CHIBIRUSH.get(env.CHIBIRUSH.idFromName(code)).fetch(request);
    }
    if (url.pathname.startsWith('/api/monopoly/')) {
      const origin=request.headers.get('Origin');
      if(origin){try{if(new URL(origin).host!==url.host)return new Response('Forbidden',{status:403});}catch{return new Response('Forbidden',{status:403});}}
      const match=url.pathname.match(/^\/api\/monopoly\/([A-HJ-NP-Z2-9]{6})\/(create|join|resume|socket)$/);
      if(!match)return Response.json({error:'Mã phòng không hợp lệ'},{status:400});
      if(Number(request.headers.get('Content-Length'))>8192)return new Response('Payload too large',{status:413});
      if(['create','join','resume'].includes(match[2])){
        const limiter=env.MONOPOLY.get(env.MONOPOLY.idFromName('rate-limit'));
        const result=await limiter.fetch(new Request('https://internal/internal/monopoly-limit',{method:'POST',body:JSON.stringify({ip:request.headers.get('CF-Connecting-IP')||'unknown',op:match[2]})}));
        if(result.status===429)return Response.json({error:'Thao tác quá nhanh, thử lại sau một phút'},{status:429});
      }
      return env.MONOPOLY.get(env.MONOPOLY.idFromName(match[1])).fetch(request);
    }
    if (url.pathname === '/__game/bang-bang-ws') {
      const origin = request.headers.get('Origin');
      if (origin) {
        try { if (new URL(origin).host !== url.host) return new Response('Forbidden', { status: 403 }); }
        catch { return new Response('Forbidden', { status: 403 }); }
      }
      const requestedMode = Number(url.searchParams.get('mode'));
      const mode = [1, 2, 3].includes(requestedMode) ? requestedMode : 3;
      const queueName = mode === 3 ? 'global-matchmaking' : `global-matchmaking-${mode}v${mode}`;
      const id = env.BANGBANG.idFromName(queueName);
      return env.BANGBANG.get(id).fetch(request);
    }
    if (url.pathname === '/__game/bang-bang') {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : bangBang, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (['/tien-len', '/tien-len/', '/__game/tien-len'].includes(url.pathname)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : tienLen, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
    }
    if (['/uno', '/uno/', '/__game/uno'].includes(url.pathname)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return new Response(request.method === 'HEAD' ? null : uno, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' } });
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
