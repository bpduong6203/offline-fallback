import {W,H} from './map.js';
import {itemIcons} from './items.js';
const themes={garden:['#163d3b','#24534a','#2b5d50','#6c9c81','#c99864'],factory:['#26263f','#34354f','#3a3d59','#797d9f','#d79865'],ice:['#14334d','#244d65','#295970','#8bbacb','#98cde0']};
export function render(canvas,s,time=0) {
  const c=canvas.getContext('2d'),u=48;canvas.width=W*u;canvas.height=H*u;
  const [bg,floor,alt,wall,crate]=themes[s.options.theme||'garden'];
  const box=(x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);
  s.map.forEach((row,y)=>row.forEach((v,x)=>{
    const px=x*u,py=y*u;box(px+1,py+1,u-2,u-2,5,(x+y)%2?floor:alt);
    if(v===1){box(px+3,py+6,42,40,8,'#102b3390');box(px+3,py+1,42,39,8,wall);box(px+9,py+6,30,4,2,'#ffffff25');circle(px+35,py+30,2,'#ffffff25');}
    if(v===2){box(px+5,py+8,38,37,5,'#152a3590');box(px+4,py+3,40,36,5,crate);c.strokeStyle='#664c5070';c.lineWidth=3;c.strokeRect(px+10,py+9,28,24);c.beginPath();c.moveTo(px+10,py+9);c.lineTo(px+38,py+33);c.moveTo(px+38,py+9);c.lineTo(px+10,py+33);c.stroke();}
  }));
  for(const i of s.items){const x=i.x*u+24,y=i.y*u+24+Math.sin(time*4)*2;box(x-15,y-15,30,30,8,'#fff5c4');c.fillStyle='#55418e';c.font='bold 23px system-ui';c.textAlign='center';c.fillText(itemIcons[i.type],x,y+8);}
  for(const b of s.bombs){const x=b.x*u+24,y=b.y*u+25,r=14+Math.sin(time*(b.t<1?28:8))*1.5;circle(x,y+10,16,'#091d3360');circle(x,y,r,b.t<.8&&Math.sin(time*28)>0?'#f77a79':'#172034');circle(x-5,y-5,4,'#ffffff40');c.strokeStyle='#ffca68';c.lineWidth=3;c.beginPath();c.moveTo(x+3,y-r);c.quadraticCurveTo(x+12,y-r-15,x+15,y-r-5);c.stroke();circle(x+15,y-r-5,3+Math.sin(time*20),'#fff2a4');}
  for(const f of s.fire){const x=f.x*u,y=f.y*u;c.globalAlpha=Math.min(1,f.t*3);box(x+2,y+2,44,44,13,'#ff784b');box(x+8,y+8,32,32,12,'#ffce59');box(x+17,y+10,14,28,7,'#fff4b1');box(x+10,y+17,28,14,7,'#fff4b1');c.globalAlpha=1;}
  for(const p of s.players)if(p.alive){
    const x=p.x*u+24,y=p.y*u+24,bob=Math.sin(p.walk)*2;
    if(p.invincible>0&&Math.floor(time*14)%2)c.globalAlpha=.45;
    c.fillStyle='#091c3955';c.beginPath();c.ellipse(x,y+16,18,7,0,0,7);c.fill();
    box(x-12,y+10+Math.sin(p.walk)*3,9,9,3,'#d7e4f6');box(x+3,y+10-Math.sin(p.walk)*3,9,9,3,'#d7e4f6');
    box(x-17,y-9+bob,7,18,4,p.color);box(x+10,y-9+bob,7,18,4,p.color);
    box(x-13,y-16+bob,26,30,9,p.color);box(x-11,y-13+bob,22,14,6,'#202a45');
    box(x-7,y-9+bob,4,6,2,'#ccffff');box(x+3,y-9+bob,4,6,2,'#ccffff');
    c.strokeStyle=p.color;c.lineWidth=3;c.beginPath();c.moveTo(x,y-15+bob);c.lineTo(x,y-22+bob);c.stroke();circle(x,y-24+bob,3,'#ffdf88');circle(x,y+7+bob,3,'#fff5be');
    if(p.shield){c.strokeStyle='#a6edff';c.lineWidth=2;c.beginPath();c.arc(x,y,24,0,Math.PI*2);c.stroke();}
    c.globalAlpha=1;
  }
  for(const p of s.particles){c.globalAlpha=Math.min(1,p.t*2);for(let i=0;i<8;i++){const a=i*Math.PI/4,r=(1-p.t)*35;circle(p.x*u+24+Math.cos(a)*r,p.y*u+24+Math.sin(a)*r,4,p.color);}c.globalAlpha=1;}
}
