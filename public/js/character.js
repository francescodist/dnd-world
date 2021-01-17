async function heal(){
    const pfToAdd = Number(document.getElementById("quantity-health").value);
    const characterId = window.location.pathname.split("/").pop();
    if(pfToAdd === null){
      return;
    }
    const params = {pfToAdd,characterId}
    const {_id} = await postData("/healCharacter",params);
    window.location = '/character/' + characterId;
  }

async function damage(){
const pfToSub = Number(document.getElementById("quantity-health").value);
const characterId = window.location.pathname.split("/").pop();
if(pfToSub === null){
    return;
}
const params = {pfToSub,characterId}
const {_id} = await postData("/damageCharacter",params);
window.location = '/character/' + characterId;
}