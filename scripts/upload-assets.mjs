import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const BUCKET = 'offline-fallback-images';
const ASSETS_DIR = path.resolve('assets');

const MIME_MAP = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const files = readdirSync(ASSETS_DIR);
console.log(`Đang tải ${files.length} tệp ảnh lên Cloudflare R2 bucket: "${BUCKET}"...\n`);

let successCount = 0;
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  const filePath = path.join(ASSETS_DIR, file).replace(/\\/g, '/');
  const cmd = `npx.cmd -y wrangler r2 object put ${BUCKET}/${file} --file="${filePath}" --content-type="${mime}" --remote`;
  
  console.log(`⏳ Đang tải: ${file} (${mime})...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    successCount++;
  } catch (err) {
    console.error(`❌ Lỗi khi tải ${file}:`, err.message);
  }
}

console.log(`\n🎉 Hoàn thành: ${successCount}/${files.length} ảnh đã được đưa lên R2!`);
