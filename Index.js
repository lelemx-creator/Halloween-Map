const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const HOUSES_FILE = "houses.json";
const GHOSTS_FILE = "ghosts.json";

function read(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
}
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get("/houses", (req, res) => res.json(read(HOUSES_FILE)));
app.post("/houses", (req, res) => {
  const data = read(HOUSES_FILE);
  data.push(req.body);
  write(HOUSES_FILE, data);
  res.sendStatus(200);
});

app.get("/ghosts", (req, res) => {
  const now = Date.now();
  const ghosts = read(GHOSTS_FILE).filter(g => now - g.ts < 45 * 60 * 1000);
  write(GHOSTS_FILE, ghosts);
  res.json(ghosts);
});

app.post("/ghosts", (req, res) => {
  const ghosts = read(GHOSTS_FILE);
  ghosts.push({
    lat: req.body.lat,
    lng: req.body.lng,
    ts: Date.now()
  });
  write(GHOSTS_FILE, ghosts);
  res.sendStatus(200);
});

app.listen(3000, () => console.log("🎃 Server läuft"));
