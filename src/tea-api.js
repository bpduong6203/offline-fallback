import {getMeritIdentity} from './mebi-merit-api.js';
import {requireGameLogin} from './auth.js';
export async function handleTeaRequest(request,env){
 if(!['GET','POST'].includes(request.method))return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET, POST'}});
 if(!(await requireGameLogin(request,env)))return new Response('Login required',{status:401});
 if(!env?.MERIT)return Response.json({error:'Ví công đức chưa sẵn sàng.'},{status:503});
 const url=new URL(request.url),origin=request.headers.get('Origin');
 if(origin&&origin!==url.origin)return new Response('Forbidden',{status:403});
 let raw;if(request.method==='POST'){if(!request.headers.get('Content-Type')?.startsWith('application/json'))return new Response('JSON required',{status:415});raw=await request.text();if(raw.length>4096)return new Response('Payload too large',{status:413});}
 const identity=await getMeritIdentity(request,env);
 const response=await env.MERIT.get(env.MERIT.idFromName(identity.id)).fetch(new Request('https://merit.internal/tea',{method:request.method,...(raw===undefined?{}:{body:raw,headers:{'Content-Type':'application/json'}})}));
 const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');if(identity.cookie)headers.append('Set-Cookie',identity.cookie);
 return new Response(response.body,{status:response.status,headers});
}
