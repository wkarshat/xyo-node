"use strict";
let express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  xyo = require("./xyo.js"),
  format = require("string-format"),
  archivist = new xyo.Archivist();

/* ================= */
/*  Local Functions  */
/* ================= */

const addEntriesToDatabase = function(entries) {
  entries.forEach((entry) => {
    let pk1Entries = archivist.entriesById[entry.pk1] || [],
      pk2Entries = archivist.entriesById[entry.pk2] || [];

    archivist.entriesById[entry.pk1] = pk1Entries;
    archivist.entriesById[entry.pk2] = pk2Entries;

    archivist.entries.push(entry);
    pk1Entries.push(entry);
    pk2Entries.push(entry);
  });
};

/* ============= */
/*  Application  */
/* ============= */

app.use(bodyParser.json()); // for parsing application/json

app.get("*", (req, res) => {
  let parts = req.path.split("/"),
    id = null;

  if (parts.length > 1) {
    id = parts[1];
  }
  if (id != null) {
    let entries = archivist.entriesById[id];

    if (entries) {
      res.send({
        "id": id,
        "entries": archivist.entriesById[id]
      });
    } else {
      res.status(404).send(format("(${}) Not Found", id));
    }
  } else {
    res.status(404).send(req.path);
  }
});

app.post("/", (req, res) => {
  let action = req.body.action;

  switch (action) {
    case "add":
      addEntriesToDatabase(req.body.entries);
      res.status(201);
      res.send("OK");
      break;
    default:
      res.send("default");
      break;
  }
});

app.listen(3456);
