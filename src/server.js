
let express = require('express');
let server = express);
var bodyParser = require('body-parser')
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
  server.use(express.json());
server.get('/', function(req, res) {
   res.send("Hello world! Lala Seth is here!");
});

server.post('/transfer', async function (req,res) {
    try{
        // let to = '01e6c56c86ca97d7387d0c989c061ceeb205eeb04adf9ec41569292120ed9ae4a5';
        // let amount = 5697999990000;
        // res.send(req.body)


        let {privateKey,to,amount,network} = req.body;
        const ll = JSON.stringify(privateKey)
        .replace('{', '')
        .replace('}', '')
        .split(',');
      const newll = ll.map((val) => {
          return parseInt(val.substr(val.indexOf(':') + 1, val.length));
        });
        privateKey = Uint8Array.from(newll);
        console.log("body = ", {privateKey,to,amount,network})
        let  publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
      const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);

        // const keyPair = Keys.Ed25519.new();

        // for native-transfers payment price is fixed
        const paymentAmount = 10000000000;
        // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage
        const id = 187821;
        // gas price for native transfers can be set to 1
        const gasPrice = 10;
        // time that the Deploy will remain valid for, in milliseconds, the default value is 1800000, which is 30 minutes
        const ttl = 18000000;

        const deployParams = new DeployUtil.DeployParams(
          keyPair.publicKey,
          'casper-test',
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
        res.send(result)
    }catch(error){
        console.log('error = ', error)
res.send(error.toString())
}

})


module.exports = server;
