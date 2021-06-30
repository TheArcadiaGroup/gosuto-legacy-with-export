import React, { useContext, useEffect, useState } from 'react';
import { Tag, Spin } from 'antd';
import HistoryCard from '../components/HistoryCard';
// styles
import './../App.global.scss';

// fake data
import fakeCards from '../HistoryCards.js';
import { getAccountHistory } from '../services/casper';
import WalletContext from '../contexts/WalletContext';
import DataContext from '../contexts/DataContext';
import NetworkContext from '../contexts/NetworkContext';

const HistoryView = () => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);
  const [data, setData] = useContext(DataContext);
  const [pageLoading, setPageLoading] = useState(true);
  const filters = ['All', 'Sent', 'Received', 'Staking'];
  const [selectedTag, setSelectedTag] = useState('All');
  const [cardsToDisplay, setCardsToDisplay] = useState();
  const [history, setHistory] = useState();
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
      const fetchedHistory = await getAccountHistory(
        selectedWallet?.accountHash,
        1,
        100,
        selectedNetwork
      );
      setHistory(fetchedHistory);
      setCardsToDisplay(fetchedHistory);
      setPageLoading(false);
      setData({
        ...data,
        history: fetchedHistory,
        historyLastUpdate: new Date(),
        shouldUpdateHistory: false,
      });
    }

    if (
      data.history == 0 ||
      (new Date() - data.historyLastUpdate) / 1000 > 180 ||
      data.shouldUpdateHistory
    ) {
      console.log('fetching new history');
      console.log(
        'history duration = ',
        (new Date() - data.historyLastUpdate) / 1000
      );
      getHistory();
    } else {
      console.log(
        'history duration = ',
        (new Date() - data.historyLastUpdate) / 1000
      );
      console.log('not fetching new history');
      setHistory(data.history);
      setCardsToDisplay(data.history);
      setPageLoading(false);
    }
  }, [selectedNetwork]);
  return (
    <>
      {/* {pageLoading && (
        <>
          <Spin style={{ margin: 'auto', display: 'block' }} />
        </>
      )} */}
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
      {(pageLoading || data.shouldUpdateHistory) && (
        <>
          <Spin
            style={{ margin: 'auto', display: 'block', marginBottom: '20px' }}
          />
        </>
      )}
      {cardsToDisplay &&
        cardsToDisplay.map((card, index) => (
          <HistoryCard
            key={index}
            selectedNetwork={selectedNetwork}
            date={new Date(card.timestamp).toLocaleString()}
            // fee={card.fee}
            id={card.deployHash}
            amount={card.amount / 1e9 + ' CSPR'}
            transferId={card.transferId}
            from={card.fromAccount}
            to={card.toAccount}
            method={card.method}
            lost={card.fromAccount == selectedWallet?.accountHash}
          />
        ))}
    </>
  );
};

export default HistoryView;
