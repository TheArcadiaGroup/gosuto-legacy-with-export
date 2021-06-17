import { casperDelegationContractHexCode } from '../utils/casper';

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

const CoinGecko = require('coingecko-api');
import blake from 'blakejs';
import { concat } from '@ethersproject/bytes';
export const getEndpointByNetwork = (network) => {
  if (network == 'casper') {
    return 'http://18.221.174.26:7777/rpc';
  }
  return 'http://testnet.gosuto.io:7777/rpc';
};

export const getAccountBalance = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    const latestBlockHash = (await getLatestBlockInfo(network)).block.hash;
    console.log('latestBlockHash = ', latestBlockHash);
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const balanceService = new BalanceServiceByJsonRPC(casperService);
    const balance = await balanceService.getAccountBalance(
      latestBlockHash,
      PublicKey.fromHex(publicKey)
    );
    // casperService.acco
    // const stateRootHash = await casperService.getStateRootHash(latestBlockHash);
    // const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(stateRootHash,PublicKey.fromHex(publicKey));
    // const balance = await casperService.getAccountBalance(stateRootHash,balanceUref);
    // let accountHex = new CasperClient().newHdWallet(Uint8Array.from(await mnemonicToSeed('hola!'))).publicKey().toString('hex');
    // let wallet = PublicKey.fromHex(accountHex).toAccountHash();
    // wallet  = Buffer.from(wallet).toString('hex');
    if (Number.isNaN(parseFloat(parseInt(balance) / 1e9))) return 0;
    return parseFloat(parseInt(balance) / 1e9);
  } catch (error) {
    return 0;
  }
};

export const getWalletBalancesSum = async (publicKeys, network) => {
  try {
    let sum = 0;
    for (let index = 0; index < publicKeys.length; index++) {
      try {
        const element = publicKeys[index];
        sum += await getAccountBalance(element);
      } catch (error) {
        // alert('error')
      }
    }
    return sum;
  } catch (error) {}
};

export const getTotalStakedSum = async (publicKeys, network) => {
  try {
    let sum = 0;
    for (let index = 0; index < publicKeys.length; index++) {
      try {
        const element = publicKeys[index];
        sum += (await getUserDelegatedAmount(element)).stakedAmount;
      } catch (error) {
        // alert('error')
      }
    }
    return sum;
  } catch (error) {}
};

export const getValidatorWeight = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'
  try {
    const eraValidators = (
      await new CasperServiceByJsonRPC(
        getEndpointByNetwork(network)
      ).getValidatorsInfo()
    ).auction_state.era_validators[0].validator_weights;
    for (let index = 0; index < eraValidators.length; index++) {
      const element = eraValidators[index];
      if (element.public_key == publicKey) {
        return element.weight / 1e9;
      }
    }
    return 0;
  } catch (error) {}
};

export const getValidatorRewards = async (publicKey) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    let rewardsSum = 0;
    let currentPage = 1;
    let url = `https://event-store-api-clarity-mainnet.make.services/validators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
    let response = await fetch(url);
    let jsonResponse = await response.json();
    for (let index = 0; index < jsonResponse.data.length; index++) {
      const element = jsonResponse.data[index];
      rewardsSum += element.amount;
    }
    while (jsonResponse.pageCount > currentPage) {
      currentPage++;
      url = `https://event-store-api-clarity-mainnet.make.services/validators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
      response = await fetch(url);
      jsonResponse = await response.json();
      for (let index = 0; index < jsonResponse.data.length; index++) {
        const element = jsonResponse.data[index];
        rewardsSum += element.amount;
      }
    }
    return rewardsSum / 1e9;
  } catch (error) {}
};
export const getDelegatorRewards = async (publicKey) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    const startDate = new Date();
    let rewardsSum = 0;
    let currentPage = 1;
    let url = `https://event-store-api-clarity-mainnet.make.services/delegators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
    let response = await fetch(url);
    let jsonResponse = await response.json();
    for (let index = 0; index < jsonResponse.data.length; index++) {
      const element = jsonResponse.data[index];
      rewardsSum += element.amount;
    }
    while (jsonResponse.pageCount > currentPage) {
      currentPage++;
      url = `https://event-store-api-clarity-mainnet.make.services/delegators/${publicKey}/rewards?with_amounts_in_currency_id=1&page=${currentPage}&limit=100`;
      response = await fetch(url);
      jsonResponse = await response.json();
      for (let index = 0; index < jsonResponse.data.length; index++) {
        const element = jsonResponse.data[index];
        rewardsSum += element.amount;
      }
    }
    return rewardsSum / 1e9;
  } catch (error) {}
};

