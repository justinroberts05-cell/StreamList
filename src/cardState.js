export const formatCardNumber=(value)=>value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
export function validateCard(card,now=new Date()){
 if(!card.name.trim())return 'Enter the cardholder name.';
 if(!/^\d{4} \d{4} \d{4} \d{4}$/.test(card.number))return 'Enter exactly 16 digits, formatted as 1234 5678 9012 3456.';
 if(!/^(0[1-9]|1[0-2])\/\d{4}$/.test(card.expiry))return 'Enter expiration as MM/YYYY.';
 const [month,year]=card.expiry.split('/').map(Number);
 if(year<now.getFullYear()||(year===now.getFullYear()&&month<now.getMonth()+1))return 'The expiration date has passed.';
 return '';
}
