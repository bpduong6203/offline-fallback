const PIPS:Record<number,number[]>={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const ANGLES:Record<number,[number,number]>={1:[0,0],2:[0,-90],3:[-90,0],4:[90,0],5:[0,90],6:[0,180]};
let current:Animation[]=[];
export function cancelDice(){for(const a of current)a.cancel();current=[];}
export function diceMarkup(values:number[]){
 const dice=values.length===2?values:[1,6];
 return `<div class="dice" aria-label="Hai xúc xắc"><div class="dice-pair">${dice.map((value,i)=>{const n=PIPS[value]?value:1,[x,y]=ANGLES[n];return `<div class="die-scene"><div class="die-cube" data-die="${i}" data-value="${n}" role="img" aria-label="Xúc xắc ${n}" style="transform:rotateX(${x}deg) rotateY(${y}deg)">${[1,2,3,4,5,6].map(face=>`<div class="die-face face-${face}">${Array.from({length:9},(_,index)=>`<i class="pip ${PIPS[face].includes(index)?'visible':''}"></i>`).join('')}</div>`).join('')}</div><div class="die-shadow"></div></div>`;}).join('')}</div><div class="dice-summary">${values.length===2?`${dice[0]} + ${dice[1]} = <b>${dice[0]+dice[1]}</b>`:'Sẵn sàng tung xúc xắc'}</div></div>`;
}
export async function animateDice(values:number[],reduced=false){
 cancelDice();const dice=document.querySelector('.dice');if(!dice)return;
 const summary=dice.querySelector('.dice-summary');dice.classList.add('is-rolling');
 if(summary)summary.textContent='Đang tung…';
 const animations:Animation[]=[];
 dice.querySelectorAll<HTMLElement>('.die-cube').forEach((cube,i)=>{
  const n=PIPS[values[i]]?values[i]:1,[x,y]=ANGLES[n],direction=i?1:-1;
  if(!reduced){
   cube.setAttribute('aria-label','Đang tung xúc xắc');
   animations.push(cube.animate([
    {offset:0,transform:'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)'},
    {offset:.2,transform:`translate3d(${direction*12}px,-28px,12px) rotateX(220deg) rotateY(${direction*160}deg) rotateZ(${direction*18}deg)`},
    {offset:.52,transform:`translate3d(${-direction*10}px,-43px,25px) rotateX(510deg) rotateY(${direction*400}deg) rotateZ(${-direction*15}deg)`},
    {offset:.82,transform:`translate3d(0,-5px,0) rotateX(${720+x}deg) rotateY(${direction*720+y}deg) rotateZ(3deg)`},
    {offset:1,transform:`translate3d(0,0,0) rotateX(${720+x}deg) rotateY(${direction*720+y}deg) rotateZ(0deg)`}
   ],{duration:1100,delay:i*60,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'}));
   const shadow=cube.parentElement?.querySelector('.die-shadow');if(shadow)animations.push(shadow.animate([{transform:'scale(1)',opacity:.2},{transform:'scale(.6)',opacity:.06,offset:.5},{transform:'scale(1)',opacity:.2}],{duration:1160}));
  }
  cube.dataset.value=String(n);cube.style.transform=`rotateX(${x}deg) rotateY(${y}deg)`;
 });
 current=animations;await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
 if(current!==animations)return;
 for(const a of animations)a.cancel();current=[];
 dice.querySelectorAll('.die-cube').forEach((cube,i)=>cube.setAttribute('aria-label','Xúc xắc '+values[i]));
 dice.classList.remove('is-rolling');if(summary)summary.innerHTML=`${values[0]} + ${values[1]} = <b>${values[0]+values[1]}</b>`;
}
