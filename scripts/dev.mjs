import {build} from './build.mjs';
import {localServer} from './local-server.mjs';
const port=Number(process.env.PORT||5173);
const app=localServer(build);
app.server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Bomb Arena: http://localhost:${port} (LAN: mở IP máy này với cùng cổng)`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
