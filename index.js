const http = require("http");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require("socket.io")(server, { transports: ["websocket"] });
const handlebars = require("express-handlebars");
const multer = require("multer")
const upload = multer({ dest: 'uploads/' })
const fs = require("fs")

if(process.env.SHOULD_SYNC) {
  syncPdfFiles();
}

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://dnd-world.ugyx6.mongodb.net/dungeon-world", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
});

const Game = mongoose.model("Game", { name: String });
const Stat = new mongoose.Schema({ base: Number, mod: Number });
const Stats = new mongoose.Schema({
  str: Stat,
  cos: Stat,
  des: Stat,
  int: Stat,
  sag: Stat,
  car: Stat,
});
const Character = mongoose.model("Character", {
  gameId: String,
  name: String,
  class: String,
  stats: Stats,
  dice: Number,
  armor: Number,
  pf: Number,
  pfMax: Number,
  load: Number,
  exp: Number,
  level: Number
});

const PdfData = mongoose.model("PdfData",{data: Buffer, name: String})

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.set("view engine", "handlebars");
//Sets handlebars configurations (we will go through them later on)
app.engine(
  "handlebars",
  handlebars({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    defaultLayout: "index",
    helpers: {
      canLevelUp(character) {
        return character.exp >= 7 + character.level;
      }
    }
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
  return Game.find().lean();
}

app.get("/users", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("users", { layout: "index" });
});

app.get("/creategame", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("creategame", { layout: "index" });
});

app.post("/creategame", async (req, res) => {
  const data = await Game.create(req.body);
  res.json(data);
});

app.post("/healCharacter", async (req, res) => {
  //const data = await Game.create(req.body);
  console.log(req.body);
  var query = { _id: req.body.characterId };
  const character = await Character.findById(req.body.characterId).lean();
  previousPf = character.pf;
  const data = await Character.updateOne(query, { pf: previousPf + req.body.pfToAdd });
  io.sockets.emit("update");
  res.json(data);
});

app.post("/damageCharacter", async (req, res) => {
  //const data = await Game.create(req.body);
  console.log(req.body);
  var query = { _id: req.body.characterId };
  const character = await Character.findById(req.body.characterId).lean();
  previousPf = character.pf;
  const data = await Character.updateOne(query, { pf: previousPf - req.body.pfToSub });
  io.sockets.emit("update");
  res.json(data);
});


app.get("/game/:gameId/", async (req, res) => {
  const { gameId } = req.params;
  const game = await Game.findById(gameId).lean();
  const characters = await Character.find({ gameId }).lean();
  res.render("game", { layout: "index", game, characters: characters.map(getCharacterWithShortname) });
});

app.get("/new-character/:gameId", (req, res) => {
  res.render("new-character");
});

app.post("/new-character", async (req, res) => {
  const character = req.body;
  const data = await Character.create({ ...character, pf: character.pfMax, exp: 0, level: 1 });
  res.json(data);
});

app.get("/character/:id", async (req, res) => {
  const { id } = req.params;
  const character = await Character.findById(id).lean();
  const characters = await Character.find({ _id: { $ne: id } }).lean();
  res.render("character", { character: getCharacterWithShortname(character), characters: characters.map(getCharacterWithShortname) });
});

app.put("/character/:id", async (req, res) => {
  const { id } = req.params;
  const result = await Character.updateOne({ _id: id }, { ...req.body }).lean();
  if (req.body.hasOwnProperty("pf") || req.body.hasOwnProperty("pfMax")) {
    io.sockets.emit("updateHealth", { ...req.body, id })
  }
  if(req.body.hasOwnProperty("level")) {
    io.sockets.emit("updateLevel", {...req.body, id})
  }
  res.json(result)
})

app.get("/dungeon-master/:gameId", async (req, res) => {
  const characters = await Character.find().lean();
  res.render("dungeon-master", {characters: characters.map(getCharacterWithShortname)});
});

app.post("/load-pdf",upload.single('upload'),async (req,res) => {
  console.log(JSON.stringify(req.body))
  const {path} = req.file
  const {name} = req.body;
  const newPath = `public/pdf/uploads/${name}`
  fs.rename(path, newPath, (err) => {
    if(!err) {
      console.log(`File: ${name} uploaded successfully`)
      fs.readFile(newPath, {encoding: "binary"}, async (err, data) => {
        const pdf = { name, data: Buffer.from(data, "binary") }
        await PdfData.deleteMany({name});
        PdfData.create(pdf);
      })
    }
    else console.error(`Error loading file ${name}`, err)
  })
  
  res.json({})
})

io.on('connection', (socket) => {
  socket.on('playerRoll' , data => {

    socket.broadcast.emit('updateRollPlayer', data);
  });
});

function syncPdfFiles() {
  fs.mkdir("public/pdf", () => {
    fs.mkdir("public/pdf/uploads", async () => {
      const pdfs = await PdfData.find();
      pdfs.forEach(({ name, data }) => {
        fs.writeFile(`public/pdf/uploads/${name}`, data, 'binary', console.log)
      })
    })
  });
}

function getCharacterWithShortname(character) {
  return {
    ...character,
    shortName: character.name.split(" ").shift()
  }
}

server.listen(port);
