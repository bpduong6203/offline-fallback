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
  direction(id){
    const codes=id===0?['KeyA','KeyD','KeyW','KeyS']:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    // The newest held direction wins, so a turn does not require releasing the old key first.
    const latest=[...this.keys,...this.pointers.values()].filter(code=>codes.includes(code)).at(-1);
    return latest===codes[0]?[-1,0]:latest===codes[1]?[1,0]:latest===codes[2]?[0,-1]:latest===codes[3]?[0,1]:[0,0];
  }
  destroy(){this.controller.abort();this.clear();}
}
