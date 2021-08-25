import React, { useContext, useEffect, useState } from 'react';
import { Tag, Spin, Empty } from 'antd';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import HistoryCard from '../components/HistoryCard';
// styles
import '../App.global.scss';

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
  const filters = ['All', 'Sent', 'Received', 'Staking', 'Failed', 'Pending'];
  const [selectedTag, setSelectedTag] = useState('All');
  const [cardsToDisplay, setCardsToDisplay] = useState([]);
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
      try {
        const fetchedHistory = await getAccountHistory(
          selectedWallet?.accountHash,
          1,
          100,
          selectedNetwork
        );
        console.log('pending history = ', data.pendingHistory);
        let { pendingHistory } = data;
        const pendingHistoryDB = Datastore.create({
          filename: `${remote.app.getPath('userData')}/pendingHistory.db`,
          timestampData: true,
        });
        if (data.pendingHistory.length === 0) {
          console.log('lenght === 0');
          pendingHistory = await pendingHistoryDB.find({});
          console.log('pending history after database = ', pendingHistory);
        }
        let newPending = [];
        pendingHistory.forEach(async (pendingOperation) => {
          if (
            JSON.stringify(fetchedHistory)?.indexOf(
              pendingOperation?.deployHash
            ) >= 0
          ) {
            await pendingHistoryDB.remove({
              deployHash: pendingOperation?.deployHash,
            });
          }
          if (
            JSON.stringify(fetchedHistory)?.indexOf(
              pendingOperation?.deployHash
            ) < 0 &&
            pendingOperation.network === selectedNetwork &&
            pendingOperation.wallet === selectedWallet.accountHex
          ) {
            const today = new Date();
            const diffMs = today - new Date(pendingOperation.createdAt); // milliseconds between now & creation of history
            const diffMins = Math.floor(diffMs / 1000 / 60); // minutes
            if (diffMins > 10 && pendingOperation.method !== 'Failed') {
              console.log('=======================');
              await pendingHistoryDB.update(
                { _id: pendingOperation._id },
                { ...pendingOperation, method: 'Failed' }
              );
              pendingOperation.method = 'Failed';
              newPending.push(pendingOperation);
            } else {
              newPending.push(pendingOperation);
            }
          }
        });
        newPending = newPending.reverse();
        console.log('pending history after filter = ', newPending);
        console.log('fetchedHistory = ', fetchedHistory);
        const allHistory = newPending.concat(fetchedHistory);
        console.log('allHistory = ', allHistory);
        setHistory(allHistory);
        setCardsToDisplay(allHistory);
        setPageLoading(false);
        setData({
          ...data,
          history: allHistory,
          historyLastUpdate: new Date(),
          shouldUpdateHistory: false,
        });
      } catch (error) {}
    }

    if (
      data.history === 0 ||
      (new Date() - data.historyLastUpdate) / 1000 > 1 ||
      data.shouldUpdateHistory
    ) {
      console.log('fetching new history');
      console.log(
        'history duration = ',
        (new Date() - data.historyLastUpdate) / 1000
      );
      if (selectedWallet?.accountHash) getHistory();
    } else {
      console.log(
        'history duration = ',
        (new Date() - data.historyLastUpdate) / 1000
      );
      console.log('not fetching new history');
      if (selectedWallet?.accountHash) {
        setHistory(data.history);
        setCardsToDisplay(data.history);
        setPageLoading(false);
      }
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
          style={{ cursor: 'pointer' }}
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
      {cardsToDisplay.length > 0 &&
        cardsToDisplay.map((card, index) => (
          <HistoryCard
            key={index}
            selectedNetwork={selectedNetwork}
            date={new Date(card?.timestamp).toLocaleString()}
            // fee={card.fee}
            id={card.deployHash}
            amount={`${card.amount / 1e9} CSPR`}
            transferId={card.transferId}
            from={card.fromAccount}
            to={card.toAccount}
            method={card.method}
            lost={
              card.fromAccount === selectedWallet?.accountHash ||
              card.fromAccount === selectedWallet?.accountHex
            }
          />
        ))}

      {cardsToDisplay.length === 0 && !pageLoading && (
        <>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </>
      )}
    </>
  );
};

export default HistoryView;
