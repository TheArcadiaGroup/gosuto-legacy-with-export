import React from 'react';
import HistoryCard from './components/HistoryCard';
// styles
import './App.global.scss';

const HistoryView = () => {
  return (
    <>
      <HistoryCard
        date="Apr 01, 2021 07:15:20 am (CST)"
        fee="0.005 CSPR"
        id="2fc5327be3b254a…d84d6540bc4bab1"
        amount="50 CSPR from 0x89AC1479295d4b0427ED82050A86D1e3cFadc9D4"
        amountDollars="500.51 USD"
        method="Received"
      />
      <HistoryCard
        date="Apr 01, 2021 07:15:20 am (CST)"
        fee="0.005 CSPR"
        id="2fc5327be3b254a…d84d6540bc4bab1"
        amount="50 CSPR from 0x89AC1479295d4b0427ED82050A86D1e3cFadc9D4"
        amountDollars="500.51 USD"
        method="Staking"
        note="Rasikh"
      />
      <HistoryCard
        date="Apr 01, 2021 07:15:20 am (CST)"
        fee="0.005 CSPR"
        id="2fc5327be3b254a…d84d6540bc4bab1"
        amount="50 CSPR from 0x89AC1479295d4b0427ED82050A86D1e3cFadc9D4"
        amountDollars="500.51 USD"
        lost
        method="Send"
      />
      <HistoryCard
        date="Apr 01, 2021 07:15:20 am (CST)"
        fee="0.005 CSPR"
        id="2fc5327be3b254a…d84d6540bc4bab1"
        amount="50 CSPR from 0x89AC1479295d4b0427ED82050A86D1e3cFadc9D4"
        amountDollars="500.51 USD"
        lost
        method="Swap"
      />
      <HistoryCard
        date="Apr 01, 2021 07:15:20 am (CST)"
        fee="0.005 CSPR"
        id="2fc5327be3b254a…d84d6540bc4bab1"
        amount="50 CSPR from 0x89AC1479295d4b0427ED82050A86D1e3cFadc9D4"
        amountDollars="500.51 USD"
        method="Swap"
      />
    </>
  );
};

export default HistoryView;
