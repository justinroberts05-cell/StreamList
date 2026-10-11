import { useEffect, useRef, useState } from 'react';
let pendingNonce;
function getNonce(){
 if(!pendingNonce)pendingNonce=fetch('/api/auth/nonce').then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);return data;}).finally(()=>{pendingNonce=null;});
 return pendingNonce;
}
export default function Login({ onLogin }) {
 const button=useRef(null);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let active=true;
  async function setup(){try{
   const data=await getNonce();
   if(!window.google?.accounts?.id)await new Promise((resolve,reject)=>{let script=document.querySelector('#google-signin-script');if(!script){script=document.createElement('script');script.id='google-signin-script';script.src='https://accounts.google.com/gsi/client';script.async=true;document.head.append(script);}script.addEventListener('load',resolve,{once:true});script.addEventListener('error',()=>reject(new Error('Google sign-in could not load. Check your connection and reload.')),{once:true});});
   if(!active)return;
   button.current.replaceChildren();
   window.google.accounts.id.initialize({client_id:data.clientId,nonce:data.nonce,callback:async({credential})=>{try{const reply=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})});const result=await reply.json();if(!reply.ok)throw new Error(result.error);if(active)onLogin(result.user);}catch(err){if(active)setError(err.message);}}});
   window.google.accounts.id.renderButton(button.current,{theme:'filled_blue',size:'large',text:'signin_with'});
  }catch(err){if(active)setError(err.message||'Sign-in is unavailable. Start the authentication server and reload.');}}
  setup();return()=>{active=false;};
 },[onLogin,attempt]);
 return <main className="page shop-page"><section className="shop-container auth-panel"><p className="eyebrow">EZTechMovie</p><h1>Sign in to StreamList</h1><p>Use your Google account to open your watchlist, movie search, and shopping cart.</p><div ref={button} />{error&&<><p role="alert" className="cart-warning">{error}</p><button onClick={()=>{setError('');setAttempt(value=>value+1);}}>Retry Google sign-in</button></>}<p>Your Google password is entered only on Google’s sign-in screen.</p></section></main>;
}
