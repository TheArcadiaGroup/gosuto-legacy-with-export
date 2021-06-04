// Packages
import React, { useEffect, useState } from 'react';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Layout, Menu, Select, Button, notification } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  DashboardOutlined,
  WalletOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  SwapOutlined,
} from '@ant-design/icons';

// Pages
import Home from './Home';
import WalletView from './Views/WalletView';
import HistoryView from './Views/HistoryView';
import StakingView from './Views/StakingView';
import SwapView from './Views/SwapView';

// logo
import logo from '../assets/icons/gosuto-logo.png';
import copyLogo from '../assets/icons/copy.svg';
// styles
import './App.global.scss';
import { CasperClient, CasperServiceByJsonRPC, PublicKey } from 'casper-client-sdk';
import { mnemonicToSeed } from 'bip39';
import { getAccountBalance } from './services/casper';
import Datastore from 'nedb-promises';
import PasswordView from './Views/PasswordView';
const { remote } = require('electron');

const { Header, Content, Sider } = Layout;
const { Option } = Select;
function App() {
  const [text, setText] = useState('');
  const getLatestBlockInfo = async () => {
    const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc')
    const latestBlock = await casperService.getLatestBlockInfo();
    setText(latestBlock.block.header.height);
    return latestBlock.block.header.height;
  }

  // const getAccountBalance = async () => {
    //   const casperService = new CasperServiceByJsonRPC('http://3.14.161.135:7777/rpc');
    //   // casperService.acco
    //   const balance = await casperService.getAccountBalance('185c1e21cd0198ae676ea103c74871368b6ec5d28570a0df435fffdbc9146723','uref-d87deb992bb04abf149fb68bf42735f16db7ea0360ff9e9abde9eb4917b52a2c-007');
    //   let accountHex = new CasperClient().newHdWallet(Uint8Array.from(await mnemonicToSeed('hola!'))).publicKey().toString('hex');
    //   let wallet = PublicKey.fromHex(accountHex).toAccountHash();
    //   wallet  = Buffer.from(wallet).toString('hex');
    //   setText(wallet);

    //   return parseInt(balance);
    // }
    useEffect(() => {

    async function getAccountInformation() {
      // const db = Datastore.create({
      //   filename:`${remote.app.getPath('userData')}/todolist.db`,
      //   timestampData:true
      // })
      // db.insert({
      //   name:'x'
      // })
      // const t = await db.count();
      // setText(t);
      const accBalance = await getAccountBalance();
      setText(accBalance);
    }
    getAccountInformation();
}, [])
  const [isCopied, setIsCopied] = useState(false);
  const onCopyText = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };
  const handleLanguageChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handleCurrencyChange = (value) => {
    console.log(`selected ${value}`);
  };
  const openNotification = () => {
    notification.success({
      message: 'Copied',
      description: 'Your ID was copied',
      duration: 3,
      className: 'custom-notification',
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  };
  return (
    <HashRouter>
      <Layout className="layout">
        <Header className="site-header">
          <div className="link-holder">
            <Link to="/" className="logo-header-holder">
              <img src={logo} alt="Logo" className="logo-header" />
            </Link>
          </div>
          <CopyToClipboard text={text} onCopy={onCopyText}>
            <div className="wallet-id">
              {text}{' '}
              <Button
                className="copy-button"
                onClick={() => {
                  isCopied && openNotification();
                }}
              >
                <img src={copyLogo} alt="Logo" />
              </Button>
            </div>
          </CopyToClipboard>
          <div>
            <Select
              defaultValue="English"
              style={{ width: 120, height: 35, marginRight: 30 }}
              onChange={handleLanguageChange}
              className="chart-selector"
            >
              <Option value="English">English</Option>
              <Option value="French">French</Option>
            </Select>
            <Select
              defaultValue="USD"
              style={{ width: 120, height: 35, marginRight: 30 }}
              onChange={handleCurrencyChange}
              className="chart-selector"
            >
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </div>
        </Header>
        <Layout className="site-layout">
          <Sider className="site-layout-side">
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                <Link to="/">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<WalletOutlined />}>
                <Link to="/wallet">Wallet</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<HistoryOutlined />}>
                <Link to="/history">History</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<AreaChartOutlined />}>
                <Link to="/staking">Staking (Validator)</Link>
              </Menu.Item>
              <Menu.Item key="5" icon={<SwapOutlined />}>
                <Link to="/swap">Swap</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="site-layout-background">
            <Switch>
              <Route path="/swap" component={SwapView} />
              <Route path="/staking" component={StakingView} />
              <Route path="/history" component={HistoryView} />
              <Route path="/wallet" component={WalletView} />
              <Route path="/" component={PasswordView} />
              <Route path="/home" component={Home} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  );
}

export default App;
