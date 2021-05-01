import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './components.global.scss';

const { Option } = Select;

const Charts = ({ testData, tag, amount }) => {
  const data = [
    {
      name: 'Jun 10, 2021',
      transaction: 5000,
    },
    {
      name: 'Jun 11, 2021',
      transaction: 7000,
    },
    {
      name: 'Jun 12, 2021',
      transaction: 9000,
    },
    {
      name: 'Jun 13, 2021',
      transaction: 12000,
    },
    {
      name: 'Jun 14, 2021',
      transaction: 20000,
    },
    {
      name: 'Jun 15, 2021',
      transaction: 32000,
    },
    {
      name: 'Jun 16, 2021',
      transaction: 45000,
    },
  ];
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  const handlePeriodicChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <div className="chart-holder">
      <div className="wallet-card-display-flex">
        <div>
          <div className="wallet-card-tag chart-tag">{tag}</div>
          <div className="wallet-card-amount chart-tag">{amount}</div>
        </div>
        <div>
          <Select
            defaultValue="7days"
            style={{ width: 120, height: 35, marginTop: 30, marginRight: 30 }}
            onChange={handleChange}
            className="chart-selector"
          >
            <Option value="7days">Last 7 days</Option>
            <Option value="month">Last 30 days</Option>
          </Select>
          <Select
            defaultValue="periodic"
            style={{ width: 120, height: 35, marginTop: 30, marginRight: 30 }}
            onChange={handlePeriodicChange}
            className="chart-selector"
          >
            <Option value="periodic">Periodic</Option>
            <Option value="annualized">Annualized</Option>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="60%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="transaction"
            stroke="#5F24FB"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

Charts.propTypes = {
  testData: PropTypes.array,
  tag: PropTypes.string,
  amount: PropTypes.string,
};

export default Charts;
