import {getMeritIdentity} from './mebi-merit-api.js';
import {requireGameLogin} from './auth.js';

export function injectChatHtml(html){
  if(html.includes('src="/shared-chat.js"'))return html;
  const tag='<script defer src="/shared-chat.js"></script>';
  return /<\/body\s*>/i.test(html)?html.replace(/<\/body\s*>/i,tag+'</body>'):html+tag;
}
export async function withSharedChat(response){
  if(!response.body||!(response.headers.get('Content-Type')||'').includes('text/html'))return response;
  const headers=new Headers(response.headers);headers.delete('Content-Length');headers.delete('Content-Encoding');headers.delete('ETag');
  return new Response(injectChatHtml(await response.text()),{status:response.status,headers});
}
export async function handleChat(request,env){
  if(!['GET','POST'].includes(request.method))return new Response('Method Not Allowed',{status:405});
  const origin=request.headers.get('Origin');
  if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
  if(!(await requireGameLogin(request,env)))return Response.json({error:'Đăng nhập trang chủ để dùng chat.'},{status:401});
  if(!env?.CHAT)return Response.json({error:'Chat chung chưa được cấu hình trên server.'},{status:503});
  let input;
  if(request.method==='POST'){
    if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return new Response('JSON required',{status:415});
    const reader=request.body?.getReader();let size=0,raw='';
    if(reader){const decoder=new TextDecoder();for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return new Response('Payload too large',{status:413});}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}
    try{input=JSON.parse(raw);}catch{return new Response('Invalid JSON',{status:400});}
  }
  const identity=await getMeritIdentity(request,env);
  try{
    const response=await env.CHAT.get(env.CHAT.idFromName('global')).fetch(new Request('https://chat.internal/messages',{method:request.method,headers:{'Content-Type':'application/json','X-Mebi-Chat-Identity':identity.id},...(input?{body:JSON.stringify({name:input.name,text:input.text,requestId:input.requestId})}:{})}));
    const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');if(identity.cookie)headers.append('Set-Cookie',identity.cookie);
    return new Response(response.body,{status:response.status,headers});
  }catch{return Response.json({error:'Không kết nối được chat. Vui lòng thử lại.'},{status:503});}
}
