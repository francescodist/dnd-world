async function updatePF(pf) {
  await updateStat("pf", `${pf}`);
  const pfValue = document.querySelector("#pfValue");
  pfValue.innerHTML = `${pf}`;
}

function heal() {
  const pfToAdd = Number(document.getElementById("quantity-health").value);
  if (!pfToAdd) return;
  const pfMax = Number(document.querySelector('#pfMax').value);
  const currentPF = Number(document.querySelector("#pfValue").innerHTML.trim())
  const newPF = Math.min(pfToAdd + currentPF, pfMax);
  updatePF(newPF)
}

async function damage() {
  const pfToSub = Number(document.getElementById("quantity-health").value);
  if (!pfToSub) return;
  const currentPF = Number(document.querySelector("#pfValue").innerHTML.trim())
  updatePF(currentPF - pfToSub)
}

async function setPF() {
  const pfToSet = Number(document.getElementById("quantity-health").value);
  if (!(typeof pfToSet === 'number')) return;
  updatePF(pfToSet)
}

async function updateStat(stat, value) {
  if (typeof value === "string" && value.length > 0) {
    const characterId = window.location.pathname.split("/").pop();
    await putData(`/character/${characterId}`, { [stat]: value });
    if (stat === "pfMax") {
      const pfMaxValue = document.querySelector("#pfMaxValue");
      pfMaxValue.innerHTML = value;
    }
    if(stat === "exp") {
      const levelBtn = document.querySelector("#levelBtn");
      if(canLevelUp()) {
        levelBtn.disabled = false;
      } else {
        levelBtn.disabled = true
      }
    }
  }
}

async function levelUp() {
  const levelEl = document.querySelector("#level");
  const expEl = document.querySelector("#exp")
  const level = Number(levelEl.innerHTML);
  const exp = expEl.value;
  updateStat("level", `${level + 1}`);
  updateStat("exp", `${exp - (level + 7)}`);
  levelEl.innerHTML = `${level + 1}`;
  expEl.value = exp - (level + 7);
}

async function roll(die) {
  let total = 0;
  const dieResult = 1 + Math.floor(Math.random() * (die))
  const id = window.location.pathname.split("/").pop();
  const totalResultHtml = document.querySelector("#total-result");
  const totalResultPreviousValue = Number(document.querySelector("#total-result").innerText);
  const totalDisplay = document.querySelector("#total-display");
  const mod =  Number(document.querySelector("#mod-dice").value);
  const customMod =  Number(document.querySelector("#mod-dice-custom").value);

  if(totalResultPreviousValue == 0){
    total = dieResult + mod + customMod;
  } else {
    total = dieResult;
  }
  

  total += totalResultPreviousValue;
  const resultList = document.querySelector("#dice-results");
  

  resultList.innerHTML += '<div class="inner-item" >' + 
                          '<img src="/img/d'+die+'_blank.png" height="80px" width="80px">'+
                          '<div class="dice-number-result"><p>'+ dieResult+'</p></div>'+
                          '</div>';
  totalResultHtml.innerHTML = total;
  totalDisplay.innerHTML = '<h1>Total: </h1><h1 id="total-result">' + total + '</h1>'
  socket.emit('playerRoll', {total, id});
}

function resetDice(){
  const totalResultHtml = document.querySelector("#total-result");
  const resultList = document.querySelector("#dice-results");
  const totalDisplay = document.querySelector("#total-display");
  resultList.innerHTML = '';
  totalDisplay.innerHTML = '<h1 id="total-result"></h1>';

}

socket.on('updateHealth', data => {
  let element, value;
  if (data.hasOwnProperty('pf')) {
    element = document.querySelector(`#pfC${data.id}`);
    value = data.pf;
  } else if (data.hasOwnProperty('pfMax')) {
    element = document.querySelector(`#pfMaxC${data.id}`);
    value = data.pfMax
  }
  if (!element) return;
  element.innerHTML = value;
})

socket.on('updateLevel', ({level, id}) => {
  let levelElement = document.querySelector(`#levelC${id}`);
  levelElement.innerHTML = `${level}`
})

socket.on('updateRollPlayer', data => {
  const element = document.querySelector(`#Character${data.id}`);
  element.innerHTML = '<p><span>Rolled: ' + data.total + '</span></p>';
});



function loadPDF() {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    const fd = new FormData();
    const name = document.querySelector("#name").value.split(" ").shift();
    const id = window.location.pathname.split("/").pop();
    fd.append("upload", file);
    fd.append("name",`${name}_${id}.pdf`)
    postFile("/load-pdf",fd)
  }
  return false;
}

function canLevelUp() {
  const exp = document.querySelector("#exp").value;
  const level = Number(document.querySelector("#level").innerHTML)
  return exp >= level + 7;
}