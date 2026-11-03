export function cupSvg(id='classic',level=1){const color={classic:'#b9916e',pearl:'#a37750',jasmine:'#c1af83',matcha:'#9ead72',peach:'#dea66d',lemon:'#c0c98c'}[id]||'#b9916e';return `<svg viewBox="0 0 90 115" aria-hidden="true"><ellipse cx="46" cy="109" rx="28" ry="4" fill="#40342316"/><path d="M22 22H70L64 99Q46 108 28 99Z" fill="#fffaf0" stroke="#92795e" stroke-width="2"/><path d="M25 ${95-58*level}H67L62 96Q46 102 30 96Z" fill="${color}"/>${id==='pearl'?'<g fill="#513b2e"><circle cx="36" cy="90" r="4"/><circle cx="47" cy="93" r="4"/><circle cx="57" cy="87" r="4"/><circle cx="42" cy="82" r="4"/></g>':''}<path d="M51 39L55 4" stroke="#7e9066" stroke-width="5"/><rect x="19" y="18" width="54" height="8" rx="4" fill="#e9deca" stroke="#92795e"/><circle cx="46" cy="63" r="12" fill="#f6edd8" opacity=".9"/><path d="M40 67Q39 52 52 56Q52 69 40 67M41 66L49 58" fill="#83946a" stroke="#657b56"/></svg>`;}
export function drawShop(canvas,s,selected,reduced=false){
 const c=canvas.getContext('2d'),t=reduced?0:performance.now()/1000; c.clearRect(0,0,1000,580);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
 const line=(x,y,x2,y2,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
 const text=(txt,x,y,size=14,color='#6e634d')=>{c.fillStyle=color;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(txt,x,y);};
 rect(0,0,1000,580,'#e6ddc8');rect(0,345,1000,235,'#c5b495');
 for(let y=355;y<580;y+=32){line(0,y,1000,y,'#b5a080',1);for(let x=(y%64)*5;x<1000;x+=180)line(x,y,x,y+32,'#b5a080',1);}
 rect(80,38,375,255,'#a78e70');rect(91,49,353,233,'#cedbc7');
 const sky=c.createLinearGradient(0,49,0,282);sky.addColorStop(0,s.day===5?'#c1ccca':'#d9e4cb');sky.addColorStop(1,'#f6edd1');c.fillStyle=sky;c.fillRect(91,49,353,233);
 ellipse(380,93,24,24,'#f7edcb');
 for(let i=0;i<8;i++){const x=100+i*47;ellipse(x,240-Math.sin(i)*20,50,75,i%2?'#a5b798':'#b7c8a9');line(x,240,x+10,282,'#8e9e7c');}
 rect(260,44,10,243,'#b29a78');rect(85,165,362,8,'#b29a78');rect(70,286,397,14,'#bba484');
 // Muslin curtains and warm pools of sunlight.
 c.fillStyle='#f7efdf';c.beginPath();c.moveTo(55,28);c.lineTo(126,28);c.quadraticCurveTo(123,165,78,290);c.lineTo(48,290);c.fill();c.beginPath();c.moveTo(418,28);c.lineTo(480,28);c.lineTo(490,290);c.lineTo(457,290);c.quadraticCurveTo(425,162,418,28);c.fill();
 c.fillStyle='#fff4c728';c.beginPath();c.moveTo(100,300);c.lineTo(440,300);c.lineTo(650,555);c.lineTo(155,555);c.fill();
 // Shelves, cups, jars, hand-painted sign.
 rect(560,48,330,118,'#cfbea0');rect(568,56,314,101,'#ede4d1');text('M E B I   T R À',725,102,23);text('Pha bằng một chút dịu dàng',725,133,13,'#889170');
 rect(535,213,380,12,'#9f8563');rect(535,294,380,12,'#9f8563');
 for(let i=0;i<7;i++){const x=560+i*49;rect(x,176,30,35,i%2?'#c7d1aa':'#e5ceb0');rect(x-2,172,34,6,'#aa8e69');rect(x+7,185,16,13,'#f0e8d7');}
 for(let i=0;i<6;i++){const x=560+i*55;rect(x,253,30,38,'#f9efda');ellipse(x+15,252,15,4,'#d5c1a1');line(x+30,260,x+36,260,'#f9efda',5);line(x+36,260,x+36,279,'#f9efda',5);}
 function plant(x,y,scale=1){ellipse(x,y+8,25*scale,8*scale,'#74684d20');c.fillStyle='#b99176';c.beginPath();c.moveTo(x-20*scale,y-27*scale);c.lineTo(x+20*scale,y-27*scale);c.lineTo(x+14*scale,y+6*scale);c.lineTo(x-14*scale,y+6*scale);c.fill();for(let i=0;i<5;i++){const a=i*1.3+t*.02,dx=Math.cos(a)*24*scale,dy=-40*scale-Math.sin(a)*13*scale;line(x,y-26*scale,x+dx,y+dy,'#73845e',3*scale);ellipse(x+dx,y+dy,10*scale,18*scale,i%2?'#83976a':'#9eae81');}}
 plant(45,350,1.5);plant(923,349,1.4);plant(511,212,.6);
 if(s.decor.includes('rug')){ellipse(290,477,175,55,'#bd8f79');ellipse(290,477,158,44,'#d5b89a');}
 if(s.decor.includes('painting')){rect(478,69,51,72,'#9e8364');rect(483,74,41,62,'#ece8d3');plant(503,126,.45);}
 if(s.decor.includes('lamp')){line(505,0,505,55,'#796d57');c.fillStyle='#cfb78b';c.beginPath();c.moveTo(505,48);c.lineTo(469,90);c.lineTo(541,90);c.fill();ellipse(505,91,35,5,'#eee0ae');}
 if(s.decor.includes('cat')){ellipse(397,284,36,13,'#b79577');ellipse(422,274,15,15,'#b79577');c.fillStyle='#b79577';c.beginPath();c.moveTo(411,266);c.lineTo(412,251);c.lineTo(423,263);c.lineTo(436,252);c.lineTo(436,272);c.fill();line(418,272,421,272,'#544734');line(428,272,431,272,'#544734');}
 if(s.decor.includes('plant'))plant(476,365,.8);
 // Wooden counter in a shallow isometric perspective.
 c.fillStyle='#c1a17e';c.beginPath();c.moveTo(505,355);c.lineTo(930,355);c.lineTo(980,399);c.lineTo(550,399);c.fill();rect(550,399,430,120,'#b48f69');rect(560,409,410,99,'#c9a982');for(let x=585;x<975;x+=36)line(x,413,x,502,'#b7946b');rect(547,393,435,13,'#e0c49c');
 // Tea brewer, register and a cup with steam.
 rect(590,302,75,70,'#74826b');rect(599,314,56,42,'#c5c9b1');rect(609,323,36,26,'#9b7856');rect(607,294,40,10,'#a7ae94');rect(680,344,42,37,'#f0dfc0');ellipse(701,343,21,5,'#b99470');
 for(let i=0;i<3;i++){c.strokeStyle='#fff7e9aa';c.lineWidth=3;c.beginPath();c.moveTo(688+i*12,332);c.bezierCurveTo(675+i*12+Math.sin(t)*4,319,710+i*12,310,690+i*12,294);c.stroke();}
 rect(832,328,66,48,'#697263');rect(839,334,52,30,'#c6c9ad');rect(850,378,30,8,'#8d8b70');
 // Small barista.
 function person(x,y,color,name,active=false,gender=null){ellipse(x,y+53,32,10,'#4b493c22');line(x-10,y+25,x-13,y+51,'#756951',9);line(x+10,y+25,x+15,y+51,'#756951',9);ellipse(x,y+8,27,33,color);if(gender==='female'){ellipse(x+22,y-28,15,30,'#624b3c');ellipse(x,y-34,28,34,'#624b3c');}ellipse(x,y-33,24,27,'#ecd1b1');ellipse(x,y-49,25,15,'#705441');rect(x-24,y-49,9,gender==='female'?41:22,'#705441');if(gender==='female'){rect(x+17,y-45,8,37,'#624b3c');ellipse(x+29,y-43,6,5,'#c59586');}ellipse(x-8,y-33,2,2,'#544636');ellipse(x+8,y-33,2,2,'#544636');c.strokeStyle='#a6765f';c.beginPath();c.arc(x,y-28,5,0,Math.PI);c.stroke();if(active){ellipse(x,y+57,38,12,'#8fa57560');text('EN COURS',x,y+83,9,'#586e49');}if(name)text(name,x,y+75,13);}
 person(768,309,'#7c956e','',false,s.ownerGender||'male');
 const seats=[[190,366],[359,405],[100,454],[410,475],[240,485]];
 for(let i=0;i<2+(s.upgrades.seats||0);i++){const [x,y]=seats[i];ellipse(x,y+50,47,12,'#77684f20');line(x,y+13,x,y+65,'#987b58',9);ellipse(x,y+10,50,21,'#d9bd94');ellipse(x,y+5,50,20,'#e6cda7');}
 for(let i=0;i<s.orders.length;i++){const o=s.orders[i],p=seats[i];if(p)person(p[0],p[1]-14,['#d8ad93','#8fa99b','#b39fbe','#d6a7ac','#a5b4c7'][o.person],['An','Minh','Bà Linh','Bông','Hải'][o.person],selected===o.id);}
 if(s.decor.includes('sign'))text('CHÀO BẠN, MỜI GHÉ CHƠI',748,480,17,'#786146');
 // Evening wash follows the seven-minute service day.
 if(s.time>230)rect(0,0,1000,580,`rgba(164,109,75,${Math.min(.16,(s.time-230)/1200)})`);
}
