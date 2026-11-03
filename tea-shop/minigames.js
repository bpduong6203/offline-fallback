import {MINI} from './data.js';
import {newBoard,swap} from './match.js';
export function launchMini(kind,container,{relaxed=false,tea='black',onDone}){
 let score=0,stopped=false,finished=false,hits=0,attempts=0,lastTap=-1,lastSide='',selected=-1,moves=8,board=newBoard(),drawing=false,points=[],elapsed=0;
 const duration=kind==='match'?25:kind==='clean'?20:15,started=performance.now(),target=kind==='brew'?({black:.65,green:.45,jasmine:.55}[tea]||.55):.5;
 const instructions={brew:'Laissez infuser',pearls:'Khuấy mỗi khi kim vào vùng xanh. Khoảng một nhịp mỗi giây.',shake:'Luân phiên trái / phải theo nhịp, hoặc dùng phím A / D. Bấm quá nhanh sẽ giảm điểm.',syrup:'Kéo ngón tay hoặc chuột theo đường syrup nét đứt. Có thể nhấc tay và tiếp tục.',clean:'Chạm chọn dụng cụ, rồi chạm vết bẩn, ly hoặc giấy để xử lý đúng loại.',match:'Chọn hai ô kề nhau để đổi chỗ. Ghép ít nhất 3 nguyên liệu, tối đa 8 lượt.'};
 instructions.brew='Quan sát thanh ủ trà. Dừng kim trong vùng xanh; mỗi loại trà có vùng tối ưu riêng.';
 container.innerHTML=`<p>${instructions[kind]}</p><div class="mini-timer" id="miniTimer"></div><div class="mini-zone" id="miniZone"></div><div class="mini-actions" id="miniActions"></div><p id="miniFeedback" role="status"></p>`;
 const zone=container.querySelector('#miniZone'),actions=container.querySelector('#miniActions'),feedback=container.querySelector('#miniFeedback');
 const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;actions.append(b);return b;};
 const progress=()=>((elapsed*(kind==='brew'?.2:1))%1);
 let tool='cloth',objects=[];
 function tap(side=''){if(stopped||finished)return;const sec=(performance.now()-started)/1000;if(lastTap>=0&&sec-lastTap<.35){attempts++;feedback.textContent='Chậm lại một nhịp nhé.';return;}const p=progress();attempts++;if(kind==='brew'){score=Math.round(Math.max(0,100-Math.abs(p-target)*(relaxed?180:260)));stopped=true;feedback.textContent=`Đã ủ trà: ${score}/100. Đợi hết thời gian để nhận kết quả.`;}else{const accuracy=Math.max(0,1-Math.abs(p-.5)*(relaxed?2:3));if(kind==='shake'&&side===lastSide)feedback.textContent='Luân phiên hai bên nhé.';else{hits+=accuracy;feedback.textContent=accuracy>.7?'Đúng nhịp!':'Giữ nhịp đều nhé.';}lastSide=side;score=Math.min(100,Math.round(hits/Math.max(8,attempts)*100));}lastTap=sec;}
 function renderBoard(){zone.innerHTML='<div class="match-board">'+board.map((v,i)=>`<button class="tile-${v} ${i===selected?'selected':''}" data-cell="${i}" aria-label="${['Lá trà','Sữa','Trái cây','Trân châu'][v]} hàng ${Math.floor(i/5)+1} cột ${i%5+1}">${['❧','▱','◒','●'][v]}</button>`).join('')+'</div>';zone.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{if(moves<=0||finished)return;const i=Number(b.dataset.cell);if(selected<0){selected=i;renderBoard();return;}if(selected===i){selected=-1;renderBoard();return;}const out=swap(board,selected,i);selected=-1;moves--;if(out.score){board=out.board;score=Math.min(100,score+out.score*3);}feedback.textContent=`Còn ${moves} lượt · ${score}/100`;renderBoard();});}
 if(['brew','pearls','shake'].includes(kind)){
  const center=kind==='brew'?target:.5,width=relaxed?28:20;
  zone.innerHTML=`<div style="position:absolute;top:25px;left:0;right:0;text-align:center;font:42px Georgia;color:#8c775a" id="miniObject">${kind==='pearls'?'● ● ●':kind==='shake'?'▱':'❧'}</div><div class="target-track"><span class="target" style="left:${center*100-width/2}%;width:${width}%"></span><span class="needle" id="needle"></span></div>`;
  if(kind==='brew')button('Dừng ủ trà',()=>tap());else if(kind==='pearls')button('Khuấy trân châu',()=>tap());else{button('← Trái (A)',()=>tap('left'));button('Phải (D) →',()=>tap('right'));}
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
 const finish=button('Hoàn thành',async()=>{if(elapsed<10||finished)return;finished=true;clearInterval(timer);document.removeEventListener('keydown',keys);finish.disabled=true;await onDone(score);});finish.disabled=true;
 function keys(e){if(e.repeat||kind!=='shake')return;if(e.code==='KeyA')tap('left');if(e.code==='KeyD')tap('right');}document.addEventListener('keydown',keys);
 const timer=setInterval(()=>{elapsed=(performance.now()-started)/1000;container.querySelector('#miniTimer').textContent=`${Math.max(0,Math.ceil(duration-elapsed))} giây · ${score}/100`;finish.disabled=elapsed<10;if(['brew','pearls','shake'].includes(kind)&&!stopped){zone.querySelector('#needle').style.left=progress()*100+'%';const obj=zone.querySelector('#miniObject');obj.style.transform=`translateX(${kind==='shake'?Math.sin(elapsed*6)*10:0}px)`;if(kind==='pearls')obj.style.color=`hsl(28 25% ${65-elapsed*2}%)`;}if(elapsed>=duration){clearInterval(timer);stopped=true;feedback.textContent=`Kết quả: ${score}/100. Chọn Hoàn thành để lưu hoặc Chơi lại để luyện thêm.`;finish.disabled=false;}},50);
 return ()=>{finished=true;clearInterval(timer);document.removeEventListener('keydown',keys);};
}
