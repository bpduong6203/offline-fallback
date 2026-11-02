export class SharedChatRoom {
  constructor(ctx){
    this.ctx=ctx;this.queue=Promise.resolve();
    this.ready=ctx.blockConcurrencyWhile(async()=>{this.state=await ctx.storage.get('chat')||{messages:[],senders:[]};});
  }
  fetch(request){const job=this.queue.then(()=>this.handle(request));this.queue=job.catch(()=>{});return job;}
  async handle(request){
    await this.ready;
    if(request.method==='GET')return Response.json({messages:this.state.messages},{headers:{'Cache-Control':'no-store'}});
    if(request.method!=='POST')return new Response('Method Not Allowed',{status:405});
    let input;try{input=await request.json();}catch{return Response.json({error:'Tin nhắn không hợp lệ.'},{status:400});}
    const sender=request.headers.get('X-Mebi-Chat-Identity');
    const text=typeof input?.text==='string'?input.text.trim():'',name=typeof input?.name==='string'?input.name.trim():'';
    if(!sender||!text||text.length>300||!name||name.length>24||typeof input?.requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(input.requestId))return Response.json({error:'Tên tối đa 24 ký tự, tin nhắn tối đa 300 ký tự.'},{status:400});
    const key=sender+':'+input.requestId;
    if(this.state.senders.some(s=>s.key===key))return Response.json({messages:this.state.messages},{headers:{'Cache-Control':'no-store'}});
    const now=Date.now(),last=this.state.senders.findLast(s=>s.sender===sender);
    if(last&&now-last.time<2000)return Response.json({error:'Vui lòng chờ 2 giây giữa các tin nhắn.'},{status:429});
    const message={id:crypto.randomUUID(),name,text,time:now};
    const state={messages:[...this.state.messages,message].slice(-100),senders:[...this.state.senders,{sender,key,time:now}].slice(-1000)};
    await this.ctx.storage.put('chat',state);this.state=state;
    return Response.json({messages:state.messages},{headers:{'Cache-Control':'no-store'}});
  }
}
