/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
import React, { useState, useContext } from 'react';
import { Button, Input, notification } from 'antd';
import path from 'path';
import { Keys } from 'casper-client-sdk';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import { readFileSync } from 'fs';

import WalletContext from '../../contexts/WalletContext';
import { parseAlgorithm } from '../../utils/casper';
import vault from '../../../assets/icons/vault-logo.png';
import Modal from './Modal';

const bip39 = require('bip39');

function ImportFromFile(props) {
  const { onSubmit } = props;
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [fileContents, setFileContents] = useState('');
  const [walletName, setWalletName] = useState('');
  const [isImportFromFileModalVisible, setIsImportFromFileModalVisible] =
    useState(false);

  const handleFileUpload = async () => {
    const { dialog } = remote;
    return dialog
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
          // const filePath = file.filePaths[0].toString();
          setFileContents(readFileSync(file.filePaths[0].toString(), 'utf-8'));
        }
      });
  };
  const onWalletNameChange = (event) => {
    setWalletName(event.target.value);
  };
  const onImportFromFile = async () => {
    try {
      const { algorithm } = parseAlgorithm(fileContents);
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
        publicKeyUint8 = Keys.Secp256K1.privateToPublicKey(
          Keys.Secp256K1.parsePrivateKey(privateKeyUint8)
        );
        keyPair = Keys.Secp256K1.parseKeyPair(publicKeyUint8, privateKeyUint8);
      }
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const newWallet = await db.insert({
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
      setIsImportFromFileModalVisible(false);
      notification.success({
        message: 'Success',
        description: 'Wallet successfully imported.',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error = ', error);
      notification.error({
        message: 'Error',
        description: 'Error importing wallet from private key.',
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

  return (
    <Modal
      isModalVisible={isImportFromFileModalVisible}
      setIsModalVisible={setIsImportFromFileModalVisible}
      title="Import From File"
      customOnCancelLogic={() => {
        setWalletName('');
        setFileContents('');
      }}
    >
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
          maxLength={30}
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
    </Modal>
  );
}
ImportFromFile.defaultProps = {
  onSubmit: () => {},
};
export default ImportFromFile;
