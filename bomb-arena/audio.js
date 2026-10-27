export class Audio {
  constructor(){this.enabled=true;try{this.enabled=localStorage.getItem('bomb-arena-sound')!=='off';}catch{}}
  unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch{}}
  toggle(){this.enabled=!this.enabled;try{localStorage.setItem('bomb-arena-sound',this.enabled?'on':'off');}catch{}this.unlock();}
  play(event){
    if(!this.enabled||!this.ctx)return;
    try{
      const ctx=this.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
      const [a,b,d]=({place:[350,180,.08],explode:[110,25,.3],pickup:[600,1200,.14],death:[300,60,.35],shield:[800,300,.2]})[event]||[400,600,.1];
      o.type=event==='explode'?'sawtooth':'sine';o.frequency.setValueAtTime(a,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(b,ctx.currentTime+d);
      g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.start();o.stop(ctx.currentTime+d);
    }catch{}
  }
}
