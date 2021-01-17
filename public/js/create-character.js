async function createCharacter() {
  const form = document.querySelector("#characterForm");
  const formData = new FormData(form);
  const gameId = window.location.pathname.split("/").pop();
  const values = Array.from(formData.entries());
  const isValid = values.every((value) => value[1].length > 0);
  if (isValid) {
    const res = await postData("/new-character", {
      gameId,
      name: formData.get("name"),
      class: formData.get("class"),
      stats: {
        str: {
          base: Number(formData.get("str-base")),
          mod: Number(formData.get("str-mod")),
        },
        des: {
          base: Number(formData.get("des-base")),
          mod: Number(formData.get("des-mod")),
        },
        cos: {
          base: Number(formData.get("cos-base")),
          mod: Number(formData.get("cos-mod")),
        },
        int: {
          base: Number(formData.get("int-base")),
          mod: Number(formData.get("int-mod")),
        },
        sag: {
          base: Number(formData.get("sag-base")),
          mod: Number(formData.get("sag-mod")),
        },
        car: {
          base: Number(formData.get("car-base")),
          mod: Number(formData.get("car-mod")),
        },
      },
      dice: Number(formData.get("dice")),
      armor: Number(formData.get("armor")),
      pfMax: Number(formData.get("pf")),
      load: Number(formData.get("load")),
    });
    window.location = "/character/" + res._id;
  } else {
    alert("Please fill all the values!");
  }
}
