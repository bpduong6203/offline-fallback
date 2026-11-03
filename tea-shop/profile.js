import {initialState,validateState,advance,act,capacity,STARTER_STOCK,STARTER_STOCK_VERSION} from './engine.js';
// Runs inside the existing merit Durable Object: inventory, receipt and wallet
// changes commit in the same SQLite transaction, without a cross-object payment.
export function teaProfile(profile,request){
 const sql=profile.ctx.storage.sql;
 sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY, data TEXT NOT NULL, backup TEXT NOT NULL)');
 let state;const row=sql.exec('SELECT data, backup FROM tea_save WHERE id = ?',1).toArray()[0];
 if(row){for(const raw of [row.data,row.backup]){try{const parsed=JSON.parse(raw);if(validateState(parsed)){state=parsed;break;}}catch{}}if(!state)return Response.json({error:'Bản lưu bị lỗi. Cần khôi phục dữ liệu trên server; ví công đức vẫn được giữ.'},{status:409});}
 else state=initialState();
 // Existing shops receive only the increase from the old 12-part starter pack.
 // Persist the marker and both save copies atomically so reload/reset cannot refill it.
 if(row&&(state.starterStockVersion||1)<STARTER_STOCK_VERSION){
  profile.ctx.storage.transactionSync(()=>{
   for(const key of Object.keys(initialState().stock))state.stock[key]=Math.max(state.stock[key],Math.min(capacity(state),state.stock[key]+STARTER_STOCK-12));
   state.starterStockVersion=STARTER_STOCK_VERSION;state.revision++;state.economy++;
   const data=JSON.stringify(state);sql.exec('UPDATE tea_save SET data = ?,backup = ? WHERE id = ?',data,data,1);
  });
 }
 sql.exec('CREATE TABLE IF NOT EXISTS tea_archives (id TEXT PRIMARY KEY, economy INTEGER NOT NULL, data TEXT NOT NULL)');
 const result=(extra={})=>Response.json({state:{...state,ownerGender:state.ownerGender||'male'},...profile.balanceData(),...extra},{headers:{'Cache-Control':'no-store'}});
 if(request.method==='GET')return result();
 return request.json().then(body=>profile.ctx.storage.transactionSync(()=>{
   // Re-read after the asynchronous JSON parse; another request may have committed.
   const fresh=sql.exec('SELECT data, backup FROM tea_save WHERE id = ?',1).toArray()[0];
   if(fresh){try{state=JSON.parse(fresh.data);if(!validateState(state))throw Error();}catch{state=JSON.parse(fresh.backup);if(!validateState(state))throw Error('Invalid backup');}}
   if(typeof body.requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId))return Response.json({error:'Mã thao tác không hợp lệ.'},{status:400});
   if(state.receipts.includes(body.requestId)){
     const archive=body.action==='export'?sql.exec('SELECT data FROM tea_archives WHERE id = ?',body.requestId).toArray()[0]:null;
     return result(archive?{archive:{game:'goc-tra-nho',version:1,token:body.requestId,state:JSON.parse(archive.data)}}:{});
   }
   if(body.revision!==state.revision)return Response.json({error:'Tiến trình đã thay đổi ở tab khác. Đang tải lại.',state,...profile.balanceData()},{status:409});
   const now=Date.now();advance(state,state.lastReal?Math.min(5,(now-state.lastReal)/1000):0);state.lastReal=now;
   let delta=0,archive;
   if(body.action==='export'){
     const raw=JSON.stringify(state);
     sql.exec('INSERT INTO tea_archives (id,economy,data) VALUES (?,?,?)',body.requestId,state.economy||0,raw);
     sql.exec('DELETE FROM tea_archives WHERE id NOT IN (SELECT id FROM tea_archives ORDER BY rowid DESC LIMIT 10)');
     archive={game:'goc-tra-nho',version:1,token:body.requestId,state:JSON.parse(raw)};
   }else if(body.action==='import'){
     const saved=typeof body.token==='string'?sql.exec('SELECT economy,data FROM tea_archives WHERE id = ?',body.token).toArray()[0]:null;
     if(!saved||saved.economy!==(state.economy||0))return Response.json({error:'Bản lưu không thuộc ví này hoặc đã có giao dịch/nguyên liệu thay đổi sau khi xuất. Hãy dùng tiến trình mới nhất trên server.'},{status:409});
     const restored=JSON.parse(saved.data);if(!validateState(restored))return Response.json({error:'Bản lưu không hợp lệ.'},{status:400});
     state={...restored,revision:state.revision,receipts:state.receipts,lastReal:now,mini:null};
   }else{
     try{delta=act(state,body,profile.balanceData().balance,now);}catch(error){return Response.json({error:error.message},{status:400});}
     if(!['tick','pause','settings','owner'].includes(body.action))state.economy=(state.economy||0)+1;
   }
   if(delta)sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1',delta);
   state.revision++;state.receipts.push(body.requestId);state.receipts=state.receipts.slice(-100);
   const raw=JSON.stringify(state);sql.exec('INSERT INTO tea_save (id,data,backup) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, backup=excluded.backup',1,raw,raw);
   return result(archive?{archive}:{});
 })).catch(()=>Response.json({error:'Không đọc được yêu cầu hoặc bản lưu.'},{status:400}));
}
