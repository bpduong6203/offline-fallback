// Uses the existing shared profile binding; the game never owns a second wallet.
export function meritWallet(env){
  if(!env?.MERIT)return null;
  async function request(id,body){
    if(!id)throw new Error('Không xác định được ví Công đức. Vui lòng tải lại trang.');
    let response;
    try{response=await env.MERIT.get(env.MERIT.idFromName(id)).fetch(new Request('https://merit.internal/balance',{
      method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})
    }));}catch{throw new Error('Không lưu được công đức. Hệ thống sẽ thử lại.');}
    if(!response.ok){const error=new Error(response.status===409?'Không đủ công đức.':'Không lưu được công đức. Hệ thống sẽ thử lại.');error.insufficient=response.status===409;throw error;}
    return (await response.json()).balance;
  }
  return {get:id=>request(id),change:(id,delta,key)=>request(id,{delta,transactionId:key,requireFunds:true})};
}
