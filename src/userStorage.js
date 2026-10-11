// Existing browser selections migrate to the first signed-in account only.
export function readUserData(key,userId){
 const scoped=localStorage.getItem(`${key}:${userId}`);
 if(scoped!==null)return scoped;
 const owner=localStorage.getItem('streamlist-legacy-owner');
 if(owner&&owner!==userId)return null;
 localStorage.setItem('streamlist-legacy-owner',userId);
 return localStorage.getItem(key);
}
