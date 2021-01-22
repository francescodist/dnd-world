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