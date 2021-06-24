import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
import './components.global.scss';
import WalletContext from '../contexts/WalletContext';

const HistoryCard = ({
  date,
  fee,
  id,
  method,
  amount,
  amountDollars,
  lost,
  note,
  to,
  from
}) => {
  const [selectedWallet, setSelectedWallet] = useContext(WalletContext);
  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={24}>
          <Card bordered={false} className="wallet-card">
            <div className="wallet-card-display-flex">
              <div className="history-card-date">{date}</div>
              <div className="history-card-id">{id}</div>
            </div>
            <div className="wallet-card-display-flex">
              <div
                className={
                  lost ? 'history-card-amount-lose' : 'history-card-amount'
                }
              >
                {lost ? '-' : '+'} {amount} {method == 'Sent' || method =='Staking' ? `to ${to}` : `from ${from}`}
              </div>
              {note && <div className="history-card-note">Note: {note}</div>}
            </div>
            <div
              className={
                lost
                  ? 'history-card-amount-dollars-lose'
                  : 'history-card-amount-dollars'
              }
            >
              {amountDollars}
            </div>
            <div className="wallet-card-display-flex" style={{ marginTop: 15 }}>
              {/* <div className="history-card-fee">
                <span style={{ fontWeight: 'bold' }}>Transaction fee:</span>{' '}
                {fee}
              </div> */}
              <div
                className={
                  lost ? 'history-card-method-lose' : 'history-card-method'
                }
              >
                {method}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

HistoryCard.propTypes = {
  date: PropTypes.string,
  fee: PropTypes.string,
  id: PropTypes.string,
  method: PropTypes.string,
  amount: PropTypes.string,
  amountDollars: PropTypes.string,
  note: PropTypes.string,
  lost: PropTypes.bool,
};

export default HistoryCard;
