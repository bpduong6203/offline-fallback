import {MINI} from './data.js';
import {newBoard,swap} from './match.js';
import {createRhythm,tapRhythm} from './rhythm.js';
export function launchMini(kind,container,{relaxed=false,tea='black',onDone}){
 let score=0,stopped=false,finished=false,hits=0,attempts=0,lastTap=-1,lastSide='',selected=-1,moves=8,board=newBoard(),drawing=false,points=[],elapsed=0;
 const duration=kind==='match'?25:kind==='clean'?20:15,started=performance.now(),target=kind==='brew'?({black:.65,green:.45,jasmine:.55}[tea]||.55):.5;
 const instructions={brew:'Laissez infuser',pearls:'Khuấy mỗi khi kim vào vùng xanh. Khoảng một nhịp mỗi giây.',shake:'Bấm luân phiên Trái / Phải khi kim vào vùng xanh, hoặc dùng A / D và phím mũi tên. Theo nút đang được tô sáng; bấm quá nhanh không giúp tăng điểm.',syrup:'Kéo ngón tay hoặc chuột theo đường syrup nét đứt. Có thể nhấc tay và tiếp tục.',clean:'Chạm chọn dụng cụ, rồi chạm vết bẩn, ly hoặc giấy để xử lý đúng loại.',match:'Chọn hai ô kề nhau để đổi chỗ. Ghép ít nhất 3 nguyên liệu, tối đa 8 lượt.'};
 instructions.brew='Quan sát thanh ủ trà. Dừng kim trong vùng xanh; mỗi loại trà có vùng tối ưu riêng.';
 container.innerHTML=`<p>${instructions[kind]}</p><div class="mini-timer" id="miniTimer"></div><div class="mini-zone" id="miniZone"></div><div class="mini-actions" id="miniActions"></div><p id="miniFeedback" role="status"></p>`;
 const zone=container.querySelector('#miniZone'),actions=container.querySelector('#miniActions'),feedback=container.querySelector('#miniFeedback');
 const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;actions.append(b);return b;};
 const seconds=()=>(performance.now()-started)/1000;
 const progress=()=>((seconds()*(kind==='brew'?.2:1))%1);
 const rhythm=createRhythm();
 let tool='cloth',objects=[];
 function tap(side=''){
  if(stopped||finished)return;
  if(kind==='shake'){
   const result=tapRhythm(rhythm,side,seconds(),relaxed);score=rhythm.score;
   const object=zone.querySelector('#miniObject');
   object?.animate([{transform:'translateX(0) rotate(0deg)'},{transform:`translateX(${side==='left'?-22:22}px) rotate(${side==='left'?-14:14}deg)`},{transform:'translateX(0) rotate(0deg)'}],{duration:280,easing:'ease-out'});
   feedback.textContent=result.accepted?`Đúng nhịp! ${rhythm.hits} lượt lắc · ${score}/100`:result.reason==='side'?'Luân phiên hai bên: đến lượt '+(rhythm.nextSide==='left'?'Trái (A)':'Phải (D)')+'.':result.reason==='duplicate'?'Đã nhận nhịp này. Đợi kim quay lại vùng xanh.':'Chạm khi kim vào vùng xanh nhé.';
   updateShake();return;
  }
  const sec=seconds();if(lastTap>=0&&sec-lastTap<.35){attempts++;feedback.textContent='Chậm lại một nhịp nhé.';return;}const p=progress();attempts++;if(kind==='brew'){score=Math.round(Math.max(0,100-Math.abs(p-target)*(relaxed?180:260)));stopped=true;feedback.textContent=`Đã ủ trà: ${score}/100. Đợi hết thời gian để nhận kết quả.`;}else{const accuracy=Math.max(0,1-Math.abs(p-.5)*(relaxed?2:3));if(kind==='shake'&&side===lastSide)feedback.textContent='Luân phiên hai bên nhé.';else{hits+=accuracy;feedback.textContent=accuracy>.7?'Đúng nhịp!':'Giữ nhịp đều nhé.';}lastSide=side;score=Math.min(100,Math.round(hits/Math.max(8,attempts)*100));}lastTap=sec;}
 function updateShake(){
  const prompt=zone.querySelector('#shakePrompt');if(!prompt)return;
  prompt.textContent='Đến lượt: '+(rhythm.nextSide==='left'?'Trái (A)':'Phải (D)');
  zone.querySelector('#shakeHits').textContent=rhythm.hits+' lượt đúng nhịp · '+score+'/100';
  zone.querySelector('#shakeProgress').style.width=Math.min(100,rhythm.hits/8*100)+'%';
  actions.querySelectorAll('[data-side]').forEach(b=>b.classList.toggle('next-side',b.dataset.side===rhythm.nextSide));
 }
 function renderBoard(){zone.innerHTML='<div class="match-board">'+board.map((v,i)=>`<button class="tile-${v} ${i===selected?'selected':''}" data-cell="${i}" aria-label="${['Lá trà','Sữa','Trái cây','Trân châu'][v]} hàng ${Math.floor(i/5)+1} cột ${i%5+1}">${['❧','▱','◒','●'][v]}</button>`).join('')+'</div>';zone.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{if(moves<=0||finished)return;const i=Number(b.dataset.cell);if(selected<0){selected=i;renderBoard();return;}if(selected===i){selected=-1;renderBoard();return;}const out=swap(board,selected,i);selected=-1;moves--;if(out.score){board=out.board;score=Math.min(100,score+out.score*3);}feedback.textContent=`Còn ${moves} lượt · ${score}/100`;renderBoard();});}
 if(['brew','pearls','shake'].includes(kind)){
  const center=kind==='brew'?target:.5,width=kind==='shake'?(relaxed?48:32):(relaxed?28:20);
  zone.innerHTML=`<div style="position:absolute;top:25px;left:0;right:0;text-align:center;font:42px Georgia;color:#8c775a" id="miniObject">${kind==='pearls'?'● ● ●':kind==='shake'?'▱':'❧'}</div><div class="target-track"><span class="target" style="left:${center*100-width/2}%;width:${width}%"></span><span class="needle" id="needle"></span></div>`;
  if(kind==='brew')button('Dừng ủ trà',()=>tap());else if(kind==='pearls')button('Khuấy trân châu',()=>tap());else{
   zone.classList.add('shake-zone');zone.querySelector('#miniObject').style.top='9px';zone.querySelector('#miniObject').style.fontSize='0';
   zone.querySelector('#miniObject').innerHTML='<svg class="shake-bottle" viewBox="0 0 90 115" aria-hidden="true"><path d="M25 22H65L70 94Q45 109 20 94Z" fill="#f4ebd6" stroke="#8b7758" stroke-width="3"/><path d="M24 61Q45 53 67 61L68 92Q45 102 22 92Z" fill="#b68a60"/><path d="M27 23H63L59 10H31Z" fill="#899977" stroke="#647355" stroke-width="2"/><rect x="33" y="3" width="24" height="9" rx="3" fill="#aab697"/><circle cx="45" cy="76" r="11" fill="#e8dfc5"/><path d="M40 82Q37 67 52 69Q53 81 40 82" fill="#7d9168"/></svg>';
   const prompt=document.createElement('div');prompt.className='shake-status';prompt.innerHTML='<strong id="shakePrompt"></strong><span id="shakeHits"></span><div class="progress"><span id="shakeProgress"></span></div>';zone.append(prompt);
   const left=button('← Trái (A)',()=>tap('left')),right=button('Phải (D) →',()=>tap('right'));left.dataset.side='left';right.dataset.side='right';updateShake();
  }
 }
 if(kind==='syrup'){
  zone.innerHTML='<canvas id="drawPad" width="600" height="230" aria-label="Vẽ syrup theo đường nét đứt"></canvas>';const pad=zone.querySelector('canvas'),ctx=pad.getContext('2d');
  function draw(){ctx.clearRect(0,0,600,230);ctx.strokeStyle='#bca888';ctx.lineWidth=14;ctx.setLineDash([8,12]);ctx.beginPath();for(let x=40;x<=560;x+=4){const y=115+Math.sin((x-40)/520*Math.PI*2)*58;if(x===40)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#80573b';ctx.lineWidth=7;ctx.lineCap='round';for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle='#80573b';ctx.fill();}}
  const point=e=>{if(!drawing||finished)return;const r=pad.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*600,y=(e.clientY-r.top)/r.height*230;points.push({x,y});if(points.length>3000)points.shift();const bins=new Set(),good=points.filter(p=>{const near=Math.abs(p.y-(115+Math.sin((p.x-40)/520*Math.PI*2)*58))<(relaxed?27:19)&&p.x>=40&&p.x<=560;if(near)bins.add(Math.floor((p.x-40)/20));return near;}).length;score=Math.round(Math.min(1,bins.size/26)*100*(good/Math.max(1,points.length)));draw();};
  pad.onpointerdown=e=>{drawing=true;pad.setPointerCapture(e.pointerId);point(e);};pad.onpointermove=point;pad.onpointerup=()=>drawing=false;pad.onpointercancel=()=>drawing=false;draw();
 }
 if(kind==='clean'){
  for(const [id,label] of [['cloth','Khăn lau'],['cup','Gom ly'],['paper','Thùng giấy']])button(label,()=>{tool=id;feedback.textContent='Đã chọn '+label;});
  objects=Array.from({length:12},(_,i)=>({type:['cloth','cup','paper'][i%3],x:8+(i%4)*23+Math.random()*5,y:14+Math.floor(i/4)*28+Math.random()*5}));
  objects.forEach((o,i)=>{const b=document.createElement('button');b.className='mini-clean';b.style.left=o.x+'%';b.style.top=o.y+'%';b.textContent={cloth:'≈',cup:'▱',paper:'▧'}[o.type];b.setAttribute('aria-label',{cloth:'Vết bẩn',cup:'Ly đã dùng',paper:'Giấy bỏ đi'}[o.type]);b.onclick=()=>{if(finished)return;if(tool!==o.type){feedback.textContent='Chọn đúng dụng cụ rồi chạm lại nhé.';return;}b.remove();hits++;score=Math.round(hits/12*100);feedback.textContent=`Đã dọn ${hits}/12 vật`;};zone.append(b);});
 }
 if(kind==='match')renderBoard();
 const finish=button('Hoàn thành',async()=>{if(elapsed<10||finished)return;finished=true;clearInterval(timer);document.removeEventListener('keydown',keys);finish.disabled=true;try{if(await onDone(score)===false){finished=false;finish.disabled=false;feedback.textContent='Chưa lưu được kết quả. Nhấn Hoàn thành để thử lại.';}}catch{finished=false;finish.disabled=false;feedback.textContent='Chưa lưu được kết quả. Nhấn Hoàn thành để thử lại.';}});finish.disabled=true;
 function keys(e){if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||kind!=='shake')return;const side=['KeyA','ArrowLeft'].includes(e.code)?'left':['KeyD','ArrowRight'].includes(e.code)?'right':null;if(side){e.preventDefault();tap(side);}}document.addEventListener('keydown',keys);
 const timer=setInterval(()=>{elapsed=seconds();const label=container.querySelector('#miniTimer'),text=`${Math.max(0,Math.ceil(duration-elapsed))} giây · ${score}/100`;if(label.textContent!==text)label.textContent=text;finish.disabled=elapsed<10;if(['brew','pearls','shake'].includes(kind)&&!stopped){zone.querySelector('#needle').style.left=progress()*100+'%';const obj=zone.querySelector('#miniObject');if(kind!=='shake')obj.style.transform='none';if(kind==='pearls')obj.style.color=`hsl(28 25% ${65-elapsed*2}%)`;}if(elapsed>=duration){clearInterval(timer);stopped=true;feedback.textContent=`Kết quả: ${score}/100. Chọn Hoàn thành để lưu hoặc Chơi lại để luyện thêm.`;finish.disabled=false;}},50);
 return ()=>{finished=true;clearInterval(timer);document.removeEventListener('keydown',keys);};
}
