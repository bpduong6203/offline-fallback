import { head } from './head.js';
import { styleBase } from './style-base.js';
import { styleWolf } from './style-wolf.js';
import { styleSword } from './style-sword.js';
import { stylePlayed } from './style-played.js';
import { body } from './body.js';
import { clientCore } from './client/core.js';
import { clientFlappy } from './client/flappy.js';
import { clientPool } from './client/pool.js';
import { clientCaro } from './client/caro.js';
import { clientSword } from './client/sword.js';
import { clientWolf } from './client/wolf-ui.js';
import { clientPlayed } from './client/played.js';
import { clientMain } from './client/main.js';

export function renderOffline(request) {
  const accept = request.headers.get('Accept') || '';
  const isPageLoad = request.method === 'GET' && accept.includes('text/html');

  // API / ảnh / JS / CSS / ping: trả 503 thuần, không trả HTML
  if (!isPageLoad) {
    return new Response('Service Unavailable', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Retry-After': '10',
        'Cache-Control': 'no-store'
      }
    });
  }

  const hostname = new URL(request.url).hostname.replace(/[^a-zA-Z0-9.\-:]/g, '');

  // Ghép trang từ các module nhỏ (head, CSS, body, các đoạn script theo game).
  const html = head(hostname) + styleBase + styleWolf + styleSword + stylePlayed + body(hostname) +
    clientCore + clientFlappy + clientPool + clientCaro + clientSword + clientWolf + clientPlayed + clientMain;


  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Retry-After': '10',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}
