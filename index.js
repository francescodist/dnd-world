const http = require("http");
const express = require("express");
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = require("socket.io")(server, { transports: ["websocket"] });
//Loads the handlebars module
const handlebars = require("express-handlebars");
//Sets our app to use the handlebars engine
app.set("view engine", "handlebars");
//Sets handlebars configurations (we will go through them later on)
app.engine(
  "handlebars",
  handlebars({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);
app.use(express.static("public"));
app.get("/", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("main", { layout: "index" });
});

app.get("/join", async (req, res) => {
  const data = await getGames();
  res.render("join", { layout: "index", data });
});

function getGames() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Game 1", id: 1 },
        { name: "Game 2", id: 2 },
      ]);
    }, 200);
  });
}

app.get("/users", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("users", { layout: "index" });
});

setInterval(() => {
  io.sockets.emit("hello", "hiiii");
}, 2000);

server.listen(port);