export const getLatestBlockInfo = async (network) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const latestBlock = await casperService.getLatestBlockInfo();
    return latestBlock;
  } catch (error) {}
};

export const getTotalStaked = async (network) => {
  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const validatorsInfo = await casperService.getValidatorsInfo();
    const validatorWeights =
      validatorsInfo.auction_state.era_validators[0].validator_weights;
    const sumOfWeights = validatorWeights.reduce((accumVariable, current) => {
      return accumVariable + parseInt(current.weight);
    }, 0);
    return sumOfWeights / 1e9;
  } catch (error) {}
};

export const getCasperMarketInformation = async () => {
  try {
    let casperInformation = await new CoinGecko().coins.fetch(
      'casper-network',
      {}
    );
    const price = casperInformation.data.market_data.current_price.usd;
    const casperTotalSupply = casperInformation.data.market_data.total_supply;
    const casperCirculatingSupply =
      casperInformation.data.market_data.circulating_supply;
    const casperPriceChangePercentage24h =
      casperInformation.data.market_data
        .price_change_percentage_24h_in_currency;
    return {
      price,
      casperTotalSupply,
      casperCirculatingSupply,
      casperPriceChangePercentage24h,
    };
  } catch (error) {}
};

export const getUserDelegatedAmount = async (publicKey, network) => {
  // publicKey = '01b1126cfaf8f6df4209b5f4a88a5e3bb95f912c0307fa3e1d3e89a3946411b021'

  try {
    const casperService = new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    );
    const validatorsInfo = await casperService.getValidatorsInfo();
    const stakingOperations = [];
    const eraValidators = validatorsInfo.auction_state.era_validators[0];
    const bids = validatorsInfo.auction_state.bids;
    let stakedAmount = 0;
    bids.forEach((bid) => {
      let delegators = bid.bid.delegators;
      delegators.forEach((delegator) => {
        if (delegator.public_key == publicKey) {
          stakingOperations.push({
            validator: bid.public_key,
            delegationRate: bid.bid.delegation_rate,
            selfStake: bid.bid.staked_amount / 1e9,
            stakedAmount: delegator.staked_amount / 1e9,
          });
          stakedAmount += delegator.staked_amount / 1e9;
        }
      });
    });
    return { stakedAmount, stakingOperations };
  } catch (error) {}
};

export const getAccountHistory = async (accountHash, page, limit, network) => {
  try {
    network = network == 'casper-test' ? 'testnet' : 'mainnet';
    let url = `https://event-store-api-clarity-${network}.make.services/accounts/${accountHash}/transfers?page=${page}&limit=${limit}`;
    let response = await fetch(url);
    let jsonResponse = await response.json();
    console.log('json respone = ', jsonResponse);
    const newData = jsonResponse.data.map((transfer) => {
      return {
        ...transfer,
        method: transfer.fromAccount == accountHash ? 'Sent' : 'Received',
      };
    });
    return newData;
  } catch (error) {}
};

