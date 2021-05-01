import React from 'react';
import StakingCard from './components/StakingCard';
import StakingTable from './components/StakingTable';
import AddWallet from './components/AddWallet';
// styles
import './App.global.scss';

const StakingView = () => {
  return (
    <>
      <div className="spacing-wallets-index">
        <StakingCard
          tag="Delegated"
          amount="85.0150 CSPR"
          amountDollars="851.01 USD"
          validator="Arcadia"
        />
        <StakingCard
          tag="Rewards"
          amount="0.5050 CSPR"
          amountDollars="5.05 USD"
          withdraw
        />
      </div>
      <div className="spacing-wallets-index">
        <StakingCard
          tag="Undelegated"
          amount="165.4860 CSPR"
          amountDollars="1656.53 USD"
        />
        <AddWallet title="Earn with Arcadia" />
      </div>
      <StakingTable />
    </>
  );
};

export default StakingView;
