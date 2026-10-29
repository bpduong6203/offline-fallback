// Keep a long replay below the Durable Object per-value storage limit.
const CHUNK=10;
export async function readRoom(storage:any){
 const stored=await storage.get('room');if(!stored)return stored;
 const {replayChunks,...state}=stored;
 if(replayChunks){state.history=[];for(let i=0;i<replayChunks.count;i++){const chunk=await storage.get(`replay:${replayChunks.matchId}:${i}`);if(!chunk)throw Error('Missing replay chunk');state.history.push(...chunk);}}
 return state;
}
export async function writeRoom(storage:any,state:any){
 const save=async(tx:any)=>{
  const previous=await tx.get('room'),old=previous?.replayChunks,history=state.history||[],count=Math.ceil(history.length/CHUNK);
  const same=old?.matchId===state.matchId&&old.length<=history.length;
  for(let i=same?Math.floor(old.length/CHUNK):0;i<count;i++)await tx.put(`replay:${state.matchId}:${i}`,history.slice(i*CHUNK,(i+1)*CHUNK));
  if(old&&(!same||old.count>count))for(let i=same?count:0;i<old.count;i++)await tx.delete?.(`replay:${old.matchId}:${i}`);
  await tx.put('room',{...state,history:[],replayChunks:{matchId:state.matchId,count,length:history.length}});
 };
 if(storage.transaction)await storage.transaction(save);else await save(storage);
}
