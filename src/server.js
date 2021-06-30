const express = require('express');

const server = express();
const {
  CasperServiceByJsonRPC,
  CasperClient,
  PublicKey,
  DeployUtil,

  Keys,
  RuntimeArgs,
  CLValue,
  BalanceServiceByJsonRPC,
} = require('casper-client-sdk');
const { casperDelegationContractHexCode } = require('./utils/casper');

server.use(express.json());
server.get('/', function (req, res) {
  res.send('Welcome to Gosuto!');
});

const getEndpointByNetwork = (network) => {
  if (network == 'casper') {
    return 'http://18.221.174.26:7777/rpc';
  }
  return 'http://testnet.gosuto.io:7777/rpc';
};

server.post('/transfer', async function (req, res) {
  try {
    // let to = '01e6c56c86ca97d7387d0c989c061ceeb205eeb04adf9ec41569292120ed9ae4a5';
    // let amount = 5697999990000;
    // res.send(req.body)

    let { privateKey, to, amount, network, note } = req.body;
    const ll = JSON.stringify(privateKey)
      .replace('{', '')
      .replace('}', '')
      .split(',');
    const newll = ll.map((val) => {
      return parseInt(val.substr(val.indexOf(':') + 1, val.length));
    });
    privateKey = Uint8Array.from(newll);
    const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
    const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);

    // const keyPair = Keys.Ed25519.new();

    // for native-transfers payment price is fixed
    const paymentAmount = 10000000000;
    // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage
    const id = note;
    // gas price for native transfers can be set to 1
    const gasPrice = 1;
    // time that the Deploy will remain valid for, in milliseconds, the default value is 1800000, which is 30 minutes
    const ttl = 18000000;

    const deployParams = new DeployUtil.DeployParams(
      keyPair.publicKey,
      network,
      gasPrice,
      ttl
    );

    const toPublicKey = PublicKey.fromHex(to);

    const session = DeployUtil.ExecutableDeployItem.newTransfer(
      amount,
      toPublicKey,
      null,
      id
    );

    const payment = DeployUtil.standardPayment(paymentAmount);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    const jsonDeploy = DeployUtil.deployToJson(signedDeploy);
    DeployUtil.deployFromJson(jsonDeploy);
    // we are sending the signed deploy
    const result = await new CasperServiceByJsonRPC(
      'http://testnet.gosuto.io:7777/rpc'
    ).deploy(signedDeploy);
    res.send(result);
  } catch (error) {
    console.log('error = ', error);
    res.send(error.toString());
  }
});

server.post('/delegate', async function (req, res) {
  try {
    let { privateKey, validatorPublicKey, amountToDelegate, network } =
      req.body;

    const client = new CasperClient(getEndpointByNetwork(network));
    const contract = Uint8Array.from(
      Buffer.from(casperDelegationContractHexCode, 'hex')
    );
    const ll = JSON.stringify(privateKey)
      .replace('{', '')
      .replace('}', '')
      .split(',');
    const newll = ll.map((val) => {
      return parseInt(val.substr(val.indexOf(':') + 1, val.length));
    });
    privateKey = Uint8Array.from(newll);

    const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
    const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);

    const deployParams = new DeployUtil.DeployParams(
      keyPair.publicKey,
      network
    );
    const payment = DeployUtil.standardPayment(3000000000);
    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      contract,
      RuntimeArgs.fromMap({
        action: CLValue.string('delegate'),
        delegator: CLValue.publicKey(keyPair.publicKey),
        validator: CLValue.publicKey(PublicKey.fromHex(validatorPublicKey)),
        amount: CLValue.u512(amountToDelegate),
      })
    );
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    const executionResult = await client.putDeploy(signedDeploy);
    res.send(executionResult);
  } catch (error) {
    res.send(error.toString());
  }
});
server.post('/undelegate', async function (req, res) {
  try {
    let { privateKey, validatorPublicKey, amountToUndelegate, network } =
      req.body;

    const client = new CasperClient(getEndpointByNetwork(network));
    const contract = Uint8Array.from(
      Buffer.from(casperDelegationContractHexCode, 'hex')
    );
    const ll = JSON.stringify(privateKey)
      .replace('{', '')
      .replace('}', '')
      .split(',');
    const newll = ll.map((val) => {
      return parseInt(val.substr(val.indexOf(':') + 1, val.length));
    });
    privateKey = Uint8Array.from(newll);

    const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
    const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);

    const deployParams = new DeployUtil.DeployParams(
      keyPair.publicKey,
      network
    );
    const payment = DeployUtil.standardPayment(500000000);
    const args = RuntimeArgs.fromMap({
      delegator: CLValue.publicKey(keyPair.publicKey),
      validator: CLValue.publicKey(PublicKey.fromHex(validatorPublicKey)),
      amount: CLValue.u512(amountToUndelegate),
    });
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(
        Buffer.from(
          '68e15f19eb37e6062c1a73d26acf3793bf39027713db6c4ff2baad6e7a5054f1','hex'
        )
      ),
      'undelegate',
      args
    );
    // const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
    //   contract,
    //   RuntimeArgs.fromMap({
    //     action: CLValue.string('undelegate'),
    //     delegator: CLValue.publicKey(keyPair.publicKey),
    //     validator: CLValue.publicKey(PublicKey.fromHex(validatorPublicKey)),
    //     amount: CLValue.u512(amountToUndelegate),
    //   })
    // );
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
    const executionResult = await client.putDeploy(signedDeploy);
    res.send(executionResult);
  } catch (error) {
    res.send(error.toString());
  }
});

module.exports = server;