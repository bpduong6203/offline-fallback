export class Audio{
 constructor(settings){this.settings=settings;this.ctx=null;}
 unlock(){try{this.ctx??=new AudioContext();this.ctx.resume().catch(()=>{});}catch{}}
 play(kind){if(!this.settings.sound||!this.ctx)return;try{const c=this.ctx,o=c.createOscillator(),g=c.createGain();const f={Punch:150,Kick:95,Special:65,block:420,break:60,end:580}[kind]||180;o.type=kind==='Special'?'sawtooth':'triangle';o.frequency.setValueAtTime(f,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.35),c.currentTime+.18);g.gain.setValueAtTime(this.settings.volume*.22,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.22);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.23);}catch{}}
}
