import React from 'react';
import Wallet from './components/Wallet';
import AddWallet from './components/AddWallet';
// styles
import './App.global.scss';

const WalletView = () => {
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
        <AddWallet title="New Wallet" />
      </div>
    </>
  );
};

export default WalletView;
