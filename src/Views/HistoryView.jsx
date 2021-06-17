import React, { useContext, useEffect, useState } from 'react';
import { Tag } from 'antd';
import HistoryCard from '../components/HistoryCard';
// styles
import './../App.global.scss';

// fake data
import fakeCards from '../HistoryCards.js';
import { getAccountHistory } from '../services/casper';
import WalletContext from '../contexts/WalletContext';

const HistoryView = () => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);

  const filters = ['All', 'Sent', 'Received', 'Staking', 'Swap'];
  const [selectedTag, setSelectedTag] = useState('All');
  const [cardsToDisplay, setCardsToDisplay] = useState();
  const [history, setHistory] = useState()
  const handleTagClick = (filter) => {
    setSelectedTag(filter);
    setCardsToDisplay(
      filter === 'All'
        ? history
        : history?.filter((card) => card.method === filter)
    );

  };
  useEffect(() => {
    async function getHistory() {
     const history = await getAccountHistory(selectedWallet?.accountHash,1,100,'casper-test')
     setHistory(history);
     setCardsToDisplay(history)
    }
    getHistory()
  }, [])
  return (
    <>
      {filters.map((filter, index) => (
        <Tag
          key={index}
          className={filter === selectedTag ? 'selected-tag' : 'unselected-tag'}
          color="processing"
          onClick={() => handleTagClick(filter)}
        >
          <div className="filter-name">{filter}</div>
        </Tag>
      ))}
      {cardsToDisplay && cardsToDisplay.map((card, index) => (
        <HistoryCard
          key={index}
          date={new Date(card.timestamp).toLocaleString()}
          // fee={card.fee}
          id={card.deployHash}
          amount={(card.amount/1e9)+" CSPR"}
          // amountDollars={card.amountDollars}
          from={card.fromAccount}
          to={card.toAccount}
          method={card.method}
          lost={card.fromAccount == '2e008ed4b3f74508f65790b83ff3cc0647984b214d752b57638816ce54d9b094'}
        />
      ))}
    </>
  );
};

export default HistoryView;
