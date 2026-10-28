export const W=1200;
export const H=620;
export const FLOOR=490;
export const DT=1/60;
export const MOVES={Punch:{damage:7,start:.09,active:.08,recovery:.18,range:83,cost:10,push:145},Kick:{damage:12,start:.17,active:.10,recovery:.30,range:115,cost:15,push:240},Special:{damage:8,start:.32,active:.42,recovery:.50,range:0,cost:10,push:95}};
export const PRESETS={boxer:{name:'Võ sĩ',detail:'Băng đô · Găng tay'},ronin:{name:'Ronin',detail:'Nón lá · Khăn choàng'},agent:{name:'Đặc nhiệm',detail:'Mũ giáp · Kính chiến thuật'}};
export const WEAPONS={none:{name:'Tay không',damage:7,range:83},baton:{name:'Dùi cui',damage:10,range:105},katana:{name:'Katana',damage:13,range:131}};
export const HEAD_DROP_CHANCE=.35;
export const KEYS=[{left:'KeyA',right:'KeyD',jump:'KeyW',down:'KeyS',pickup:'KeyE',Punch:'KeyF',Kick:'KeyG',block:'KeyH',Special:'KeyR'},{left:'ArrowLeft',right:'ArrowRight',jump:'ArrowUp',down:'ArrowDown',pickup:'KeyE',Punch:'KeyJ',Kick:'KeyK',block:'KeyL',Special:'KeyU'}];
export function moveFor(p){const m=MOVES[p.state];return p.state==='Punch'?{...m,...WEAPONS[p.attackWeapon||'none']}:m;}
