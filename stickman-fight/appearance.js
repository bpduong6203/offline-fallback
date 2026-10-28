export function appearance(c,p,color,head,hand){
 c.save();c.shadowBlur=0;c.lineWidth=3;c.strokeStyle=color;c.fillStyle='#1a2b3c';
 if(p.preset==='boxer'){c.strokeStyle='#ffe0ae';c.beginPath();c.moveTo(-16,head-3);c.lineTo(15,head-3);c.moveTo(-15,head-3);c.lineTo(-27,head+8);c.moveTo(-16,head-2);c.lineTo(-31,head+2);c.stroke();c.strokeStyle=color;c.fillStyle=color;c.beginPath();c.arc(hand[0],hand[1],6,0,7);c.fill();}
 if(p.preset==='ronin'){c.fillStyle='#384a5d';c.beginPath();c.moveTo(-26,head-9);c.lineTo(-2,head-31);c.lineTo(25,head-9);c.closePath();c.fill();c.stroke();c.strokeStyle='#ffcf95';c.lineWidth=5;c.beginPath();c.moveTo(-9,head+18);c.lineTo(10,head+18);c.moveTo(-8,head+20);c.lineTo(-29,head+29);c.stroke();}
 if(p.preset==='agent'){c.lineWidth=5;c.beginPath();c.arc(0,head-2,18,Math.PI,Math.PI*2);c.stroke();c.fillStyle='#101923';c.fillRect(-13,head-7,28,10);c.strokeStyle='#d9f8ff';c.lineWidth=3;c.beginPath();c.moveTo(-9,head-2);c.lineTo(15,head-2);c.stroke();c.fillStyle='#32495a';c.fillRect(-9,head+27,18,24);c.strokeStyle=color;c.lineWidth=2;c.strokeRect(-9,head+27,18,24);}
 c.restore();
}
export function drawWeapon(c,kind,x,y,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.shadowBlur=0;c.lineCap='round';
 if(kind==='baton'){c.strokeStyle='#b7c9d8';c.lineWidth=7;c.beginPath();c.moveTo(-6,0);c.lineTo(37,0);c.stroke();c.strokeStyle='#394c60';c.lineWidth=8;c.beginPath();c.moveTo(-6,0);c.lineTo(8,0);c.stroke();}
 if(kind==='katana'){c.strokeStyle='#d3f6ff';c.lineWidth=5;c.beginPath();c.moveTo(8,0);c.lineTo(61,0);c.lineTo(68,-4);c.stroke();c.strokeStyle='#ffce83';c.lineWidth=4;c.beginPath();c.moveTo(9,-9);c.lineTo(9,9);c.stroke();c.strokeStyle='#34475e';c.lineWidth=7;c.beginPath();c.moveTo(-10,0);c.lineTo(6,0);c.stroke();}
 if(kind==='pistol'){c.fillStyle='#b9cad7';c.fillRect(-4,-7,28,9);c.fillStyle='#34475c';c.fillRect(-2,1,9,14);c.fillStyle='#edc990';c.fillRect(18,-6,7,6);c.strokeStyle='#101c2d';c.lineWidth=2;c.strokeRect(-4,-7,28,9);}
 c.restore();}
