require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const log = require("./utils/log");
const path = require("path");
const nodemailer = require('nodemailer');
const authRouter = require("./server/auth.js");
const studentRouter = require("./server/student.js");


if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = "development";
const Certificates = require("./model/Certificates");
const Student = require("./model/Student");
const { metadata } = require("core-js/fn/reflect");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
//smtp transporter

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
app.use("/auth", authRouter);
app.use("/student", studentRouter);
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

//api to mail the certificate link post /certificate/mail/:id using nodemailer



app.post("/certificate/generate", async (req, res) => {
  const { candidateName,studentId, orgName, courseName, assignDate,ipfsHash ,duration } = req.body;
  //get student details by ID and append the metadata to the metadata

try {
    const student = await Student.findById(studentId); // Use async/await for clarity

    if (!student) {
      return res.status(400).send({ err: "Student data doesn't exist" });
    }

    const { _id, ...metaData } = student.toJSON(); // Destructure student data

    const newMetaData = { ...metaData }; // Combine metaData and studentData

  const given = new Date(assignDate);

  let expirationDate = given.getTime();
  const encodedMetaData = Buffer.from(JSON.stringify(newMetaData)).toString('base64');
  const certificate = new Certificates({
    candidateName,
    studentId,
    orgName,
    courseName,
    metaData: encodedMetaData,
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
          //save the transaction hash and block hash to the database
          return Certificates.findByIdAndUpdate(obj._id, { transactionHash, blockHash })
            .then(() => res.status(201).send({
              receipt: {
                transactionHash,
                blockHash
              },
              data: dbRes
            }))
         
          
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => {
      log.Error(err);
      res.status(400).send();
    });
  } catch (err) {
    log.Error(err);
    res.status(500).send();
  }

});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}


//smtp controller for mailing user certificate
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  secure: true,
});


app.post("/certificate/mail/:id", (req, res) => {
  const { to, subject, text, html } = req.body;
  const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
      html
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.status(400).send({error});
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({message: "Email sent"});
      }
    });
}
);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  log.Info(
    `This is a ${
      process.env.NODE_ENV
    } environment.\nServer is up on port ${port}`
  );
});

module.exports = { app };
