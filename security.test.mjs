import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyGoogleToken,server} from './server.mjs';
import {formatCardNumber,validateCard} from './src/cardState.js';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const key={...publicKey.export({format:'jwk'}),kid:'test-key'};
const claims={sub:'account-1',email:'test@example.com',name:'Test User',email_verified:true,iss:'https://accounts.google.com',aud:'client',nonce:'nonce',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300};
function token(payload,header={alg:'RS256',kid:'test-key'}){const data=[header,payload].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');return data+'.'+sign('RSA-SHA256',Buffer.from(data),privateKey).toString('base64url');}
test('Google identity requires signature, audience, issuer, nonce and current expiry',async()=>{
 assert.equal((await verifyGoogleToken(token(claims),'nonce','client',async()=>[key])).sub,'account-1');
 for(const change of [{aud:'other'},{nonce:'other'},{iss:'attacker'},{exp:1},{email_verified:false},{iat:claims.exp+1000}])await assert.rejects(()=>verifyGoogleToken(token({...claims,...change}),'nonce','client',async()=>[key]));
 await assert.rejects(()=>verifyGoogleToken(token(claims,{alg:'none',kid:'test-key'}),'nonce','client',async()=>[key]));
 await assert.rejects(()=>verifyGoogleToken(token(claims)+'tampered','nonce','client',async()=>[key]));
});
test('card formatting and required fields reject incomplete and expired values',()=>{
 assert.equal(formatCardNumber('1234567890123456'),'1234 5678 9012 3456');
 assert.equal(formatCardNumber('1234-abcd-5678'),'1234 5678');
 const card={name:'Demo User',number:'1234 5678 9012 3456',expiry:'12/2030'};
 assert.equal(validateCard(card,new Date('2026-10-11')),'');
 for(const change of [{number:'1234 5678'},{name:''},{expiry:'00/2030'},{expiry:'01/2020'}])assert.ok(validateCard({...card,...change},new Date('2026-10-11')));
});
test('anonymous session and cross-origin requests do not grant access',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port;
 assert.deepEqual(await(await fetch(base+'/api/session')).json(),{user:null});
 assert.equal((await fetch(base+'/api/login',{method:'POST',headers:{Origin:'https://attacker.example'},body:'{}'})).status,403);
 assert.equal((await fetch(base+'/api/login',{method:'POST',headers:{Origin:process.env.APP_ORIGIN||'http://localhost:5173'},body:'{}'})).status,401);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
