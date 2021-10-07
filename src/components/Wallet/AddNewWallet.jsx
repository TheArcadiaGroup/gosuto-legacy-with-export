/* eslint-disable consistent-return */
import React, { useState, useContext } from 'react';
import { Tag, Button, Input, notification } from 'antd';
import Datastore from 'nedb-promises';
import TextArea from 'antd/lib/input/TextArea';
import { Keys, PublicKey } from 'casper-client-sdk';
import nacl from 'tweetnacl';

import { remote } from 'electron';

import WalletContext from '../../contexts/WalletContext';
import vault from '../../../assets/icons/vault-logo.png';

// mnemonic phrase package
const bip39 = require('bip39');

function AddNewWallet(props) {
  const { onSubmit } = props;
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [clicked, setClicked] = useState(false);
  const [mnemonic] = useState(bip39.generateMnemonic());
  const [walletName, setWalletName] = useState('');
  const [accountHex, setAccountHex] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [accountHash, setAccountHash] = useState('');
  const [publicKeyUint8, setPublicKeyUint8] = useState('');
  const [privateKeyUint8, setPrivateKeyUint8] = useState('');
  const [shouldRevealPrivateKey, setShouldRevealPrivateKey] = useState(false);
  const onWalletNameChange = (event) => {
    setWalletName(event.target.value);
  };
  const confirmWallet = async () => {
    try {
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const newWallet = await db.insert({
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
      if (!localStorage.getItem('defaultWallet') && !selectedWallet) {
        await db.update(
          { _id: newWallet.id },
          { ...newWallet, isDefaultWallet: true }
        );
        newWallet.isDefaultWallet = true;
        localStorage.setItem('defaultWallet', JSON.stringify(newWallet));
        setSelectedWallet(newWallet);
      }
      onSubmit(newWallet);
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
  const generateWallet = async (customMnemonic) => {
    try {
      let accHex = '';
      const cleanMnemonic = mnemonic
        .split(' ')
        .map((mnemonic_) => mnemonic_.trim())
        .join(' ');
      const mnemonicToUse = customMnemonic || cleanMnemonic;
      const currentMnemonicSeed = await bip39.mnemonicToSeed(mnemonicToUse);
      // const nw = EthereumHDKey.fromMasterSeed(currentMnemonicSeed);
      const keyPairFromSeed = nacl.sign.keyPair.fromSeed(
        Uint8Array.from(currentMnemonicSeed.subarray(0, 32)).valueOf()
      );
      const edKey = new Keys.Ed25519(keyPairFromSeed);
      accHex = edKey.accountHex();
      const publicKey = PublicKey.fromBytes(
        PublicKey.fromHex(edKey.accountHex()).toBytes()
      ).value();
      let accHash;
      accHex = publicKey.toAccountHex();
      accHash = publicKey.toAccountHash();
      accHash = Buffer.from(accHash).toString('hex');
      const privateKeyLocal = Buffer.from(edKey.privateKey).toString('hex');
      const res = {
        accHex,
        accHash,
        privateKey: privateKeyLocal,
        privateKeyUint8: edKey.privateKey,
        publicKeyUint8: edKey.publicKey.rawPublicKey,
      };
      return res;
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error,
      });
    }
  };
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
            privateKeyGenerated,
            publicKeyUint8Generated,
            privateKeyUint8Generated,
          }) => {
            setAccountHex(accHex);
            setAccountHash(accHash);
            setPrivateKey(privateKeyGenerated);
            setPrivateKeyUint8(privateKeyUint8Generated);
            setPublicKeyUint8(publicKeyUint8Generated);
            return 0;
          }
        )
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log('Error in walletInformation : ', err);
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

  const mnemonicModalSystem = () => {
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
            maxLength={30}
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
            <div className="mnemonic-word" key={word}>
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
  return !clicked ? mnemonicModalSystem() : walletInformation();
}

export default AddNewWallet;
