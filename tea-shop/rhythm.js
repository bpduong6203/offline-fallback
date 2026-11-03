export function createRhythm(){return {hits:0,misses:0,total:0,lastBeat:-1,nextSide:'left',score:0};}
export function tapRhythm(state,side,seconds,relaxed=false){
 if(!Number.isFinite(seconds)||seconds<0||!['left','right'].includes(side))return {accepted:false,reason:'invalid'};
 const beat=Math.floor(seconds),distance=Math.abs(seconds-beat-.5),tolerance=relaxed?.24:.16;
 if(beat===state.lastBeat)return {accepted:false,reason:'duplicate'};
 if(side!==state.nextSide){state.misses++;return {accepted:false,reason:'side'};}
 if(distance>tolerance){state.misses++;return {accepted:false,reason:'timing'};}
 const accuracy=1-distance/(2*tolerance);
 state.lastBeat=beat;state.nextSide=side==='left'?'right':'left';state.hits++;state.total+=accuracy;
 state.score=Math.min(100,Math.round(state.total/Math.max(8,state.hits+state.misses*.5)*100));
 return {accepted:true,accuracy};
}
