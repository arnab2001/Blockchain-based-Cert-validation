const Web3 = require("web3");
const contract = require("truffle-contract");
const HDWalletProvider = require('@truffle/hdwallet-provider');

const log = require("../utils/log");
const certification_artifact = require("../build/contracts/Certification.json");

const CertificationInstance = contract(certification_artifact);

const connectWeb3 = function() {
  console.log("Connecting to web3");
  const self = this;
  // if (process.env.NODE_ENV === "developmen") {
  //   self.web3 = new Web3(new Web3.providers.HttpProvider(process.env.LOCAL_ENDPOINT));
  // } else {
  //   self.web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROJECT_ENDPOINT));
  //   console.log("Connected to web3");
  // }
  console.log(process.env.PROJECT_ENDPOINT);
  // self.web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROJECT_ENDPOINT));
  self.web3 = new Web3(new HDWalletProvider(process.env.MNEMONIC, process.env.PROJECT_ENDPOINT));

  CertificationInstance.setProvider(self.web3.currentProvider);
  if (typeof CertificationInstance.currentProvider.sendAsync !== "function") {
    CertificationInstance.currentProvider.sendAsync = function() {
      return CertificationInstance.currentProvider.send.apply(
        CertificationInstance.currentProvider,
        arguments
      );
    };
  }

};

const getAccounts = function() {
  const self = this;
  return self.web3.eth.getAccounts();
};

const getCertificateData = function(certificateId) {
  const self = this;
  return CertificationInstance.deployed()
    .then(ins => ins.getData(certificateId))
    .catch(err => Promise.reject("No certificate found with the input id"));
};
// const getCertificateData = function(certificateId) {
//   const self = this;

//   CertificateInstance.setProvider(self.web3.currentProvider);

//   return CertificateInstance.deployed()
//     .then(ins => ins.getData(certificateId))
//     .catch(err => Promise.reject("No certificate found with the input id"));
// };

const generateCertificate = function(
  id,
  studentId,
  candidateName,
  orgName,
  courseName,
  metaData,
  ipfsHash,
  expirationDate
) {
  const self = this;
  return self.getAccounts().then(answer => {
    let accountAddress = answer[0];
    console.log(accountAddress);
    return CertificationInstance.deployed()
      .then(instance =>
        instance.generateCertificate(
          id,
          candidateName,
          studentId,
          orgName,
          courseName,
          metaData,
          ipfsHash,
          expirationDate,
          { from: accountAddress.toLowerCase(), gas: 800000 }
        )
      ) 
      .catch(err => {
        log.Error(err);
        return Promise.reject(err.toString());
      });
  });
};

module.exports = {
  connectWeb3,
  getAccounts,
  getCertificateData,
  generateCertificate
};
