/* eslint-disable react/no-array-index-key */
/* eslint-disable no-underscore-dangle */
import React, { useContext, useEffect, useState } from 'react';
import { Tag, Button, Input, Row, Col, notification, Spin } from 'antd';

// images

// styles
import '../App.global.scss';
import { Keys, PublicKey } from 'casper-client-sdk';
import nacl from 'tweetnacl';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import TextArea from 'antd/lib/input/TextArea';
import { readFileSync } from 'fs';
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import { promisify } from 'util';
import {
  getAccountBalance,
  getCasperMarketInformation,
  getLatestBlockInfo,
} from '../services/casper';
import { parseAlgorithm } from '../utils/casper';
import WalletContext from '../contexts/WalletContext';
import vault from '../../assets/icons/vault-logo.png';
import AddWallet from '../components/AddWallet';
import Wallet from '../components/Wallet';
import NetworkContext from '../contexts/NetworkContext';
import DataContext from '../contexts/DataContext';
// import { SignatureAlgorithm } from 'casper-client-sdk/dist/lib/Keys';
const path = require('path');
// mnemonic phrase package
const bip39 = require('bip39');

const WalletView = () => {
  // const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork] = useContext(NetworkContext);
  const [data, setData] = useContext(DataContext);
  const [seedToImportFrom, setSeedToImportFrom] = useState('');
  const [clicked, setClicked] = useState(false);
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const [accountHex, setAccountHex] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [accountHash, setAccountHash] = useState('');
  const [seedError, setSeedError] = useState(null);
  const [walletName, setWalletName] = useState('');
  const [fileContents, setFileContents] = useState('');
  const [publicKeyUint8, setPublicKeyUint8] = useState('');
  const [privateKeyUint8, setPrivateKeyUint8] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [wallets, setWallets] = useState();
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [shouldRevealPrivateKey, setShouldRevealPrivateKey] = useState(false);
  const [casperPrice, setCasperPrice] = useState(0);
  const [defaultWallet, setDefaultWallet] = useState(null);

  const db = Datastore.create({
    filename: `${remote.app.getPath('userData')}/wallets.db`,
    timestampData: true,
  });

  const onWalletNameChange = (event) => {
    setWalletName(event.target.value);
  };

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
      let hdWallet;
      let accHex = '';
      let edKey;
      const cleanMnemonic = mnemonic
        .split(' ')
        .map((mnemonic) => mnemonic.trim())
        .join(' ');
      const mnemonicToUse = customMnemonic || cleanMnemonic;
      console.log(mnemonicToUse);
      currentMnemonicSeed = await bip39.mnemonicToSeed(mnemonicToUse);
      // hdWallet = new CasperClient().newHdWallet(
      //   Uint8Array.from(currentMnemonicSeed)
      // );
      const nw = EthereumHDKey.fromMasterSeed(currentMnemonicSeed);
      const path = "m/44'/506'/0'/0/0";
      const keyPairFromSeed = nacl.sign.keyPair.fromSeed(
        Uint8Array.from(currentMnemonicSeed.subarray(0, 32)).valueOf()
      );
      edKey = new Keys.Ed25519(keyPairFromSeed);

      console.log('keyPairFromSeed public hex = ', edKey.accountHex());
      console.log(
        'keyPairFromSeed account hash = ',
        Buffer.from(edKey.accountHash(), 'hex').toString('hex')
      );
      console.log(
        'keyPairFromSeed private key = ',
        Buffer.from(edKey.privateKey, 'hex').toString('hex')
      );
      // accHex = hdWallet.publicKey().toString('hex');
      accHex = edKey.accountHex();
      console.log('new accHex = ', accHex);
      const publicKey = PublicKey.fromBytes(
        PublicKey.fromHex(edKey.accountHex()).toBytes()
      ).value();
      let accHash;
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
      const privateKey = Buffer.from(edKey.privateKey).toString('hex');
      // localStorage.setItem('test','works');
      return {
        accHex,
        accHash,
        privateKey,
        privateKeyUint8: edKey.privateKey,
        publicKeyUint8: edKey.publicKey.rawPublicKey,
      };
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  }
  const walletInformation = (customMnemonic) => {
    if (
      privateKey === '' &&
      accountHash === '' &&
      accountHex === '' &&
      mnemonic !== '' &&
      clicked
    ) {
      generateWallet(customMnemonic)
        .then(
          ({
            accHex,
            accHash,
            privateKey,
            publicKeyUint8,
            privateKeyUint8,
          }) => {
            setAccountHex(accHex);
            setAccountHash(accHash);
            setPrivateKey(privateKey);
            setPrivateKeyUint8(privateKeyUint8),
              setPublicKeyUint8(publicKeyUint8);
          }
        )
        .catch((err) => {
          console.log('Error ', err);
        });
    }
    return (
      <div>
        <span className="modal-description" style={{ marginBottom: '-2px' }}>
          Account hex
        </span>
        <TextArea
          type="text"
          className="modal-input-amount"
          style={{ padding: '13px' }}
          value={accountHex}
          disabled
        />
        <span className="modal-description">Account hash</span>
        <TextArea
          type="text"
          className="modal-input-amount"
          style={{ padding: '13px' }}
          value={accountHash}
          disabled
        />
        <span className="modal-description">
          Private key {shouldRevealPrivateKey}
        </span>
        <TextArea
          type="text"
          className="modal-input-amount"
          rows={3}
          style={{ padding: '13px' }}
          value={privateKey}
          hidden={!shouldRevealPrivateKey}
          disabled
        />
        {!shouldRevealPrivateKey && (
          <Button
            onClick={() => setShouldRevealPrivateKey(true)}
            className="send-button-no-mt"
            style={{ margin: 'auto', display: 'block', marginBottom: '10px' }}
          >
            Show private key
          </Button>
        )}
        {footerContent()}
      </div>
    );
  };
  const customOnCancelLogic = async () => {
    setIsNewWalletModalVisible(false);
    setIsImportFromSeedModalVisible(false);
    setIsImportFromFileModalVisible(false);
    setMnemonic(bip39.generateMnemonic());
    setClicked(false);
    setAccountHex('');
    setPrivateKey('');
    setAccountHash('');
    setWalletName('');
    setFileContents('');
    setSeedToImportFrom('');
    setShouldRevealPrivateKey(false);
  };
  const confirmWallet = async () => {
    try {
      let newWallet = await db.insert({
        walletName:
          walletName === ''
            ? bip39.generateMnemonic().split(' ').slice(0, 2).join(' ')
            : walletName,
        accountHash,
        accountHex,
        privateKey,
        privateKeyUint8,
        publicKeyUint8,
        mnemonic,
        hasMnemonic: true,
      });
      // setData({ ...data, shouldUpdateWallets: true });
      await customOnCancelLogic();
      newWallet = { ...newWallet, balance: 0, amount: 0 };
      const newWallets = [...wallets, newWallet];
      setWallets([...wallets, newWallet]);
      setData({
        ...data,
        wallets: newWallets,
        walletsLastUpdate: new Date(),
        shouldUpdateWallets: true,
      });
      // await getWallets(true);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  };
  const footerContent = () => {
    if (!clicked) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="primary"
            onClick={() => setClicked(true)}
            className="send-button"
          >
            I wrote it down
          </Button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="primary"
          onClick={confirmWallet}
          className="send-button-no-mt"
        >
          Confirm
        </Button>
      </div>
    );
  };
  const onImportFromFile = async (publicKeyArray, privateKeyArray) => {
    try {
      const { algorithm, hexKey, secretKeyBase64 } =
        parseAlgorithm(fileContents);
      let privateKeyUint8 = '';
      let publicKeyUint8;
      let keyPair;
      privateKeyUint8 = parseAlgorithm(fileContents).secretKeyBase64;
      if (algorithm === 'ed25519') {
        publicKeyUint8 = Keys.Ed25519.privateToPublicKey(
          Keys.Ed25519.parsePrivateKey(privateKeyUint8)
        );
        keyPair = Keys.Ed25519.parseKeyPair(publicKeyUint8, privateKeyUint8);
      } else {
        console.log('in else', privateKeyUint8.length);
        publicKeyUint8 = Keys.Secp256K1.privateToPublicKey(
          Keys.Secp256K1.parsePrivateKey(privateKeyUint8)
        );
        console.log('done pkuint');
        keyPair = Keys.Secp256K1.parseKeyPair(publicKeyUint8, privateKeyUint8);
      }
      console.log('keyPair = ', keyPair);
      let newWallet = await db.insert({
        walletName:
          walletName === ''
            ? bip39.generateMnemonic().split(' ').slice(0, 2).join(' ')
            : walletName,
        accountHash: Buffer.from(keyPair.accountHash()).toString('hex'),
        accountHex: keyPair.accountHex(),
        privateKey: Buffer.from(keyPair.privateKey, 'hex').toString('hex'),
        privateKeyUint8,
        publicKeyUint8,
        keyPair,
        mnemonic: '',
        hasMnemonic: false,
      });
      console.log('new wallet = ', newWallet);
      setShouldUpdate(!shouldUpdate);
      await customOnCancelLogic();
      notification.success({
        message: 'Success',
        description: 'Wallet successfully imported.',
      });
      const csprPrice = (await getCasperMarketInformation())?.price;
      const latestBlockHash = await getLatestBlockInfo();
      const balance = await getAccountBalance(
        newWallet.accountHex,
        latestBlockHash.block.hash,
        selectedNetwork
      );
      const amount = balance * csprPrice;
      newWallet = { ...newWallet, balance, amount };
      // stakedAmount = await getUserDelegatedAmount(wallet.accountHex)
      // stakedAmount = stakedAmount.stakedAmount
      //  stakedValue = csprPrice*stakedAmount
      setWallets([...wallets, newWallet]);
    } catch (error) {
      console.log('error = ', error);
      notification.error({
        message: 'Error',
        description: 'Unable to parse private key from file',
      });
    }
  };
  const importFromFileFooter = () => {
    return (
      <Button
        onClick={() => onImportFromFile()}
        className="send-button"
        style={{ margin: '30px auto 0px auto', display: 'block' }}
      >
        Import
      </Button>
    );
  };
  const importFromFileContent = () => {
    const [uploadedPublicKey, setUploadedPublicKey] = useState();
    const [uploadedPrivateKey, setUploadedPrivateKey] = useState();
    const handleFileUpload = async () => {
      const { dialog } = remote;
      dialog
        .showOpenDialog({
          title: 'Select your private key',
          defaultPath: path.join(__dirname, './services/'),
          buttonLabel: 'Upload',
          // Restricting the user to only Text Files.
          filters: [
            {
              name: 'Private Key File',
              extensions: ['pem', 'cer'],
            },
          ],
          // Specifying the File Selector Property
          properties: ['openFile'],
        })
        .then(async (file) => {
          if (!file.canceled) {
            const filePath = file.filePaths[0].toString();
            const fileContents = readFileSync(
              file.filePaths[0].toString(),
              'utf-8'
            );
            setFileContents(fileContents);
          }
        });
    };
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Import from file</div>
        <Input
          type="text"
          value={walletName}
          placeholder="Wallet Name"
          className="modal-input-amount"
          onChange={onWalletNameChange}
        />
        <Button
          style={{ width: '100%' }}
          className="send-button-no-mt"
          onClick={handleFileUpload}
        >
          Upload Private Key File
        </Button>
        {fileContents !== '' && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              marginBottom: '-1rem',
            }}
          >
            File uploaded.
          </p>
        )}
        {importFromFileFooter()}
      </div>
    );
  };
  const onImportFromSeed = async () => {
    try {
      const { accHex, accHash, privateKey, publicKeyUint8, privateKeyUint8 } =
        await generateWallet(seedToImportFrom.trim());
      let newWallet = await db.insert({
        walletName:
          walletName === ''
            ? bip39.generateMnemonic().split(' ').slice(0, 2).join(' ')
            : walletName,
        accountHash: accHash,
        accountHex: accHex,
        privateKey,
        publicKeyUint8,
        privateKeyUint8,
        mnemonic: seedToImportFrom,
        hasMnemonic: true,
      });
      setShouldUpdate(!shouldUpdate);
      const latestBlockHash = await getLatestBlockInfo();
      const balance = await getAccountBalance(
        newWallet.accountHex,
        latestBlockHash.block.hash,
        selectedNetwork
      );
      const csprPrice = (await getCasperMarketInformation())?.price;
      const amount = balance * csprPrice;
      newWallet = { ...newWallet, balance, amount };
      setWallets([...wallets, newWallet]);
      await customOnCancelLogic();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  };
  const importFromSeedFooter = () => {
    return (
      <Button
        onClick={onImportFromSeed}
        className="send-button-no-mt"
        style={{ margin: 'auto', display: 'block' }}
        disabled={seedError}
      >
        Import
      </Button>
    );
  };
  const importFromSeedContent = () => {
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Import from seed</div>
        <Input
          type="text"
          placeholder="Wallet Name"
          value={walletName}
          className="modal-input-amount"
          onChange={onWalletNameChange}
        />
        <TextArea
          className="modal-input-amount"
          placeholder="Your seed"
          onChange={(e) => {
            const { value } = e.target;
            const cleanValue = value.replace(/\s+/g, ' ');
            setSeedToImportFrom(cleanValue);
            if (
              cleanValue.trim().split(' ').length < 12 ||
              cleanValue.trim().split(' ').length > 12
            ) {
              setSeedError('Seed has to contain 12 words exactly');
            } else {
              setSeedError(null);
            }
          }}
          value={seedToImportFrom}
        />
        {seedError && <p style={{ color: 'red' }}>⚠ {seedError}</p>}
        {importFromSeedFooter()}
      </div>
    );
  };

  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);

  useEffect(() => {
    async function getDefaultWallet(withGetBalances) {
      console.log('getting Default wallet');
      if (localStorage.getItem('defaultWallet')) {
        const dw = JSON.parse(localStorage.getItem('defaultWallet'));
        const csprPrice = (await getCasperMarketInformation())?.price;
        setCasperPrice(csprPrice);
        const latestBlockHash = await getLatestBlockInfo();

        let balance = 0.1;
        let amount = 0.1;
        try {
          balance = withGetBalances
            ? await getAccountBalance(
                dw.accountHex,
                latestBlockHash.block.hash,
                selectedNetwork
              )
            : 0;
          amount = balance * csprPrice;
        } catch (error) {
          console.log('error = ', error);
          balance = 'Inactive account.';
        }
        // setDefaultWallet(dw);
        setDefaultWallet({ ...dw, balance, amount });
      } else {
        console.log('No default Wallet');
      }
    }
    getDefaultWallet(true);
  }, [selectedNetwork, selectedWallet]);

  useEffect(() => {
    async function getWallets(withGetBalances) {
      setPageLoading(true);
      console.log('getting wallets');
      const walletsDb = await db.find({});
      let filtredWallets = [];

      if (localStorage.getItem('defaultWallet')) {
        const dw = JSON.parse(localStorage.getItem('defaultWallet'));
        filtredWallets = walletsDb.filter((wallet) => {
          return wallet._id !== dw._id;
        });
      } else {
        filtredWallets = walletsDb;
      }

      const csprPrice = 1; // (await getCasperMarketInformation())?.price;
      setCasperPrice(csprPrice);
      const latestBlockHash = await getLatestBlockInfo();
      console.log(filtredWallets);
      console.log(filtredWallets && filtredWallets.length > 0);
      if (filtredWallets && filtredWallets.length > 0) {
        await Promise.all(
          filtredWallets &&
            filtredWallets.length > 0 &&
            filtredWallets.map(async (wallet, index) => {
              let balance;
              let amount = '';
              try {
                balance = withGetBalances
                  ? await getAccountBalance(
                      wallet.accountHex,
                      latestBlockHash.block.hash,
                      selectedNetwork
                    )
                  : 0;
                amount = balance * csprPrice;
                // stakedAmount = await getUserDelegatedAmount(wallet.accountHex)
                // stakedAmount = stakedAmount.stakedAmount
                //  stakedValue = csprPrice*stakedAmount
              } catch (error) {
                console.log('error = ', error);
                balance = 'Inactive account.';
              }
              filtredWallets[index] = { ...wallet, balance, amount };
            })
        );
        if (!defaultWallet) {
          localStorage.setItem(
            'defaultWallet',
            JSON.stringify(filtredWallets[0])
          );
          setDefaultWallet(filtredWallets[0]);
        }
      }
      setWallets(filtredWallets);
      setData({
        ...data,
        wallets,
        walletsLastUpdate: new Date(),
        shouldUpdateWallets: false,
      });
      setPageLoading(false);
    }
    if (
      data.wallets === 0 ||
      (new Date() - data.walletsLastUpdate) / 1000 > 180 ||
      data.shouldUpdateWallets
    ) {
      getWallets(true);
    } else {
      setPageLoading(true);
      setWallets(data.wallets);
      setPageLoading(false);
    }
  }, [
    shouldUpdate,
    selectedNetwork,
    data,
    db,
    setData,
    wallets,
    defaultWallet,
    selectedWallet,
  ]);
  const [isNewWalletModalVisible, setIsNewWalletModalVisible] = useState(false);
  const [isImportFromSeedModalVisible, setIsImportFromSeedModalVisible] =
    useState(false);
  const [isImportFromFileModalVisible, setIsImportFromFileModalVisible] =
    useState(false);

  return (
    <>
      <div>
        <Row justify="space-between" align="middle">
          <Col span={7}>
            <AddWallet
              isModalVisible={isNewWalletModalVisible}
              setIsModalVisible={setIsNewWalletModalVisible}
              title="New Wallet"
              customOnCancelLogic={customOnCancelLogic}
              footer={[footerContent()]}
            >
              {!clicked ? mnemonicModalSystem() : walletInformation()}
            </AddWallet>
          </Col>
          <Col span={7}>
            <AddWallet
              isModalVisible={isImportFromSeedModalVisible}
              setIsModalVisible={setIsImportFromSeedModalVisible}
              title="Import From Seed"
              // customOnCancelLogic={customOnCancelLogic}

              footer={[importFromSeedFooter()]}
            >
              {importFromSeedContent()}
            </AddWallet>
          </Col>
          <Col span={7}>
            <AddWallet
              isModalVisible={isImportFromFileModalVisible}
              setIsModalVisible={setIsImportFromFileModalVisible}
              title="Import From File"
              // customOnCancelLogic={customOnCancelLogic}

              footer={[importFromFileFooter()]}
            >
              {importFromFileContent()}
            </AddWallet>
          </Col>
        </Row>
        {(pageLoading || data.shouldUpdateWallets) && (
          <>
            <Spin
              style={{ margin: 'auto', display: 'block', marginBottom: '20px' }}
            />
          </>
        )}
        <Row gutter={[16, 16]} justify="start" align="middle">
          {defaultWallet && (
            <Col xs={24} xl={8} key="Col_wallet">
              <Wallet
                key="defaultWallet"
                casperPrice={casperPrice}
                setData={setData}
                data={data}
                setWallets={setWallets}
                wallets={wallets}
                shouldUpdate={shouldUpdate}
                setShouldUpdate={setShouldUpdate}
                db={db}
                id={defaultWallet._id}
                tag={defaultWallet.walletName}
                wallet={defaultWallet}
                title={
                  defaultWallet?.balance.toLocaleString().startsWith('Inactive')
                    ? defaultWallet.balance
                    : `${defaultWallet.balance.toFixed(5)} CSPR`
                }
                amount={
                  defaultWallet?.amount?.toLocaleString().startsWith('')
                    ? `${defaultWallet.amount.toFixed(5)} USD`
                    : `${defaultWallet.amount.toFixed(5).toLocaleString()} USD`
                }
              />
            </Col>
          )}

          {wallets?.length > 0 &&
            wallets?.map((wallet, i) => (
              <>
                {selectedWallet && selectedWallet._id !== wallet._id && (
                  <Col xs={24} xl={8} key={i}>
                    <Wallet
                      key={`wallet_${i}`}
                      casperPrice={casperPrice}
                      setData={setData}
                      data={data}
                      setWallets={setWallets}
                      wallets={wallets}
                      shouldUpdate={shouldUpdate}
                      setShouldUpdate={setShouldUpdate}
                      db={db}
                      id={wallet._id}
                      tag={wallet.walletName}
                      wallet={wallet}
                      title={
                        wallet?.balance.toLocaleString().startsWith('Inactive')
                          ? wallet.balance
                          : `${wallet.balance.toFixed(5)} CSPR`
                      }
                      amount={
                        wallet?.amount?.toLocaleString().startsWith('')
                          ? `${wallet.amount.toFixed(5)} USD`
                          : `${wallet.amount.toFixed(5).toLocaleString()} USD`
                      }
                    />
                  </Col>
                )}
                {/* <Col span={8} key={i}>
                  <Wallet
                    key={`wallet_${i}`}
                    casperPrice={casperPrice}
                    setData={setData}
                    data={data}
                    setWallets={setWallets}
                    wallets={wallets}
                    shouldUpdate={shouldUpdate}
                    setShouldUpdate={setShouldUpdate}
                    db={db}
                    id={wallet._id}
                    tag={wallet.walletName}
                    wallet={wallet}
                    title={
                      wallet?.balance.toLocaleString().startsWith('Inactive')
                        ? wallet.balance
                        : `${wallet.balance.toFixed(5)} CSPR`
                    }
                    amount={
                      wallet?.amount?.toLocaleString().startsWith('')
                        ? `${wallet.amount.toFixed(5)} USD`
                        : `${wallet.amount.toFixed(5).toLocaleString()} USD`
                    }
                  />
                </Col> */}
              </>
            ))}
        </Row>
      </div>
    </>
  );
};

export default WalletView;
