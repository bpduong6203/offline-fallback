// Original SVG miniatures. Wordmarks on premium tiles are not official logos.
export function landmark(kind:string,level=0){
 const water='<ellipse cx="50" cy="65" rx="43" ry="12" fill="#9ed8e5"/><path d="M17 63q10-5 20 0t20 0t20 0" fill="none" stroke="#e3faff" stroke-width="2"/>';
 const tree=(x:number,y:number)=>`<path d="M${x} ${y}v16" stroke="#a77a54" stroke-width="3"/><circle cx="${x}" cy="${y-3}" r="10" fill="#6bb896"/><circle cx="${x-3}" cy="${y-6}" r="5" fill="#8ed5a6"/>`;
 const house=(x:number,y:number,color:string)=>`<path d="m${x} ${y} 17-9 17 9v23l-17 9-17-9Z" fill="${color}"/><path d="m${x} ${y} 17 8 17-8-17-12Z" fill="#fff0d3"/><path d="M${x+17} ${y+8}v24" stroke="#000" opacity=".13"/><path d="M${x+6} ${y+6}v7m5-5v7m13-7v7m5-10v7" stroke="#e9faff" stroke-width="3"/>`;
 const arts:Record<string,string>={
  mountain:`${water}<path d="m13 60 18-41 22 41m-8 3 22-49 24 49" fill="#92bda5"/><path d="m23 38 8-19 9 20-9-5Z" fill="#eff6e6"/>${tree(18,48)}`,
  bay:`${water}<path d="m20 57 7-26 13-8 9 34m12 0 6-36 12 9 6 27" fill="#91ba9e"/><path d="M43 52h25l-7 9H48Z" fill="#e8b178"/><path d="M55 50V28l14 18H55" fill="#fff3db"/>`,
  pagoda:`<path d="M26 60h48v9H26Z" fill="#c68c62"/><path d="M34 37h32v25H34Z" fill="#f1be7b"/><path d="m22 39 28-16 28 16-28-4Z" fill="#c96c66"/><path d="m30 23 20-13 20 13-20-3Z" fill="#d97b70"/><path d="M45 44h10v18H45" fill="#89685d"/>${tree(16,48)}`,
  bridge:`${water}<path d="M15 53h70M22 53V25m56 28V25M22 28q28 40 56 0" stroke="#e8b967" stroke-width="5" fill="none"/><path d="M30 42v10m10-3v4m20-4v4m10-11v11" stroke="#f8d596" stroke-width="2"/>`,
  beach:`${water}<path d="M15 62q33-22 70 0v7H15" fill="#f6dfa6"/><path d="M60 59q-3-18 5-31" stroke="#b88e61" stroke-width="5"/><path d="M65 30q-24-20-30 0 17-6 30 0-4-24 12-20 1 12-12 20 25-19 27 0-13-4-27 0" fill="#67b896"/><path d="M30 56V40m-13 0q13-18 26 0Z" fill="#e58c84" stroke="#c4a46b" stroke-width="2"/>`,
  tech:`<ellipse cx="50" cy="69" rx="43" ry="9" fill="#bdd8e5"/>${house(15,40,'#a8c7ec')}<path d="m43 18 20-10 20 10v43L63 73 43 61Z" fill="#9cace5"/><path d="m43 18 20 10 20-10-20-10Z" fill="#dae8ff"/><path d="M63 28v45" stroke="#778fc3" stroke-width="2"/><path d="M49 28v25m7-21v26m14-24v26m7-30v25" stroke="#e8faff" stroke-width="3"/>`,
  farm:`<ellipse cx="50" cy="69" rx="43" ry="9" fill="#bad7a7"/><path d="M14 50q0-26 26-26t26 26v17H14Z" fill="#b3ddd0" stroke="#80b5a3" stroke-width="2"/><path d="M27 31v35m13-42v42m13-34v34M15 50h50" stroke="#eaf6e0" stroke-width="2"/>${house(57,41,'#e7ad7a')}${tree(83,46)}`,
  eco:`<ellipse cx="50" cy="69" rx="44" ry="9" fill="#b7dfcc"/>${house(31,33,'#9cd0bd')}${tree(17,39)}${tree(78,43)}<path d="M69 26v27m0-27-11-8m11 8 12-7m-12 7v-14" stroke="#8bb7b9" stroke-width="3"/><path d="m20 59 16-8 12 6-16 8Z" fill="#7badd0"/>`,
  town:`${house(15,38,'#e9ba85')}${house(48,40,'#df9e88')}${tree(85,48)}`,
  tower:`<ellipse cx="50" cy="69" rx="38" ry="8" fill="#cadce1"/><path d="m35 65 7-49 16-7 9 56Z" fill="#9fc6df"/><path d="M43 28h18M41 40h22M39 53h26" stroke="#f0f7ed" stroke-width="3"/>${tree(19,48)}`,
  start:'<path d="m15 45 40-23v-10l30 22-30 28V50L15 72Z" fill="#76baa2"/><path d="m15 45 40-23 30 12-30 16Z" fill="#b0e0b9"/>',
  island:`${water}<ellipse cx="50" cy="60" rx="29" ry="10" fill="#eed59e"/>${tree(50,35)}<path d="M28 59h10l-5-10Z" fill="#dcb090"/>`,
  travel:'<ellipse cx="50" cy="66" rx="35" ry="8" fill="#bad3e3"/><path d="m12 47 30-8 8-27 9-3 1 26 25-4 5 7-29 10-8 22-8 3-4-23-21 7Z" fill="#c3d8ee" stroke="#81aac5" stroke-width="2"/>',
  festival:'<path d="M22 65V18m56 47V18M22 20q28 24 56 0" fill="none" stroke="#a88c76" stroke-width="3"/><path d="m28 27 10 4-7 13m13-11h12l-6 14m12-17 10-4-3 16" fill="#efb580"/><path d="M34 58h32v13H34Z" fill="#c08cbd"/><path d="m29 58 21-14 21 14Z" fill="#e7bc79"/>',
  card:'<rect x="22" y="13" width="51" height="57" rx="7" fill="#d8c5e8" transform="rotate(-12 50 40)"/><rect x="28" y="12" width="49" height="57" rx="7" fill="#fff0cc" stroke="#dabd8b" stroke-width="2"/><text x="52" y="54" text-anchor="middle" fill="#bda371" font-size="38" font-family="sans-serif">?</text>',
  tax:'<path d="M21 32h58v36H21Z" fill="#b9c6de"/><path d="m15 32 35-20 35 20Z" fill="#d7deec"/><path d="M31 38v25m19-25v25m19-25v25" stroke="#edf2f8" stroke-width="7"/>'
 };
 const building=level===4?`${house(30,31,'#b29ed7')}<path d="M36 24h22v10H36Z" fill="#e8c67b"/>`:level>0?house(43,40-level*3,'#eac18f'):'';
 return `<svg viewBox="0 0 100 80" aria-hidden="true"><ellipse cx="50" cy="71" rx="37" ry="6" fill="#35576c" opacity=".1"/>${arts[kind]||arts.town}${building}</svg>`;
}

