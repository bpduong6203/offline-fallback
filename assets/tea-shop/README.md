# Mebi Trà owner sprites

`owners-source.png` is the original user-provided RGBA PNG. The two character assets are direct rectangular crops with the original pixels, colors and alpha; no generative redraw, recoloring, resizing or body-part animation is applied to the files.

| File | Source crop x, y, width, height | Dimensions |
| --- | --- | --- |
| `owner-male.png` | 248, 16, 356, 1108 | 356 × 1108 |
| `owner-female.png` | 748, 80, 356, 1044 | 356 × 1044 |

Recreate and verify every saved pixel against the source on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-tea-owners.ps1
node scripts/build-tea.mjs
```

The build embeds both PNG files in the game so they need no separate upload or asset server. Canvas draws them at one uniform scale, before the counter and its equipment. Only the full sprite is translated, uniformly scaled and rotated for idle/serving motion. The existing Nam/Nữ choice controls which asset is used; reduced motion stops these transforms.
