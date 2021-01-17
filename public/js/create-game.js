async function createGame(){
    var name = document.getElementById("name").value;
    if(name === null || name.trim() === ""){
      document.getElementById("message").innerHTML = "A Name is required to create a New Game!";
      return;
    }
    const game = {name};
    const {_id} = await postData("/creategame",game);
    window.location = '/game/' + _id;
    document.getElementById("message").innerHTML = "New Game created!";

  }