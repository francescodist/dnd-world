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