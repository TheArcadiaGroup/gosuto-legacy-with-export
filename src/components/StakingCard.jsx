import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row, Button } from 'antd';
import './components.global.scss';

const StakingCard = ({ tag, validator, amount, amountDollars, withdraw }) => {
  return (
    <div className="site-card-wrapper">
      <Row >
        <Col span={24}>
          <Card bordered={false} className="wallet-card">
            <div className="wallet-card-tag">{tag}</div>
            <div className="wallet-card-display-flex">
              <div className="wallet-card-title">{amount}</div>
              {withdraw && (
                <Button type="primary" className="send-button">
                  Withdraw
                </Button>
              )}
            </div>
            <div className="staking-card-amount-dollars">{amountDollars}</div>
            {validator && (
              <div
                className="wallet-card-display-flex"
                style={{ marginTop: 15 }}
              >
                {validator && (
                  <div className="staking-card-validator">
                    <span style={{ fontWeight: 'bold' }}>Validator:</span>{' '}
                    {validator}
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

StakingCard.propTypes = {
  tag: PropTypes.string,
  validator: PropTypes.string,
  amount: PropTypes.string,
  amountDollars: PropTypes.string,
  withdraw: PropTypes.bool,
};

export default StakingCard;
