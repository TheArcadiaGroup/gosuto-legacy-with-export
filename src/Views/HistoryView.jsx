/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react';
import { Tag, Spin, Empty } from 'antd';
import axios from 'axios';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import HistoryCard from '../components/HistoryCard';
// styles
import '../App.global.scss';

// fake data
import fakeCards from '../HistoryCards.js';
import { getAccountHistory, getEndpointByNetwork } from '../services/casper';
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
  const [history, setHistory] = useState([]);
  const handleTagClick = (filter) => {
    setSelectedTag(filter);
    const newHistory =
      filter === 'All'
        ? history
        : history?.filter((card) => card.method.indexOf(filter) >= 0);
    setCardsToDisplay(newHistory);
  };

  async function getHistory(dataT) {
    try {
      const fetchedHistory = await getAccountHistory(
        selectedWallet?.accountHash,
        1,
        100,
        selectedNetwork
      );
      let { pendingHistory } = dataT;
      const pendingHistoryDB = Datastore.create({
        filename: `${remote.app.getPath('userData')}/pendingHistory.db`,
        timestampData: true,
      });
      console.log('lenght === 0');
      pendingHistory = await pendingHistoryDB.find({});
      console.log('pending history after database = ', pendingHistory);
      let newPending = [];
      pendingHistory.forEach(async (element) => {
        const pendingOperation = element;
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
          console.log('IN OTHER IF');
          const today = new Date();
          const diffMs = today - new Date(pendingOperation.timestamp); // milliseconds between now & creation of history
          const diffMins = Math.floor(diffMs / 1000 / 60); // minutes
          console.log('pendingOperation = ', pendingOperation);
          if (diffMins > 3 && pendingOperation.method !== 'Failed') {
            const requestData = JSON.stringify({
              jsonrpc: '2.0',
              method: 'info_get_deploy',
              params: [pendingOperation.deployHash],
              id: 1,
            });

            const config = {
              method: 'post',
              url: getEndpointByNetwork(setSelectedNetwork),
              headers: {
                'Content-Type': 'application/json',
              },
              data: requestData,
            };
            const response = await axios(config);
            console.log('RESPONSE AXIOS = ', response.data);
            const executionResult =
              response.data.result.execution_results[0].result;
            if (executionResult.Failure) {
              console.log('FAIL=======================');
              await pendingHistoryDB.update(
                { _id: pendingOperation._id },
                { ...pendingOperation, method: 'Failed' }
              );
              pendingOperation.method = 'Failed';
            } else if (executionResult.Success) {
              pendingOperation.method = 'Staking';

              console.log('SUCCESS=======================');
              await pendingHistoryDB.update(
                { _id: pendingOperation._id },
                { ...pendingOperation, method: 'Staking' }
              );
            }
            newPending.push(pendingOperation);
          } else {
            newPending.push(pendingOperation);
          }
        }
      });
      // for (let index = 0; index < pendingHistory.length; index++) {}

      newPending = newPending.reverse();
      console.log('pending history after filter = ', newPending);
      console.log('fetchedHistory = ', fetchedHistory);
      const allHistory = newPending.concat(fetchedHistory);
      allHistory.sort((a, b) => {
        return a.timestamp > b.timestamp ? -1 : 1;
      });
      console.log('allHistory = ', allHistory);
      return allHistory;
    } catch (error) {
      console.log('get histroy error = ', error);
      return [];
    }
  }

  useEffect(() => {
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
      if (selectedWallet?.accountHash) {
        getHistory(data)
          .then((allHistory) => {
            setHistory(allHistory);
            setCardsToDisplay(allHistory);
            setPageLoading(false);
            setData({
              ...data,
              history: allHistory,
              historyLastUpdate: new Date(),
              shouldUpdateHistory: false,
            });
            return 0;
          })
          .catch((error) => {
            setHistory([]);
            setCardsToDisplay([]);
            setPageLoading(false);
            setData({
              ...data,
              history: [],
              historyLastUpdate: new Date(),
              shouldUpdateHistory: false,
            });
          });
      }
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
      } else {
        setHistory([]);
        setCardsToDisplay([]);
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
          key={`filters_${index}`}
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
