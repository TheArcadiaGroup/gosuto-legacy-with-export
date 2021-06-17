import React from 'react';
import WalletCard from '../components/card';
import Charts from '../components/Charts';

// images
import swapLogo from '../../assets/icons/swap-button.svg';
// styles
import './../App.global.scss';
import { Col, Row } from 'antd';

const SwapView = () => {
  return (
    <>
    <Row justify="space-between" align='middle'>
      <Col span={9}>
      <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
      </Col>
      <Col>
      <img src={swapLogo} alt="vault"/>
      </Col>
      <Col span={9}>
      <WalletCard tag="Swap" title="0" amount="0.00 USD" selector />
      </Col>
    </Row>
      <div className="charts-maintainer">
        <Charts tag="CSPR Price" amount="10.0101 USD" />
      </div>
    </>
  );
};

export default SwapView;
