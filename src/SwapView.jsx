import React from 'react';
import WalletCard from './components/card';
import Charts from './components/Charts';

// images
import swapLogo from '../assets/icons/swap-button.svg';
// styles
import './App.global.scss';

const SwapView = () => {
  return (
    <>
      <div className="spacing-charts-index">
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
        <img src={swapLogo} alt="vault" className="images" />
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
      </div>
      <div className="charts-maintainer">
        <Charts tag="CSPR Price" amount="10.0101 USD" />
      </div>
    </>
  );
};

export default SwapView;
