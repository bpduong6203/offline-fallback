export class Input {
  constructor(active,pause,bomb){
    this.keys=new Set();this.pointers=new Map();this.controller=new AbortController();const signal=this.controller.signal;
    const codes=['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape'];
    window.addEventListener('keydown',e=>{if(!active()||!codes.includes(e.code))return;e.preventDefault();if(!e.repeat){if(e.code==='Escape')pause();if(e.code==='Space')bomb(0);if(e.code==='Enter')bomb(1);}this.keys.add(e.code);},{signal});
    window.addEventListener('keyup',e=>this.keys.delete(e.code),{signal});
    window.addEventListener('blur',()=>{this.clear();pause(true);},{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();pause(true);}},{signal});
    for(const b of document.querySelectorAll('[data-control]')) {
      b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,b.dataset.control);if(b.dataset.control==='Space')bomb(0);},{signal});
      for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,e=>this.pointers.delete(e.pointerId),{signal});
    }
  }
  clear(){this.keys.clear();this.pointers.clear();}
  direction(id){const set=new Set([...this.keys,...this.pointers.values()]);const codes=id===0?['KeyA','KeyD','KeyW','KeyS']:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];const dx=Number(set.has(codes[1]))-Number(set.has(codes[0])),dy=Number(set.has(codes[3]))-Number(set.has(codes[2]));return dx?[dx,0]:[0,dy];}
  destroy(){this.controller.abort();this.clear();}
}
