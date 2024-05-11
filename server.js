require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const log = require("./utils/log");
const path = require("path");

if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = "development";
const Certificates = require("./model/Certificates");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// logger
app.use((req, res, next) => {
  const now = new Date().toString().slice(4, 24);
  res.on("finish", () => {
    log.Logger(`${now} ${req.method} ${res.statusCode} ${req.url}`);
  });
  next();
});

// CORS
if (process.env.NODE_ENV !== "production") app.use(require("cors")());

app.get("/certificate/data/:id", (req, res) => {
  let certificateId = req.params.id;
  Certificates.findById(certificateId)
    .then(obj => {
      if (obj === null)
        res.status(400).send({ err: "Certificate data doesn't exist" });
      else res.send(obj);
    })
    .catch(err => res.status(400).send({ err }));
});

app.get("/certificate/verify/:id", (req, res) => {
  let certificateId = req.params.id;
  Certificates.findById(certificateId)
    .then(obj => {
      obj.verifyData().then(verified => {
        if (verified) res.status(200).send(verified);
        else res.status(401).send(verified);
      });
    })
    .catch(err =>
      res.status(400).send({ err: "No data found for the given certificateId" })
    );
});

app.post("/certificate/generate", (req, res) => {
  const { candidateName,studentId, orgName, courseName, assignDate,metaData,ipfsHash ,duration } = req.body;

  const given = new Date(assignDate);

  let expirationDate = given.getTime();

  const certificate = new Certificates({
    candidateName,
    studentId,
    orgName,
    courseName,
    metaData,
    ipfsHash,
    expirationDate,
    assignDate,
    duration
  });

  certificate
    .save()
    .then(obj => {
      const dbRes = obj.toJSON();
      obj
        .appendBlockchain()
        .then(data => {
          const { transactionHash, blockHash } = data.receipt;
          res.status(201).send({
            receipt: {
              transactionHash,
              blockHash
            },
            data: dbRes
          });
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => {
      log.Error(err);
      res.status(400).send();
    });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  log.Info(
    `This is a ${
      process.env.NODE_ENV
    } environment.\nServer is up on port ${port}`
  );
});

module.exports = { app };
