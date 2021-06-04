import React, { useEffect, useState } from 'react';
import { Tag, Button, Input } from 'antd';
import Wallet from '../components/Wallet';
import AddWallet from '../components/AddWallet';

// images
import vault from '../../assets/icons/vault-logo.png';

// styles
import './../App.global.scss';
import { CasperClient, Keys, PublicKey } from 'casper-client-sdk';
import nacl from 'tweetnacl';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import TextArea from 'antd/lib/input/TextArea';
// import { SignatureAlgorithm } from 'casper-client-sdk/dist/lib/Keys';

// mnemonic phrase package
const bip39 = require('bip39');

const WalletView = () => {
  const [clicked, setClicked] = useState(false)
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic())
  const [accountHex, setAccountHex] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [accountHash, setAccountHash] = useState('')
  const [mnemonicSeed, setMnemonicSeed] = useState('')
  const [walletName, setWalletName] = useState('')

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
          Wallet name:
          <Input
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
         console.log('currentMnemonicSeed.valueOf() = ', currentMnemonicSeed)
         // Keys.Ed25519.privateToPublicKey()
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
     return ({ accHex,accHash,privateKey });
    } catch (error) {
      alert(error)
    }
  }
  const walletInformation = (customMnemonic) => {

     if(privateKey == '' && accountHash == '' && accountHex == '' && mnemonic!='' && clicked){
     generateWallet(customMnemonic).then(({accHex,accHash,privateKey}) => {
      setAccountHex(accHex)
      setAccountHash(accHash)
      setPrivateKey(privateKey);
     });
    }
return (
  <div>
    <p>Account hex: {accountHex}</p>
    <p>Account Hash: {accountHash}</p>
    <p>Private Key: {privateKey}</p>
  </div>
)

}
  const customOnCancelLogic = async () => {
    setMnemonic(bip39.generateMnemonic())
    setClicked(false);
    setAccountHex('')
    setPrivateKey('')
    setAccountHash('')
    setWalletName('')
  }
  const confirmWallet = async () => {
    try {
      const db = Datastore.create({
        filename:`${remote.app.getPath('userData')}/wallets.db`,
        timestampData:true
      })
      const newWallet = await db.insert({
        walletName,
        accountHash,
        accountHex,
        privateKey,
        mnemonic
      })
      await getWallets();
    } catch (error) {
      alert('Error!')
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
    <Button type="primary" onClick={confirmWallet} className="send-button">
     Confirm
    </Button>
  </div>
  }
  const importFromSeedContent = () => {
    return(
    <div>
       <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Import from seed</div>
   <TextArea
   placeholder='Your seed'
   onChange={(e) => {
     setSeedToImportFrom(e.target.value)
   }}
   />
    <Button onClick={onImportFromSeed}>Import</Button>
  </div>
    )
  }
  const [seedToImportFrom, setSeedToImportFrom] = useState('')

  const onImportFromSeed = async () => {
    try {
      const {accHex,accHash,privateKey} = await generateWallet(seedToImportFrom);
      const newWallet = await db.insert({
        walletName,
        accountHash:accHash,
        accountHex:accHex,
        privateKey:privateKey,
        mnemonic:seedToImportFrom
      })
      setShouldUpdate(!shouldUpdate)
    } catch (error) {
      alert(error)
    }

  }

  const importFromSeedFooter = () => {
    return(
        <Button onClick={onImportFromSeed}>Import</Button>
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
    setWallets(wallets);
  }
  useEffect(() => {
    getWallets()
  }, [shouldUpdate])
  return (
    <>
    <div>
    {/* <div className='add-wallet-card'>
    <AddWallet
          title="New Wallet"
          customOnCancelLogic={customOnCancelLogic}
          children={!clicked ? mnemonicModalSystem() : walletInformation()}
          footer={[
            footerContent(),
          ]}
        />
        </div> */}
      <div className="spacing-wallets-index">
      <AddWallet
          title="New Wallet"
          customOnCancelLogic={customOnCancelLogic}
          children={!clicked ? mnemonicModalSystem() : walletInformation()}
          footer={[
            footerContent(),
          ]}
        />
         <AddWallet
          title="Import From Seed"
          // customOnCancelLogic={customOnCancelLogic}
          children={importFromSeedContent()}
          footer={[
            importFromSeedFooter()
          ]}
        />
        {/* {Buffer.from(PublicKey.fromHex('0136adcc402ee79f3102d700b03a068812d5f859ec248bdfde44f46b2eabfac299').toAccountHash()).toString('hex')} */}
        {wallets?.length>0 && wallets?.map((wallet) => {
          return(
          <Wallet
          shouldUpdate={shouldUpdate}
          setShouldUpdate={setShouldUpdate}
          db = {db}
          id={wallet._id}
          tag={wallet.walletName}
          title={'Balance'}
          amount="2507.54 USD"
          secondaryAmount="2507.54 USD"
          secondaryTitle="250.5010 CSPR currently staked"
        />
          )
        })
        }

    </div>
    </div>
    </>
  );
};

export default WalletView;
