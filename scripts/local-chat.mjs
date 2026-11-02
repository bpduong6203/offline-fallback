import {SharedChatRoom} from '../src/shared-chat-room.js';
import {handleChat,injectChatHtml} from '../src/shared-chat.js';
import {SHARED_CHAT_CLIENT} from '../src/shared-chat-client.js';

export function localChat(){
  const data=new Map();
  const room=new SharedChatRoom({blockConcurrencyWhile:fn=>fn(),storage:{get:async key=>structuredClone(data.get(key)),put:async(key,value)=>{data.set(key,structuredClone(value));}}});
  const env={CHAT:{idFromName:name=>name,get:()=>room}};
  return {
    decorate(res){
      const end=res.end,writeHead=res.writeHead;let html=false;
      res.writeHead=function(status,...args){const headers=args.find(arg=>arg&&typeof arg==='object');html=String(headers?.['Content-Type']||headers?.['content-type']||res.getHeader('Content-Type')||'').includes('text/html');if(html&&headers){delete headers['Content-Length'];delete headers['content-length'];}return writeHead.call(this,status,...args);};
      res.end=function(body,...args){if(typeof body==='string'&&html)body=injectChatHtml(body);return end.call(this,body,...args);};
    },
    async http(req,res){
      const path=req.url?.split('?')[0];
      if(path==='/shared-chat.js'){res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8'});res.end(req.method==='HEAD'?null:SHARED_CHAT_CLIENT);return true;}
      if(path!=='/api/chat')return false;
      let body='';for await(const chunk of req)body+=chunk;
      const response=await handleChat(new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})}),env);
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return true;
    }
  };
}
