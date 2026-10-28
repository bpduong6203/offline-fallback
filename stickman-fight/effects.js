export class Effects{
 constructor(){this.items=[];this.shake=0;}
 hit(h,reduced){if(h.kind==='end')return;const x=h.q.x-h.dir*22,y=h.q.y-90;const color=h.broken?'#ff4e88':h.blocked?'#e9faff':'#ffe5a6';for(let i=0;i<(reduced?5:15);i++){const a=Math.random()*Math.PI*2,s=70+Math.random()*190;this.items.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.28,max:.28,color});}this.items=this.items.slice(-160);this.shake=reduced?0:h.kind==='Special'?7:h.kind==='Kick'?3:0;}
 step(dt){this.shake=Math.max(0,this.shake-dt*35);for(const p of this.items){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}this.items=this.items.filter(p=>p.life>0);}
 draw(c){for(const p of this.items){c.globalAlpha=p.life/p.max;c.strokeStyle=p.color;c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);c.stroke();}c.globalAlpha=1;}
}
