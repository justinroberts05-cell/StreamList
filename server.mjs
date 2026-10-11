import http from 'node:http';
import { randomBytes, createPublicKey, verify } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(root,'.env')); } catch { /* Environment variables may be supplied by hosting. */ }
const clientId=process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const origin=process.env.APP_ORIGIN || 'http://localhost:5173';
const sessions=new Map(),nonces=new Map();
let keys=[],keysUntil=0;
function cookie(req,name){return req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);}
function setCookie(res,name,value,maxAge){res.setHeader('Set-Cookie',`${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${origin.startsWith('https:')?'; Secure':''}`);}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
export async function verifyGoogleToken(token,expectedNonce,audience,loadKeys=async()=>{
 if(Date.now()>keysUntil){const response=await fetch('https://www.googleapis.com/oauth2/v3/certs',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Google verification unavailable');keys=(await response.json()).keys;keysUntil=Date.now()+300000;}
 return keys;
}){
 const parts=token.split('.');if(parts.length!==3)throw new Error('Invalid token');
 const header=JSON.parse(Buffer.from(parts[0],'base64url'));const claims=JSON.parse(Buffer.from(parts[1],'base64url'));
 if(header.alg!=='RS256')throw new Error('Invalid algorithm');
 const jwk=(await loadKeys()).find(k=>k.kid===header.kid);
 if(!jwk||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw new Error('Invalid signature');
 const now=Math.floor(Date.now()/1000);
 if(!audience||claims.aud!==audience||!['accounts.google.com','https://accounts.google.com'].includes(claims.iss)||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60||claims.nonce!==expectedNonce||!expectedNonce||!claims.sub||claims.email_verified!==true)throw new Error('Invalid identity');
 return {sub:claims.sub,name:claims.name||claims.email,email:claims.email,expires:claims.exp};
}
export const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  for(const [key,value] of sessions)if(value.expires<=Date.now()/1000)sessions.delete(key);
  for(const [key,value] of nonces)if(value.until<Date.now())nonces.delete(key);
  if(url.pathname.startsWith('/api/')){
   if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Request origin rejected.'});
   if(req.method==='GET'&&url.pathname==='/api/session')return json(res,200,{user:sessions.get(cookie(req,'streamlist_session'))||null});
   if(req.method==='GET'&&url.pathname==='/api/auth/nonce'){
    if(!clientId)return json(res,503,{error:'Google sign-in needs a configured client ID.'});
    const existingId=cookie(req,'streamlist_nonce'),existing=nonces.get(existingId);
    if(existing&&existing.until>Date.now())return json(res,200,{nonce:existing.nonce,clientId});
    const id=randomBytes(24).toString('hex'),nonce=randomBytes(24).toString('hex');nonces.set(id,{nonce,until:Date.now()+900000});setCookie(res,'streamlist_nonce',id,900);return json(res,200,{nonce,clientId});
   }
   if(req.method==='POST'&&url.pathname==='/api/logout'){sessions.delete(cookie(req,'streamlist_session'));setCookie(res,'streamlist_session','',0);return json(res,200,{ok:true});}
   if(req.method==='POST'&&url.pathname==='/api/login'){
    const id=cookie(req,'streamlist_nonce'),entry=nonces.get(id);
    if(!entry||entry.until<Date.now())return json(res,401,{error:'Sign-in expired. Reload and try again.'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>16384)return json(res,413,{error:'Request too large.'});}
    const user=await verifyGoogleToken(JSON.parse(body).credential,entry.nonce,clientId);
    if(nonces.get(id)!==entry)return json(res,401,{error:'Sign-in request already used. Please retry.'});
    nonces.delete(id);
    const session=randomBytes(32).toString('hex');sessions.delete(cookie(req,'streamlist_session'));sessions.set(session,user);setCookie(res,'streamlist_session',session,Math.max(0,user.expires-Math.floor(Date.now()/1000)));return json(res,200,{user});
   }
   return json(res,404,{error:'Unknown endpoint.'});
  }
  // Production server serves the built SPA. API responses never enter its shell cache.
  const requested=decodeURIComponent(url.pathname);const base=path.join(root,'dist');
  const target=path.resolve(base,'.'+requested);if(!target.startsWith(base+path.sep)&&target!==base)return json(res,403,{error:'Invalid path.'});
  const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
  let data,file=target;try{data=await readFile(file);}catch{if(path.extname(requested))return json(res,404,{error:'File missing.'});file=path.join(base,'index.html');data=await readFile(file);}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{json(res,401,{error:'Sign-in could not be verified. Please retry.'});}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('StreamList authentication server ready on port '+(process.env.PORT||3001)));
