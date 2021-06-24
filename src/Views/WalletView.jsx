import React, { useContext, useEffect, useState } from 'react';
import { Tag, Button, Input, Row, Col, notification } from 'antd';
import Wallet from '../components/Wallet';
import AddWallet from '../components/AddWallet';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './../App.global.scss';
import { CasperClient, Keys, PublicKey } from 'casper-client-sdk';
import nacl from 'tweetnacl';
import Datastore from 'nedb-promises';
import { dialog, remote } from 'electron';
import TextArea from 'antd/lib/input/TextArea';
import { getAccountBalance, getCasperMarketInformation,getUserDelegatedAmount } from '../services/casper';
import { createReadStream, readFileSync } from 'fs';
import { parseAlgorithm } from '../utils/casper';
import WalletContext from '../contexts/WalletContext';
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import NetworkContext from '../contexts/NetworkContext';
// import { SignatureAlgorithm } from 'casper-client-sdk/dist/lib/Keys';
const path = require('path');
// mnemonic phrase package
const bip39 = require('bip39');

const WalletView = () => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [clicked, setClicked] = useState(false)
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic())
  const [accountHex, setAccountHex] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [accountHash, setAccountHash] = useState('')
  const [mnemonicSeed, setMnemonicSeed] = useState('')
  const [walletName, setWalletName] = useState('')
  const [fileContents, setFileContents] = useState('')
  const [publicKeyUint8, setPublicKeyUint8] = useState('')
  const [privateKeyUint8, setPrivateKeyUint8] = useState('')

  const onWalletNameChange = (event) => {
    setWalletName(event.target.value)
  }

  const mnemonicModalSystem = (clicked) => {
    const mnemonicWords = mnemonic.split(' ');
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Create a new wallet</div>
        <div className="modal-content">
          <Input
          type="text"
          className="modal-input-amount"
          placeholder="Wallet Name"
          onChange={onWalletNameChange}
          />
        </div>
        <div className="modal-description">
          Below is a mnemonic phrase for the new wallet you are creating. This
          list of words will store all data for this wallet. Write it down and
          keep it somewhere safe. If your device breaks, you will need this list
          of words to recover your wallet.
        </div>

        <div className="mnemonic-description">
          {mnemonicWords.map((word, index) => (
            <div className="mnemonic-word" key={index}>
              <span className="mnemonic-number">{index + 1}.</span>{' '}
              <Tag className="mnemonic-tag" color="processing">
                {word}
              </Tag>
            </div>
          ))}
          </div>
          {footerContent()}
        </div>

    );
  };

  async function generateWallet(customMnemonic) {
    try {
       let newMnemonic;
       let currentMnemonicSeed;
       let hdWallet ;
       let accHex = '';
       let edKey;
       const cleanMnemonic =  mnemonic.split(' ').map((mnemonic) => (mnemonic.trim())).join(' ')
let mnemonicToUse = customMnemonic ? customMnemonic :cleanMnemonic
console.log(mnemonicToUse)
         currentMnemonicSeed = await bip39.mnemonicToSeed(mnemonicToUse);
         hdWallet = new CasperClient().newHdWallet(Uint8Array.from(currentMnemonicSeed));
         const nw = EthereumHDKey.fromMasterSeed(currentMnemonicSeed);
        const path = "m/44'/506'/0'/0/0";
         let eth = nacl.sign.keyPair.fromSeed(Uint8Array.from(currentMnemonicSeed.subarray(0,32)).valueOf());
         edKey = new Keys.Ed25519(eth);

         console.log('eth public hex = ', edKey.accountHex());
         console.log('eth account hash = ', Buffer.from(edKey.accountHash(),'hex').toString('hex'));
         console.log('eth private key = ', Buffer.from(edKey.privateKey,'hex').toString('hex'));
         // accHex = hdWallet.publicKey().toString('hex');
         accHex = edKey.accountHex();
         console.log('new accHex = ',accHex)
       let publicKey = PublicKey.fromBytes(PublicKey.fromHex(edKey.accountHex()).toBytes()).value();
       let accHash ;
       // let publicKey = PublicKey.fromBytes(PublicKey.fromHex(accHex).toBytes()).value();
       // let accHash ;



       // if(accHex.startsWith('01')){
       //   publicKey = PublicKey.fromEd25519(Uint8Array.from(hdWallet.publicKey()));
       // }
       // if(accHex.startsWith('02')){
       //   publicKey = PublicKey.fromSecp256K1(Uint8Array.from(hdWallet.publicKey()));
       // }
       accHex = publicKey.toAccountHex();
       accHash = publicKey.toAccountHash();
     accHash = Buffer.from(accHash).toString('hex');
     // let privateKey = Buffer.from(hdWallet.privateKey()).toString('hex');
     let privateKey = Buffer.from(edKey.privateKey).toString('hex');
     // localStorage.setItem('test','works');
     return ({ accHex,accHash,privateKey,privateKeyUint8:edKey.privateKey,publicKeyUint8:edKey.publicKey.rawPublicKey });
    } catch (error) {
      notification['error']({
        message:'Error',
        description:error
      })
    }
  }
  const walletInformation = (customMnemonic) => {
     if(privateKey == '' && accountHash == '' && accountHex == '' && mnemonic!='' && clicked){
     generateWallet(customMnemonic).then(({accHex,accHash,privateKey,publicKeyUint8,privateKeyUint8}) => {
      setAccountHex(accHex)
      setAccountHash(accHash)
      setPrivateKey(privateKey)
      setPrivateKeyUint8(privateKeyUint8),
      setPublicKeyUint8(publicKeyUint8)
     });
    }
return (
  <div>
    <span className='modal-description' style={{marginBottom:'-2px'}}>Account hex</span>
    <TextArea type="text" className="modal-input-amount" style={{padding:'13px'}} value={accountHex} disabled/>
    <span className='modal-description'>Account hash</span>
    <TextArea type="text" className="modal-input-amount" style={{padding:'13px'}} value={accountHash} disabled/>
    <span className='modal-description'>Private key</span>
    <TextArea type="text" className="modal-input-amount" rows={3} style={{padding:'13px'}} value={privateKey} disabled/>
    {footerContent()}
  </div>
)

}
  const customOnCancelLogic = async () => {
    setIsNewWalletModalVisible(false)
    setIsImportFromSeedModalVisible(false)
    setIsImportFromFileModalVisible(false)
    setMnemonic(bip39.generateMnemonic())
    setClicked(false);
    setAccountHex('')
    setPrivateKey('')
    setAccountHash('')
    setWalletName('')
    setFileContents('')
    setSeedToImportFrom('')
  }
  const confirmWallet = async () => {
    try {
      const db = Datastore.create({
        filename:`${remote.app.getPath('userData')}/wallets.db`,
        timestampData:true
      })
      const newWallet = await db.insert({
        walletName: walletName=='' ? bip39.generateMnemonic().split(' ').slice(0,2).join(' ') : walletName,
        accountHash,
        accountHex,
        privateKey,
        privateKeyUint8,
        publicKeyUint8,
        mnemonic,
        hasMnemonic:true
      })
      await customOnCancelLogic();
      await getWallets();
    } catch (error) {
      notification['error']({
        message:'Error',
        description:error
      })
    }

  }
  const footerContent = () => {
    if(!clicked){
      return <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button type="primary" onClick={() => setClicked(true)} className="send-button">
        I wrote it down
      </Button>
    </div>;
    }
    return <div style={{ display: 'flex', justifyContent: 'center' }}>
    <Button type="primary" onClick={confirmWallet} className="send-button-no-mt">
     Confirm
    </Button>
  </div>
  }
  const onImportFromFile = async (publicKeyArray,privateKeyArray) => {
    try {
      let {algorithm,hexKey,secretKeyBase64} = parseAlgorithm(fileContents)
      let privateKeyUint8;
      let publicKeyUint8;
      let keyPair;
      privateKeyUint8 = parseAlgorithm(fileContents).secretKeyBase64;
      if(algorithm=='ed25519'){
        publicKeyUint8 = Keys.Ed25519.privateToPublicKey(Keys.Ed25519.parsePrivateKey(privateKeyUint8));
        keyPair= Keys.Ed25519.parseKeyPair(publicKeyUint8,privateKeyUint8)
      }
      else{
        publicKeyUint8 = Keys.Secp256K1.privateToPublicKey(Keys.Secp256K1.parsePrivateKey(privateKeyUint8));
        keyPair= Keys.Secp256K1.parseKeyPair(publicKeyUint8,privateKeyUint8)
      }
      console.log('keyPair = ', keyPair)
      const newWallet = await db.insert({
        walletName: walletName=='' ? bip39.generateMnemonic().split(' ').slice(0,2).join(' ') : walletName,
        accountHash:Buffer.from(keyPair.accountHash()).toString('hex'),
        accountHex:keyPair.accountHex(),
        privateKey:Buffer.from(keyPair.privateKey,"hex").toString('hex'),
        privateKeyUint8,
        publicKeyUint8,
        keyPair,
        mnemonic:'',
        hasMnemonic:false
      })
      console.log('new wallet = ', newWallet)
      setShouldUpdate(!shouldUpdate)
      await customOnCancelLogic();
      notification['success']({
        message:'Success',
        description:'Wallet successfully created'
      })

    } catch (error) {
    notification['error']({
      message:'Error',
      description:'Unable to parse private key from file'
    })
}
  }
  const importFromFileFooter = () => {
    return(
    <Button
    onClick={() => onImportFromFile()}
    className='send-button'
    style={{margin:'30px auto 0px auto',display:'block'}}
    >Import</Button>

    )
  }
  const importFromFileContent = () => {
    const [uploadedPublicKey, setUploadedPublicKey] = useState();
    const [uploadedPrivateKey, setUploadedPrivateKey] = useState();
    const handleFileUpload = async () => {
      const dialog = remote.dialog;
      dialog.showOpenDialog({
        title: 'Select your private key',
        defaultPath: path.join(__dirname, './services/'),
        buttonLabel: 'Upload',
        // Restricting the user to only Text Files.
        filters: [
            {
                name: 'Private Key File',
                extensions: ['pem','cer']
            }, ],
        // Specifying the File Selector Property
        properties: ['openFile']
      }).then(async (file) => {
        if(!file.canceled){
          const filePath = file.filePaths[0].toString();
          const fileContents = readFileSync(file.filePaths[0].toString(),"utf-8");
          setFileContents(fileContents);
      }
    }
      )
    }
    return(
    <div>
       <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Import from file</div>
        <Input type="text" value={walletName} placeholder='Wallet Name' className="modal-input-amount" onChange={onWalletNameChange}/>
        <Button
        style={{width:'100%'}}
        className='send-button-no-mt'
        onClick={handleFileUpload}
        >Upload Private Key File</Button>
        {fileContents!="" &&
        <p style={{textAlign:'center',marginTop:'1rem',marginBottom:'-1rem'}}>
          File uploaded.
        </p>
        }
        {importFromFileFooter()}

  </div>
    )
  }
  const importFromSeedContent = () => {
    return(
    <div>
       <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Import from seed</div>
        <Input type="text" placeholder='Wallet Name' value={walletName} className="modal-input-amount" onChange={onWalletNameChange}/>
   <TextArea
   className="modal-input-amount"
   placeholder='Your seed'
   onChange={(e) => {
     setSeedToImportFrom(e.target.value)
   }}
   value={seedToImportFrom}
   />
   {importFromSeedFooter()}
  </div>
    )
  }
  const [seedToImportFrom, setSeedToImportFrom] = useState('')

  const onImportFromSeed = async () => {
    try {
      const {accHex,accHash,privateKey,publicKeyUint8,privateKeyUint8} = await generateWallet(seedToImportFrom);
      const newWallet = await db.insert({
        walletName: walletName=='' ? bip39.generateMnemonic().split(' ').slice(0,2).join(' ') : walletName,
        accountHash:accHash,
        accountHex:accHex,
        privateKey:privateKey,
        publicKeyUint8,
        privateKeyUint8,
        mnemonic:seedToImportFrom,
        hasMnemonic:true
      })
      setShouldUpdate(!shouldUpdate)
      await customOnCancelLogic();
    } catch (error) {
      notification['error']({
        message:'Error',
        description:error
      })
    }

  }

  const importFromSeedFooter = () => {
    return(

        <Button  onClick={onImportFromSeed} className='send-button-no-mt' style={{margin:'auto',display:'block'}}
        >Import</Button>
    )
  }
  const [wallets, setWallets] = useState();
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const db = Datastore.create({
    filename:`${remote.app.getPath('userData')}/wallets.db`,
    timestampData:true
  })
  async function getWallets(){
    let wallets = await db.find({});
    for (let index  = 0; index < wallets.length; index++) {
      let balance;
      let amount = '';
      let stakedAmount;
      let stakedValue;
      const csprPrice = (await getCasperMarketInformation()).price;
      const wallet = wallets[index];
      try {
        balance = await getAccountBalance(wallet.accountHex,selectedNetwork)
        amount = balance*csprPrice
        // stakedAmount = await getUserDelegatedAmount(wallet.accountHex)
        // stakedAmount = stakedAmount.stakedAmount
      //  stakedValue = csprPrice*stakedAmount
      } catch (error) {
      balance = 'Inactive account.'
      }
      wallets[index] = {...wallet,balance,amount}
    }
    setWallets(wallets);
  }
  useEffect(() => {
    getWallets()
  }, [shouldUpdate,selectedNetwork])
  const [isNewWalletModalVisible, setIsNewWalletModalVisible] = useState(false)
  const [isImportFromSeedModalVisible, setIsImportFromSeedModalVisible] = useState(false)
  const [isImportFromFileModalVisible, setIsImportFromFileModalVisible] = useState(false)

  return (
    <>
    <div>
    <Row justify="space-between" align='middle'>
        <Col span={7}>
        <AddWallet
        isModalVisible={isNewWalletModalVisible}
        setIsModalVisible={setIsNewWalletModalVisible}
          title="New Wallet"
          customOnCancelLogic={customOnCancelLogic}
          children={!clicked ? mnemonicModalSystem() : walletInformation()}
          footer={[
            footerContent(),
          ]}
        />
        </Col>
        <Col span={7}>
        <AddWallet
        isModalVisible={isImportFromSeedModalVisible}
        setIsModalVisible={setIsImportFromSeedModalVisible}
          title="Import From Seed"
          // customOnCancelLogic={customOnCancelLogic}
          children={importFromSeedContent()}
          footer={[
            importFromSeedFooter()
          ]}
        />
        </Col>
        <Col span={7}>
        <AddWallet
        isModalVisible={isImportFromFileModalVisible}
        setIsModalVisible={setIsImportFromFileModalVisible}
          title="Import From File"
          // customOnCancelLogic={customOnCancelLogic}
          children={importFromFileContent()}
          footer={[
            importFromFileFooter()
          ]}
        />
        </Col>
      </Row>
      <Row gutter={48} justify="start" align='middle'>
      {wallets?.length>0 && wallets?.map((wallet) => {
          return(
          <Col span={8} >
          <Wallet
          shouldUpdate={shouldUpdate}
          setShouldUpdate={setShouldUpdate}
          db = {db}
          id={wallet._id}
          tag={wallet.walletName}
          title={wallet.balance.toLocaleString().startsWith('Inactive') ? wallet.balance : wallet.balance.toLocaleString()+" CSPR"}
          amount={wallet.amount.toLocaleString().startsWith('') ? wallet.amount+" USD" : wallet.amount.toLocaleString()+" USD"}
          // secondaryAmount="0 USD"
          // secondaryTitle={`${wallet.stakedAmount} CSPR staked`}
        />
        </Col>
          )
        })
        }
      </Row>

    </div>
    </>
  );
};

export default WalletView;
