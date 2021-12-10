const express = require('express');

const server = express();

const { default: axios } = require('axios');
const {
  casperDelegationContractHexCode,
  erc20MintableContractCode,
} = require('./utils/casper');
const {
  CasperServiceByJsonRPC,
  Keys,
  DeployUtil,
  RuntimeArgs,
  CLValue,
  CLPublicKey,
} = require('casper-js-sdk');
const { CasperClient } = require('casper-js-sdk');

server.use(express.json());

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

    const toPublicKey = CLPublicKey.fromHex(to);

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
      getEndpointByNetwork(network)
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
    // const payment = DeployUtil.standardPayment(2500010000);
    const payment = DeployUtil.standardPayment(3000000000);
    const args = RuntimeArgs.fromMap({
      delegator: CLValue.publicKey(keyPair.publicKey),
      validator: CLValue.publicKey(CLPublicKey.fromHex(validatorPublicKey)),
      amount: CLValue.u512(amountToDelegate),
    });
    let contractHash =
      'ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea';
    if (network === 'casper-test') {
      contractHash =
        '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2';
    }
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(contractHash, 'hex')),
      'delegate',
      args
    );
    // const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
    //   contract,
    //   RuntimeArgs.fromMap({
    //     action: CLValue.string('delegate'),
    //     delegator: CLValue.publicKey(keyPair.publicKey),
    //     validator: CLValue.publicKey(PublicKey.fromHex(validatorPublicKey)),
    //     amount: CLValue.u512(amountToDelegate),
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
    const payment = DeployUtil.standardPayment(10000);
    const args = RuntimeArgs.fromMap({
      delegator: CLValue.publicKey(keyPair.publicKey),
      validator: CLValue.publicKey(CLPublicKey.fromHex(validatorPublicKey)),
      amount: CLValue.u512(amountToUndelegate),
    });
    let contractHash =
      'ccb576d6ce6dec84a551e48f0d0b7af89ddba44c7390b690036257a04a3ae9ea';
    if (network === 'casper-test') {
      contractHash =
        '93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2';
    }
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(contractHash, 'hex')),
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

server.get('/deploy', async function (req, res) {
  const client = new CasperServiceByJsonRPC();
  const deployResult = await client.getDeployInfo(req.body.deployHash);
  res.send(deployResult.execution_results[0].result);
});

server.post('/sign', async function (req, res) {
  try {
    let { deploy, privateKey, callbackURL } = req.body;
    console.log('received callbackURL = ', callbackURL);
    // deploy = JSON.parse(deploy);
    const client = new CasperClient(getEndpointByNetwork(''));
    // client.signDeploy
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
    console.log('got keypair', keyPair);
    const testFromJson = DeployUtil.deployFromJson(deploy);
    const signedDeploy = client.signDeploy(testFromJson, keyPair);
    console.log('signedDeploy = ', signedDeploy);

    await axios.post(
      callbackURL,
      {
        signedDeploy: DeployUtil.deployToJson(signedDeploy),
      },
      {
        timeout: 2000,
      }
    );
    res.send({ signedDeploy });
  } catch (error) {
    console.log('error = ', error);
  }
});

server.post('/pem', async (req, res) => {
  let { privateKey } = req.body;
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

  const pem = keyPair.exportPrivateKeyInPem();
  res.send(pem);
});

server.post('/token/create', async function (req, res) {
  try {
    let {
      privateKey,
      network,
      tokenName,
      tokenTicker,
      imageURL,
      decimals,
      initialSupply,
      authorizedMinter,
    } = req.body;

    const client = new CasperClient(getEndpointByNetwork(network));
    const contractCode = Uint8Array.from(
      Buffer.from(erc20MintableContractCode, 'hex')
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
    const payment = DeployUtil.standardPayment(90000000000);

    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      contractCode,
      RuntimeArgs.fromMap({
        token_name: CLValue.string(tokenName),
        token_symbol: CLValue.string(tokenTicker),
        token_decimals: CLValue.u8(decimals),
        token_total_supply: CLValue.u256(initialSupply),
        authorized_minter: CLValue.string(authorizedMinter),
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

module.exports = server;
