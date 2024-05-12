const { mongoose } = require("./mongoose");
const truffle_connect = require("../utils/connection");

truffle_connect.connectWeb3();

const CertificateSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true
  },
  studentId:{
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  metaData: {
    type: String,
    required: true,
    trim: true
  },
  ipfsHash: {
    type: String,
    required: true,
    trim: true
  },
  expirationDate: {
    type: Number,
    required: true,
    trim: true
  },
  assignDate: {
    type: Number,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    trim: true
  },
  transactionHash: {
    type: String,
    trim: true
  },
  blockHash: {
    type: String,
    trim: true
  }
});

CertificateSchema.methods.toJSON = function() {
  const data = this;
  const obj = data.toObject();

  return {
    ...obj,
    certificateId: obj._id.toString(),
    _id: undefined,
    __v: undefined
  };
};

CertificateSchema.methods.verifyData = function() {
  const data = this;
  console.log(data);
  const certificateId = data._id.toString();
  return truffle_connect
    .getCertificateData(certificateId)
    .then(blockData => {
      const responseObject = {
        candidateName: blockData[1],
        studentId: blockData[0],
        orgName: blockData[2],
        courseName: blockData[3],
        metaData: blockData[4],
        ipfsHash: blockData[5],
        expirationDate: parseInt(blockData[6])
      };
      console.log("block", responseObject);
      const databaseObject = {
        candidateName: data.candidateName,
        studentId: data.studentId,
        orgName: data.orgName,
        courseName: data.courseName,
        metaData: data.metaData,
        ipfsHash: data.ipfsHash,
  
        expirationDate: data.expirationDate
      };
      console.log("block", responseObject);
      console.log("database",databaseObject);
      if (JSON.stringify(responseObject) === JSON.stringify(databaseObject))
        return true;
      else throw false;
    })
    .catch(err => {
      return false;
    });
};

CertificateSchema.methods.appendBlockchain = function() {
  const data = this;

  const { candidateName, studentId, orgName, courseName, metaData, ipfsHash, expirationDate } = data;

  const certificateId = data._id.toString();

  return truffle_connect.generateCertificate(
    certificateId,
    candidateName,
    studentId,
    orgName,
    courseName,
    metaData,
    ipfsHash,
    expirationDate
  );
};

const Certificates = mongoose.model("certificates", CertificateSchema);

module.exports = Certificates;