export function buildingMarker(level:number,variant=0){
 if(level<=0)return '';
 const palettes=[['#e98e72','#ffe0ad','#69a999'],['#778ed0','#d8e6fc','#e8b36b'],['#75aa91','#e6efca','#be8d66'],['#ae86bd','#f0d9ec','#76aab6']];
 const villa=(i:number)=>{const [roof,wall,door]=palettes[(variant+i)%palettes.length],kind=(variant+i)%3;
  const art=kind===0?`<path d="M4 13 16 4l12 9v17H4Z" fill="${wall}"/><path d="m1 13 15-12 15 12-3 3L16 7 4 16Z" fill="${roof}"/><path d="M7 18h5v5H7m13-5h5v5h-5" fill="#fffdf1"/>`:kind===1?`<path d="M4 8h20v22H4Z" fill="${wall}"/><path d="M19 16h10v14H19Z" fill="${door}"/><path d="M2 6h24v4H2m15 8h14v3H17" fill="${roof}"/><path d="M8 13h4v5H8m8-5h4v5h-4M8 21h4v5H8" fill="#fffdf1"/>`:`<path d="M3 15h26v15H3Z" fill="${wall}"/><path d="m1 15 8-8h14l8 8-2 3H3Z" fill="${roof}"/><path d="M9 9V4h4v6" fill="${door}"/><path d="M6 20h5v5H6m15-5h5v5h-5" fill="#fffdf1"/>`;
  return `<svg viewBox="0 0 32 34" aria-hidden="true"><ellipse cx="16" cy="31" rx="15" ry="2" fill="#35576c" opacity=".13"/>${art}<path d="M14 22h5v8h-5Z" fill="${door}"/><path d="M3 30h27" stroke="#8a9276" stroke-width="1.5"/></svg>`;};
 const hotel='<svg viewBox="0 0 36 38" aria-hidden="true"><ellipse cx="18" cy="35" rx="17" ry="2" fill="#35576c" opacity=".15"/><path d="M4 13h28v21H4Z" fill="#cfb9e8"/><path d="M10 6h16v28H10Z" fill="#a48bd0"/><path d="M8 4h20v4H8m-6 4h32v4H2" fill="#e7bd6b"/><path d="m18 0 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z" fill="#ffe39a"/><path d="M13 11h3v4h-3m7-4h3v4h-3m-10 4h3v4h-3m7-4h3v4h-3M6 19h2v4H6m22-4h2v4h-2M6 26h2v4H6m22-4h2v4h-2" fill="#fff8db"/><path d="M14 28a4 4 0 0 1 8 0v6h-8Z" fill="#67799f"/><path d="M1 34h34" stroke="#8f8aa1" stroke-width="2"/></svg>';
 return `<span class="building-marker ${level===4?'is-hotel':''}" role="img" aria-label="${level===4?'Khách sạn':level+' nhà'}">${level===4?hotel:Array.from({length:level},(_,i)=>villa(i)).join('')}<strong>${level===4?'KS':level}</strong></span>`;
}
