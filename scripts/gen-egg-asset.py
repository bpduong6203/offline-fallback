import hashlib
from PIL import Image
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_img = os.path.join(root, 'egg_currency.png')
out_webp = os.path.join(root, 'tien-len', 'egg_icon.webp')
out_js = os.path.join(root, 'tien-len', 'egg-asset.js')

im = Image.open(src_img)
im.thumbnail((160, 160), Image.Resampling.LANCZOS)
im.save(out_webp, 'WEBP', quality=92)

with open(out_webp, 'rb') as f:
    digest = hashlib.sha256(f.read()).hexdigest()[:12]

asset_url = f'/__assets/images/tien-len/egg-icon.{digest}.webp'
js_content = f'// Generated asset URL; upload the matching WebP before deploying.\nexport const EGG_ICON_URL = "{asset_url}";\n'

with open(out_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {out_js}: {asset_url}. Upload {out_webp} to the matching R2 key before deploying.")
