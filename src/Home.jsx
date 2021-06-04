import React, { useEffect, useState } from 'react';
import WalletCard from './components/card';
import Charts from './components/Charts';

// images
import vault from '../assets/icons/vault-logo.png';
import swapLogo from '../assets/icons/swap-button.svg';
// styles
import './App.global.scss';
import { getAccountBalance } from './services/casper';


const Home = () => {
  const [balance, setBalance] = useState('');
  useEffect(() => {
    async function getAccountInformation() {
      const accBalance = await getAccountBalance();
      setBalance(accBalance);
    }
    getAccountInformation();
}, [])
  return (
    <>
      <div className="spacing-charts-index">
        <WalletCard
          tag="Current balance"
          title={`${balance} available`}
          amount="2507.54 USD"
        />
        <img src={vault} alt="vault" className="images" />
        <WalletCard
          tag="Current stake"
          title="250.5010 CSPR available"
          amount="2507.54 USD"
          rewards="0.5050 CSPR Rewards"
        />
      </div>
      <div className="spacing-charts-index">
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
        <img src={swapLogo} alt="vault" className="images" />
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
      </div>
      <div className="spacing-charts-index">
        <WalletCard tag="CSPR price" title="10.0101 USD / CSPR" />
        <WalletCard
          tag="Issuance"
          title="999, 999, 999 CSPR"
          amount="10,009,999,990 USD"
        />
        <WalletCard
          tag="Staking ratio"
          title="333, 333, 333 CSPR"
          amount="30% staked"
        />
      </div>
      <div className="charts-maintainer">
        <Charts tag="Transaction volume" amount="$26 234 USD" />
      </div>
      <div className="charts-maintainer">
        <Charts
          className="charts-maintainer"
          tag="Staking return"
          amount="155% APY"
        />
      </div>
      <div className="charts-maintainer">
        <Charts
          className="charts-maintainer"
          tag="Total accounts"
          amount="1, 850, 100 mil accounts"
        />
      </div>
    </>
  );
};

export default Home;
