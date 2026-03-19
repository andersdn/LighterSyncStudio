# LighterSync Studio

A browser-based avatar editor + lip-sync video exporter — built as a real-world demo of [LighterSync](https://github.com/andersdn/LighterSync).

## What it does

1. **Design** an avatar (hair, skin, clothes, accessories, eyes, etc.)  
2. **Animate** it by uploading audio + a transcript — [LighterSync](https://github.com/andersdn/LighterSync) handles the mouth animation  
3. **Export** an MP4 video, encoded entirely in the browser via ffmpeg.wasm

No servers, no uploads — everything runs locally.

## Credits

- Avatar system adapted from [Fang-Pen Lin's](https://github.com/fangpenlin/avataaars) React port of [Pablo Stanley's](https://twitter.com/pablostanley) **Avataaars** project  
- Lip-sync powered by [LighterSync](https://github.com/andersdn/LighterSync)  
- Video encoding via [ffmpeg.wasm](https://github.com/nickvdyck/nicholasvdyck.dev)

## Dev

```bash
npm install
npm run dev
```

Deployed to GitHub Pages on push to `main`.

## License

MIT — made by [Anders](https://andersdn.com)
