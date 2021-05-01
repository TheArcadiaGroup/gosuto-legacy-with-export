// Packages
import React from 'react';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  WalletOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  SwapOutlined,
} from '@ant-design/icons';

// Pages
import Home from './Home';
import WalletView from './WalletView';
import HistoryView from './HistoryView';
import StakingView from './StakingView';
import SwapView from './SwapView';

// logo
import logo from '../assets/icons/gosuto-logo-wordmark.png';
// styles
import './App.global.scss';

const { Header, Content, Sider } = Layout;
function App() {
  return (
    <HashRouter>
      <Layout className="layout">
        <Header className="site-header">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
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
              <Route path="/" component={Home} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </HashRouter>
  );
}

export default App;
