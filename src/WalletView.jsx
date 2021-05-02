import React from 'react';
import { Tag, Button } from 'antd';
import Wallet from './components/Wallet';
import AddWallet from './components/AddWallet';

// images
import vault from '../assets/icons/vault-logo.png';

// styles
import './App.global.scss';

// mnemonic phrase package
const bip39 = require('bip39');

const WalletView = () => {
  const mnemonic = bip39.generateMnemonic();
  const mnemonicModalSystem = () => {
    const mnemonicWords = mnemonic.split(' ');
    return (
      <div>
        <div className="modal-vault-logo">
          <img src={vault} alt="vault" className="image-modal" />
        </div>
        <div className="modal-title">Create a new wallet</div>
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
  return (
    <>
      <div className="spacing-wallets-index">
        <Wallet
          tag="CSPR wallet 01"
          title="250.5010 CSPR available"
          amount="2507.54 USD"
          secondaryAmount="2507.54 USD"
          secondaryTitle="250.5010 CSPR available"
        />
        <AddWallet
          title="New Wallet"
          children={mnemonicModalSystem()}
          footer={[
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" className="send-button">
                I wrote it down
              </Button>
            </div>,
          ]}
        />
      </div>
    </>
  );
};

export default WalletView;
