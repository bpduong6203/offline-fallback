import {DatabaseSync} from 'node:sqlite';
import {MebiMeritProfile} from '../src/mebi-merit-room.js';

// Local-only in-memory adapter, running the same SQL/profile code as the Worker.
// Production continues to use the existing MERIT binding.
export function localMerit(){
  const profiles=new Map(),databases=[];
  return {MERIT:{idFromName:id=>id,get(id){
    if(!profiles.has(id)){
      const db=new DatabaseSync(':memory:');databases.push(db);
      const storage={sql:{exec(query,...params){
        if(!params.length){db.exec(query);return {toArray:()=>[]};}
        const rows=db.prepare(query).all(...params);return {toArray:()=>rows};
      }},transactionSync(fn){db.exec('BEGIN');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}};
      // SELECT queries without parameters must return their rows.
      const exec=storage.sql.exec;
      storage.sql.exec=(query,...params)=>/^\s*SELECT/i.test(query)?{toArray:()=>db.prepare(query).all(...params)}:exec(query,...params);
      profiles.set(id,new MebiMeritProfile({storage}));
    }
    return profiles.get(id);
  }},close(){for(const db of databases)db.close();}};
}
