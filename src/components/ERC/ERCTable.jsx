/* eslint-disable react/display-name */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Table, Avatar, Image, Switch } from 'antd';
import '../components.global.scss';

const ERCTable = (props) => {
  const { data, filtredData } = props;
  const columns = [
    {
      title: '',
      dataIndex: 'photo',
      key: 'photo',
      responsive: ['sm'],
      width: 100,
      render: (text, record, index) => (
        <Avatar size="small" src={<Image src={record.image} />} />
      ),
    },
    {
      title: 'name',
      dataIndex: 'name',
      responsive: ['sm'],
      key: 'name',
      width: 150,
    },
    {
      title: 'ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      responsive: ['md'],
      width: 150,
    },
    {
      title: 'amount',
      dataIndex: 'amount',
      key: 'amount',
      responsive: ['md'],
      width: 150,
    },
    {
      title: 'amount %',
      dataIndex: 'amount',
      key: 'amount',
      responsive: ['md'],
      width: 150,
    },
    {
      title: 'is Limited Supply',
      dataIndex: 'isLimitedSupply',
      key: 'isLimitedSupply',
      responsive: ['sm'],
      width: 100,
      render: (text, record, index) => (
        <Switch checked={record.isLimitedSupply} size="small" />
      ),
    },
  ];
  useEffect(() => {}, [props]);
  return (
    <div>
      <Table
        columns={columns}
        rowKey="id"
        size="middle"
        showHeader={false}
        dataSource={filtredData || data}
        pagination={{ position: ['bottomRight', 'bottomRight'] }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ERCTable;
