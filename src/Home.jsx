import React, { useContext, useEffect, useState } from 'react';
import WalletCard from './components/card';
// import Charts from './components/Charts';

// images
import vault from '../assets/icons/vault-logo.png';
// import swapLogo from '../assets/icons/swap-button.svg';
// styles
import './App.global.scss';
import {
  getAccountBalance,
  getCasperMarketInformation,
  getLatestBlockInfo,
  getTotalStaked,
  getUserDelegatedAmount,
} from './services/casper';
import { Card, Col, notification, Row } from 'antd';
import Datastore from 'nedb-promises';
import { remote } from 'electron';
import WalletContext from './contexts/WalletContext';
import NetworkContext from './contexts/NetworkContext';

const Home = () => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useContext(NetworkContext);

  const [balance, setBalance] = useState(0);
  const [casperPrice, setCasperPrice] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [holdingsValue, setHoldingsValue] = useState(0);
  const [changePercentage, setChangePercentage] = useState(0);
  const [currentStake, setCurrentStake] = useState(0);
  const [currentStakeValue, setCurrentStakeValue] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function getAccountInformation() {
      try {
        const {
          price,
          casperTotalSupply,
          casperCirculatingSupply,
          casperPriceChangePercentage24h,
        } = await getCasperMarketInformation();
        const db = Datastore.create({
          filename: `${remote.app.getPath('userData')}/wallets.db`,
          timestampData: true,
        });
        let wallets = await db.find({});
        wallets = wallets.map((wallet) => {
          return wallet.accountHex;
        });
        const latestBlockHash = await getLatestBlockInfo();

        const accBalance = await getAccountBalance(
          selectedWallet?.accountHex,
          latestBlockHash.block.hash,
          selectedNetwork
        );
        setBalance(accBalance);
        const currStake = (
          await getUserDelegatedAmount(
            selectedWallet?.accountHex,
            selectedNetwork
          )
        ).stakedAmount;
        setCurrentStake(currStake);
        setCurrentStakeValue(currStake * price);
        setCasperPrice(price);
        setTotalSupply(casperTotalSupply);
        setCirculatingSupply(casperCirculatingSupply);
        setChangePercentage(casperPriceChangePercentage24h.usd);
        setHoldingsValue(price * accBalance);
        setTotalStaked(await getTotalStaked(selectedNetwork));
        setLoading(false);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        notification['error']({
          message: 'Error',
          description: error,
        });
      }
    }
    getAccountInformation();
  }, [selectedNetwork]);
  const formatter = new Intl.NumberFormat('en-US', {
    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col span={9}>
          <WalletCard
            tag="Current balance"
            title={`${balance.toLocaleString()} CSPR`}
            amount={`${holdingsValue.toLocaleString()} USD`}
            loading={loading}
          />
        </Col>
        <Col>
          <img src={vault} alt="vault" style={{ margin: 'auto' }} />
        </Col>
        <Col span={9}>
          <WalletCard
            tag="Current stake"
            title={`${currentStake.toLocaleString()} CSPR`}
            amount={`${currentStakeValue.toLocaleString()} USD`}
            loading={loading}
            // rewards="0.5050 CSPR Rewards"
          />
        </Col>
      </Row>
      {/* <Row justify="space-between" align='middle'>
        <Col span={9}>
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
        </Col>
        <Col>
        <img src={swapLogo} alt="vault" />
        </Col>
        <Col span={9}>
        <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
        </Col>
      </Row> */}
      <Row justify="space-between" align="middle">
        <Col md={24} lg={24} xl={8} xxl={4}>
          <WalletCard
            tag="CSPR price"
            title={`${casperPrice.toLocaleString()} USD`}
            amount={
              changePercentage.toString().startsWith('-')
                ? `${changePercentage.toLocaleString()}%`
                : `+ ${changePercentage.toLocaleString()}%`
            }
            loading={loading}
          />
        </Col>
        <Col md={24} lg={24} xl={15} xxl={9}>
          <WalletCard
            tag="Total Stake Bonded"
            title={`${totalStaked.toLocaleString()} CSPR`}
            amount={
              selectedNetwork == 'casper'
                ? `${((totalStaked / totalSupply) * 100).toLocaleString()}%`
                : '0%'
            }
            loading={loading}
          />
        </Col>
        <Col md={24} lg={24} xl={24} xxl={10}>
          <WalletCard
            tag="Circulating Supply"
            title={`${circulatingSupply.toLocaleString()} / ${totalSupply.toLocaleString()}`}
            amount={`${formatter.format(casperPrice * circulatingSupply)} USD`}
            loading={loading}
          />
        </Col>
      </Row>

      {/* <div className="charts-maintainer">
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
      </div> */}
    </div>
  );
};

export default Home;