export const transfer = async (publicKey, privateKey, to, amount, network) => {
  try {
    to = '01e6c56c86ca97d7387d0c989c061ceeb205eeb04adf9ec41569292120ed9ae4a5';
    amount = 5697999990000;
    // const ll = JSON.stringify(privateKey)
    //   .replace('{', '')
    //   .replace('}', '')
    //   .split(',');
    // const newll = ll.map((val) => {
      //   return parseInt(val.substr(val.indexOf(':') + 1, val.length));
      // });
      // privateKey = Uint8Array.from(newll);
      // publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
      // const keyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey);
      const client = new CasperClient(getEndpointByNetwork(network));
    const keyPair = Keys.Ed25519.new();

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
    const res = await new CasperServiceByJsonRPC(
      getEndpointByNetwork(network)
    ).deploy(signedDeploy);
    return res;
  } catch (error) {
    console.log('error = ', error);
  }
};
export const delegate = async (
  delegatorPublicKey,
  delegatorPrivateKey,
  validatorPublicKey,
  amountToDelegate,
  network
) => {
  const client = new CasperClient(getEndpointByNetwork(network));
  const contract = Uint8Array.from(
    Buffer.from(casperDelegationContractHexCode, 'hex')
  );
  const publicKeyArray = Keys.readBase64WithPEM(
    `-----BEGIN PUBLIC KEY-----\r\nMCowBQYDK2VwAyEAcFZSSRoBQPKFz3ELWAG4QX3q1GqiY54+I88xl49Eblg=\r\n-----END PUBLIC KEY-----\r\n`
  );
  const privateKeyArray = Keys.readBase64WithPEM(
    `-----BEGIN PRIVATE KEY-----\r\nMC4CAQAwBQYDK2VwBCIEIFFJPMA//nqjCVOFb8lVgj0qS1WK4JFWfqZ9cb5Uj1BU\r\n-----END PRIVATE KEY-----\r\n`
  );
  const publicKey = Keys.Ed25519.parsePublicKey(publicKeyArray);
  const privateKey = Keys.Ed25519.parsePrivateKey(privateKeyArray);
  const keyPair = new Keys.Ed25519({
    publicKey,
    secretKey: Buffer.concat([privateKey, publicKey]),
  });
  const deployParams = new DeployUtil.DeployParams(keyPair.publicKey, 'casper');
  const payment = DeployUtil.standardPayment(300000000000);
  const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
    contract,
    RuntimeArgs.fromMap({
      action: CLValue.string('delegate'),
      delegator: CLValue.publicKey(keyPair.publicKey),
      validator: CLValue.publicKey(
        PublicKey.fromHex(
          '017d96b9a63abcb61c870a4f55187a0a7ac24096bdb5fc585c12a686a4d892009e'
        )
      ),
      amount: CLValue.u512('3000000000000000'),
    })
  );
  let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
  const serializedBody = DeployUtil.serializeBody(
    deploy.payment,
    deploy.session
  );
  const bodyHash = blake.blake2b(serializedBody, null, 32);
  let jsonDeploy = DeployUtil.deployToJson(deploy);
  //   jsonDeploy.deploy.payment.ModuleBytes.args = RuntimeArgs.fromMap(
  //     {
  //       "amount":{
  //         "cl_type": "U512",
  //         "bytes": "04005ed0b2",
  //         "parsed": "3000000000"
  //       }
  //     }
  //   )
  //   jsonDeploy.deploy.session.ModuleBytes.args = [
  //     [
  //         "validator",
  //         {
  //             "cl_type": "PublicKey",
  //             "bytes": "01c60fe433d3a22ec5e30a8341f4bda978fa81c2b94e5a95f745723f9a019a3c31",
  //             "parsed": "01c60fe433d3a22ec5e30a8341f4bda978fa81c2b94e5a95f745723f9a019a3c31"
  //         }
  //     ],
  //     [
  //         "amount",
  //         {
  //             "cl_type": "U512",
  //             "bytes": "06006c47730a60",
  //             "parsed": "105598000000000"
  //         }
  //     ],
  //     [
  //         "delegator",
  //         {
  //             "cl_type": "PublicKey",
  //             "bytes": "0147b3cb791d161b0ee5f2f5c1321957acf4d405de2a3d7ef12b5314ae7a677196",
  //             "parsed": "0147b3cb791d161b0ee5f2f5c1321957acf4d405de2a3d7ef12b5314ae7a677196"
  //         }
  //     ]
  // ]
  // console.log('without stringify = ', JSON.stringify(deploy))
  // console.log('new deploy = ', JSON.stringify(DeployUtil.deployToJson(deploy)))
  const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
  console.log('signed deploy = ', DeployUtil.deployToJson(signedDeploy));
  // console.log((JSON.stringify(DeployUtil.deployToJson(signedDeploy))))
  // console.log(JSON.stringify(DeployUtil.deployToJson(signedDeploy)))
  let res;
  try {
    res = await client.putDeploy(signedDeploy);
  } catch (error) {
    console.log(error);
  }
  return res;
};
