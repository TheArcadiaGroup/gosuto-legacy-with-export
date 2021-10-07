/* eslint-disable react/no-array-index-key */
/* eslint-disable no-underscore-dangle */
import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Spin } from 'antd';
// images
// styles
import '../App.global.scss';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import {
  getAccountBalance,
  getCasperMarketInformation,
  getLatestBlockInfo,
} from '../services/casper';
import WalletContext from '../contexts/WalletContext';
import AddWallet from '../components/AddWallet';
import NetworkContext from '../contexts/NetworkContext';
import DataContext from '../contexts/DataContext';
import ImportFromFile from '../components/Wallet/ImportFromFile';
import ImportFromSeed from '../components/Wallet/ImportFromSeed';
import AddNewWallet from '../components/Wallet/AddNewWallet';
import WalletItem from '../components/Wallet/WalletItem';

const WalletView = () => {
  const [selectedNetwork] = useContext(NetworkContext);
  const [data, setData] = useContext(DataContext);
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [pageLoading, setPageLoading] = useState(true);
  const [wallets, setWallets] = useState(data.wallets);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [casperPrice, setCasperPrice] = useState(0);
  const [defaultWallet, setDefaultWallet] = useState(null);
  const [isNewWalletModalVisible, setIsNewWalletModalVisible] = useState(false);
  const [isImportFromSeedModalVisible, setIsImportFromSeedModalVisible] =
    useState(false);
  const [isImportFromFileModalVisible, setIsImportFromFileModalVisible] =
    useState(false);

  useEffect(() => {
    async function getDefaultWallet(withGetBalances) {
      // eslint-disable-next-line no-console
      console.log('getting Default wallet');
      if (selectedWallet) {
        const csprPrice = (await getCasperMarketInformation())?.price;
        setCasperPrice(csprPrice);
        const latestBlockHash = await getLatestBlockInfo();
        let balance = 0.1;
        let amount = 0.1;
        try {
          balance = withGetBalances
            ? await getAccountBalance(
                selectedWallet.accountHex,
                latestBlockHash.block.hash,
                selectedNetwork
              )
            : 0;
          amount = balance * csprPrice;
        } catch (error) {
          console.log('error = ', error);
          balance = 'Inactive account.';
        }
        // setDefaultWallet(dw);
        setDefaultWallet({ ...selectedWallet, balance, amount });
      } else {
        setDefaultWallet(null);
        // eslint-disable-next-line no-console
        console.log('No default Wallet');
      }
    }
    getDefaultWallet(true);
  }, [selectedNetwork, selectedWallet]);

  useEffect(() => {
    async function getWallets(withGetBalances) {
      setPageLoading(true);
      // eslint-disable-next-line no-console
      console.log('getting wallets');
      const db = Datastore.create({
        filename: `${remote.app.getPath('userData')}/wallets.db`,
        timestampData: true,
      });
      const walletsDb = await db.find({});
      let filtredWallets = [];
      if (localStorage.getItem('defaultWallet')) {
        const dw = JSON.parse(localStorage.getItem('defaultWallet'));
        filtredWallets = walletsDb.filter((wallet) => {
          return wallet._id !== dw._id;
        });
      } else {
        filtredWallets = walletsDb;
      }
      const csprPrice = 1; // (await getCasperMarketInformation())?.price;
      setCasperPrice(csprPrice);
      const latestBlockHash = await getLatestBlockInfo();
      if (filtredWallets && filtredWallets.length > 0) {
        await Promise.all(
          filtredWallets &&
            filtredWallets.length > 0 &&
            filtredWallets.map(async (wallet, index) => {
              let balance;
              let amount = '';
              try {
                balance = withGetBalances
                  ? await getAccountBalance(
                      wallet.accountHex,
                      latestBlockHash.block.hash,
                      selectedNetwork
                    )
                  : 0;
                amount = balance * csprPrice;
              } catch (error) {
                // eslint-disable-next-line no-console
                console.log('error = ', error);
                balance = 'Inactive account.';
              }
              filtredWallets[index] = { ...wallet, balance, amount };
            })
        );
        if (!defaultWallet) {
          localStorage.setItem(
            'defaultWallet',
            JSON.stringify(filtredWallets[0])
          );
          setDefaultWallet(filtredWallets[0]);
          setSelectedWallet(filtredWallets[0]);
        }
      }
      setWallets(filtredWallets);
      setData({
        ...data,
        wallets,
        walletsLastUpdate: new Date(),
        shouldUpdateWallets: false,
      });
      setPageLoading(false);
    }
    if (
      data.wallets === 0 ||
      (new Date() - data.walletsLastUpdate) / 1000 > 180 ||
      data.shouldUpdateWallets
    ) {
      getWallets(true);
    } else {
      setPageLoading(true);
      setWallets(data.wallets);
      setPageLoading(false);
    }
  }, [
    selectedNetwork,
    data,
    defaultWallet,
    selectedWallet,
    wallets,
    setData,
    setSelectedWallet,
  ]);

  return (
    <>
      <div>
        <Row justify="space-between" align="middle">
          <Col span={7}>
            <AddWallet
              isModalVisible={isNewWalletModalVisible}
              setIsModalVisible={setIsNewWalletModalVisible}
              title="New Wallet"
              customOnCancelLogic={() => {}}
            >
              <AddNewWallet
                onSubmit={() => {
                  setIsNewWalletModalVisible(false);
                  setShouldUpdate(true);
                  setData({ ...data, shouldUpdateWallets: true });
                }}
              />
            </AddWallet>
          </Col>
          <Col span={7}>
            <AddWallet
              isModalVisible={isImportFromSeedModalVisible}
              setIsModalVisible={setIsImportFromSeedModalVisible}
              title="Import From Seed"
            >
              <ImportFromSeed
                onSubmit={() => {
                  setIsImportFromSeedModalVisible(false);
                  setShouldUpdate(true);
                  setData({ ...data, shouldUpdateWallets: true });
                }}
              />
            </AddWallet>
          </Col>
          <Col span={7}>
            <AddWallet
              isModalVisible={isImportFromFileModalVisible}
              setIsModalVisible={setIsImportFromFileModalVisible}
              title="Import From File"
            >
              <ImportFromFile
                onSubmit={() => {
                  setIsImportFromFileModalVisible(false);
                  setShouldUpdate(true);
                  setData({ ...data, shouldUpdateWallets: true });
                }}
              />
            </AddWallet>
          </Col>
        </Row>
        {(pageLoading || data.shouldUpdateWallets) && (
          <>
            <Spin
              size="large"
              style={{ margin: 'auto', display: 'block', marginBottom: '20px' }}
            />
          </>
        )}
        <Row gutter={[16, 16]} justify="start" align="middle">
          {defaultWallet && (
            <Col xs={24} xl={8} id="defaultWallet" key="Col_wallet">
              <WalletItem
                key="defaultWallet"
                casperPrice={casperPrice}
                setData={setData}
                data={data}
                setWallets={setWallets}
                wallets={wallets}
                shouldUpdate={shouldUpdate}
                setShouldUpdate={setShouldUpdate}
                // db={db}
                id={defaultWallet._id}
                tag={defaultWallet.walletName}
                wallet={defaultWallet}
                title={
                  defaultWallet?.balance.toLocaleString().startsWith('Inactive')
                    ? defaultWallet.balance
                    : `${defaultWallet.balance.toFixed(5)} CSPR`
                }
                amount={
                  defaultWallet?.amount?.toLocaleString().startsWith('')
                    ? `${defaultWallet.amount.toFixed(5)} USD`
                    : `${defaultWallet.amount.toFixed(5).toLocaleString()} USD`
                }
              />
            </Col>
          )}

          {wallets?.length > 0 &&
            wallets?.map((wallet, i) => (
              <>
                {selectedWallet && selectedWallet._id !== wallet._id && (
                  <Col xs={24} xl={8} key={i}>
                    <WalletItem
                      key={`wallet_${i}`}
                      casperPrice={casperPrice}
                      setData={setData}
                      data={data}
                      setWallets={setWallets}
                      wallets={wallets}
                      shouldUpdate={shouldUpdate}
                      setShouldUpdate={setShouldUpdate}
                      // db={db}
                      id={wallet._id}
                      wallet={wallet}
                      title={
                        wallet?.balance.toLocaleString().startsWith('Inactive')
                          ? wallet.balance
                          : `${wallet.balance.toFixed(5)} CSPR`
                      }
                      amount={
                        wallet?.amount?.toLocaleString().startsWith('')
                          ? `${wallet.amount.toFixed(5)} USD`
                          : `${wallet.amount.toFixed(5).toLocaleString()} USD`
                      }
                    />
                  </Col>
                )}
                {/* <Col span={8} key={i}>
                  <Wallet
                    key={`wallet_${i}`}
                    casperPrice={casperPrice}
                    setData={setData}
                    data={data}
                    setWallets={setWallets}
                    wallets={wallets}
                    shouldUpdate={shouldUpdate}
                    setShouldUpdate={setShouldUpdate}
                    db={db}
                    id={wallet._id}
                    tag={wallet.walletName}
                    wallet={wallet}
                    title={
                      wallet?.balance.toLocaleString().startsWith('Inactive')
                        ? wallet.balance
                        : `${wallet.balance.toFixed(5)} CSPR`
                    }
                    amount={
                      wallet?.amount?.toLocaleString().startsWith('')
                        ? `${wallet.amount.toFixed(5)} USD`
                        : `${wallet.amount.toFixed(5).toLocaleString()} USD`
                    }
                  />
                </Col> */}
              </>
            ))}
        </Row>
      </div>
    </>
  );
};

export default WalletView;
