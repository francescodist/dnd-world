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
  }
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