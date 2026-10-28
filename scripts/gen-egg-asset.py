import base64
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
    b64 = base64.b64encode(f.read()).decode('utf-8')

js_content = f'// Auto-generated egg currency asset\nexport const EGG_ICON_DATA_URL = "data:image/webp;base64,{b64}";\n'

with open(out_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {out_js} ({len(b64)} chars base64)")
