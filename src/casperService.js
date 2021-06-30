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

async function transfer(privateKey, to, amount, network) {
  try {
    //  to = '01e6c56c86ca97d7387d0c989c061ceeb205eeb04adf9ec41569292120ed9ae4a5';
    // amount = parseFloat(amount) * 1e9;
    const ll = privateKey.replace('{', '').replace('}', '').split(',');
    const newll = ll.map((val) => {
      return parseInt(val.substr(val.indexOf(':') + 1, val.length));
    });
    privateKey = Uint8Array.from(newll);
    const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
    const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);
    const client = new CasperClient('http://testnet.gosuto.io:7777/rpc');
    // const publicKeyArray = Keys.readBase64WithPEM(
    //   `-----BEGIN PUBLIC KEY-----\r\nMCowBQYDK2VwAyEAcFZSSRoBQPKFz3ELWAG4QX3q1GqiY54+I88xl49Eblg=\r\n-----END PUBLIC KEY-----\r\n`
    // );
    // const privateKeyArray = Keys.readBase64WithPEM(
    //   `-----BEGIN PRIVATE KEY-----\r\nMC4CAQAwBQYDK2VwBCIEIFFJPMA//nqjCVOFb8lVgj0qS1WK4JFWfqZ9cb5Uj1BU\r\n-----END PRIVATE KEY-----\r\n`
    // );
    // const publicKey = Keys.Ed25519.parsePublicKey(publicKeyArray);
    // const privateKey = Keys.Ed25519.parsePrivateKey(privateKeyArray);
    // const keyPair = new Keys.Ed25519({
    //   publicKey,
    //   secretKey: Buffer.concat([privateKey, publicKey]),
    // });
    // const keyPair = Keys.Ed25519.new();

    // for native-transfers payment price is fixed
    const paymentAmount = 10000000000;
    // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage
    const id = 187821;
    // gas price for native transfers can be set to 1
    // time that the Deploy will remain valid for, in milliseconds, the default value is 1800000, which is 30 minutes

    const deployParams = new DeployUtil.DeployParams(
      keyPair.publicKey,
      network
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
    const res = await new CasperServiceByJsonRPC(
      'http://testnet.gosuto.io:7777/rpc'
    ).deploy(signedDeploy);
    return new Promise((resolve) => {
      resolve(res.deploy_hash);
    });
  } catch (error) {
    console.log('error = ', error);
  }
}

async function main() {
  var myArgs = process.argv.slice(2);
  console.log(' myArgs = ', myArgs);
  let privateKey = [];

  for (let index = 0; index <= 31; index++) {
    const element = myArgs[index];
    // privateKey.push(
    //   parseInt(element.substr(element.indexOf(':') + 1, element.length))
    // );
    privateKey.push(
     element
    );
  }
  // privateKey = Uint8Array.from(privateKey);
  const res = await transfer(myArgs[0], myArgs[1], myArgs[2], myArgs[3]);
  console.log(res);
  return res;
}
return main();
