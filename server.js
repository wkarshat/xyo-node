"use strict";
let express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  XYO = require("./xyo.js"),
  format = require("string-format"),
  config = require("config");

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = () => {
    if (config.archivists && config.archivists.length > 0) {
      config.archivists.forEach((archivist) => {
        XYO.ObjectMap[archivist.port] = XYO.ObjectMap[archivist.port] || new XYO.Archivist(archivist.port);
        app.listen(archivist.port);
      });
    }
    if (config.diviner && config.diviner.length > 0) {
      config.diviner.forEach((diviner) => {
        XYO.ObjectMap[diviner.port] = XYO.ObjectMap[diviner.port] || new XYO.Archivist(diviner.port);
        app.listen(diviner.port);
      });
    }
  },

  addEntriesToDatabase = (moniker, entries) => {
    let archivist = XYO.getObject(moniker);

    entries.forEach((entry) => {
      let pk1Entries = archivist.entriesById[entry.pk1] || [],
        pk2Entries = archivist.entriesById[entry.pk2] || [];

      archivist.entriesById[entry.pk1] = pk1Entries;
      archivist.entriesById[entry.pk2] = pk2Entries;

      archivist.entries.push(entry);
      pk1Entries.push(entry);
      pk2Entries.push(entry);
    });
  },

  returnJSONStatus = (req, res) => {
    let object = XYO.getObject(req.port);

    res.status(200).send(JSON.stringify(object.status()));
  };

/* ============= */
/*  Application  */
/* ============= */

app.use(bodyParser.json()); // for parsing application/json

app.get("/test", (req, res) => {
  res.status(200).send("testing...");
});

app.get("*", (req, res) => {
  let archivist = XYO.getObject(req.port),
    contentType = req.headers["content-type"],
    parts = req.path.split("/"),
    id = null;

  if (parts.length > 1) {
    id = parts[1];
  }
  if (id.length === 0) {
    if (!contentType || contentType.indexOf("application/json") !== 0) {
      returnJSONStatus(req, res);
    }
  } else if (id != null) {
    let entries = archivist().entriesById[id];

    if (entries) {
      res.send({
        "id": id,
        "entries": archivist().entriesById[id]
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

initialize();
