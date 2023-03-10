import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row, Select, Spin } from 'antd';
import './components.global.scss';

const { Option } = Select;

const WalletCard = ({ tag, title, amount, selector, rewards, loading }) => {
  const handleChange = (value) => {};
  return (
    <div className="site-card-wrapper">
      <Row>
        <Col span={24}>
          <Card bordered={false} className="wallet-card">
            <div className="wallet-card-tag">{tag}</div>
            <div className="wallet-card-display-flex">
              {loading === true && (
                <Spin
                  spinning
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
              {loading === false && (
                <div className="wallet-card-title">{title}</div>
              )}
              {selector && (
                <Select
                  defaultValue="CSPR"
                  style={{ width: 120, height: 35, marginTop: 30 }}
                  onChange={handleChange}
                  className="custom-selector"
                >
                  <Option value="CSPR">CSPR</Option>
                  <Option value="CSPROther">CSPR Other</Option>
                </Select>
              )}
            </div>
            <div className="wallet-card-display-flex" style={{ marginTop: 15 }}>
              {loading === false && (
                <div className="wallet-card-amount">{amount}</div>
              )}
              {rewards && <div className="wallet-card-rewards">{rewards}</div>}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

WalletCard.propTypes = {
  tag: PropTypes.string,
  title: PropTypes.string,
  amount: PropTypes.string,
  rewards: PropTypes.string,
  selector: PropTypes.bool,
};

export default WalletCard;
