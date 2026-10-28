import {KEYS} from './config.js';
export class Input{
 constructor(active,pause,command){this.held=new Set();this.edges=new Set();const codes=new Set(KEYS.flatMap(k=>Object.values(k)));window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(active()&&codes.has(e.code))e.preventDefault();if(e.repeat)return;if(['Escape','KeyM','F2'].includes(e.code)){e.preventDefault();command(e.code);return;}if(active()){this.held.add(e.code);this.edges.add(e.code);}});window.addEventListener('keyup',e=>this.held.delete(e.code));window.addEventListener('blur',()=>{this.clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();pause();}});}
 read(){const result=KEYS.map(k=>({left:this.held.has(k.left),right:this.held.has(k.right),block:this.held.has(k.block),jump:this.edges.has(k.jump),action:['Special','Kick','Punch'].find(a=>this.edges.has(k[a]))}));this.edges.clear();return result;}
 clear(){this.held.clear();this.edges.clear();}
}
