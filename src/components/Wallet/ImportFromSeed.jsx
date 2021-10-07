/* eslint-disable consistent-return */
/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
import React, { useState, useContext } from 'react';
import { Button, Input, notification } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { Keys, PublicKey } from 'casper-client-sdk';
import nacl from 'tweetnacl';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import WalletContext from '../../contexts/WalletContext';
import vault from '../../../assets/icons/vault-logo.png';
import Modal from './Modal';

const bip39 = require('bip39'); // mnemonic phrase package

function ImportFromSeed(props) {
  const { onSubmit } = props;
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [mnemonic] = useState(bip39.generateMnemonic());
  const [seedToImportFrom, setSeedToImportFrom] = useState('');
  const [walletName, setWalletName] = useState('');
  const [seedError, setSeedError] = useState(null);

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
      const privateKey = Buffer.from(edKey.privateKey).toString('hex');
      const res = {
        accHex,
        accHash,
        privateKey,
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
  const onImportFromSeed = async () => {
    try {
      const { accHex, accHash, privateKey, publicKeyUint8, privateKeyUint8 } =
        await generateWallet(seedToImportFrom.trim());
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const newWallet = await db.insert({
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

  const onWalletNameChange = (event) => {
    setWalletName(event.target.value);
  };
  const [isImportFromSeedModalVisible, setIsImportFromSeedModalVisible] =
    useState(false);
  return (
    <Modal
      isModalVisible={isImportFromSeedModalVisible}
      setIsModalVisible={setIsImportFromSeedModalVisible}
      title="Import From Seed"
      customOnCancelLogic={() => {
        setWalletName('');
        setSeedToImportFrom('');
        setSeedError(null);
      }}
    >
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
          maxLength={30}
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
        <Button
          onClick={onImportFromSeed}
          className="send-button-no-mt"
          style={{ margin: 'auto', display: 'block' }}
          disabled={seedError}
        >
          Import
        </Button>
      </div>
    </Modal>
  );
}

ImportFromSeed.defaultProps = {
  onSubmit: () => {},
};
export default ImportFromSeed;
