import {readFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {serveImage} from '../src/image-assets.js';
import {EGG_ICON_URL} from '../tien-len/egg-asset.js';

// Local-only adapter: a fixed manifest, never a user-controlled filesystem path.
const files = new Map([
  [EGG_ICON_URL.slice('/__assets/'.length), new URL('../tien-len/egg_icon.webp', import.meta.url)]
]);
const bucket = {
  async read(key, withBody) {
    const file = files.get(key);
    if (!file) return null;
    let bytes, info;
    try { [bytes, info] = await Promise.all([readFile(file), stat(file)]); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    return {
      size: bytes.length,
      httpEtag: '"' + createHash('sha256').update(bytes).digest('hex') + '"',
      uploaded: info.mtime,
      writeHttpMetadata(headers) { headers.set('Content-Type', 'image/webp'); },
      body: withBody ? bytes : undefined
    };
  },
  get(key) { return this.read(key, true); },
  head(key) { return this.read(key, false); }
};

export async function localAssets(req, res) {
  const url = new URL(req.url, 'http://' + req.headers.host);
  if (url.pathname !== '/__assets' && !url.pathname.startsWith('/__assets/')) return false;
  const request = new Request(url, {method: req.method, headers: req.headers});
  const response = await serveImage(request, {IMAGES: bucket}, undefined, null);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (response.body) Readable.fromWeb(response.body).pipe(res);
  else res.end();
  return true;
}
