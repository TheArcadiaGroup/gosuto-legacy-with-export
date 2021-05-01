import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row, Select } from 'antd';
import './components.global.scss';

const { Option } = Select;

const WalletCard = ({ tag, title, amount, selector, rewards }) => {
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="wallet-card">
            <div className="wallet-card-tag">{tag}</div>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-title">{title}</div>
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
              <div className="wallet-card-amount">{amount}</div>
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
