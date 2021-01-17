
var game = {};


function createGame(){
    var name = document.getElementById("name").value;
    if(name === null || name.trim() === ""){
      document.getElementById("message").innerHTML = "A Name is required to create a New Game!";
      return;
    }
    var game = {name};
    postData("/creategame",game);
    document.getElementById("message").innerHTML = "New Game created!";

  }