/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import { Typography, Row, Input, Col, Spin, Tag, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { remote } from 'electron';
import mongoose from 'mongoose';
import Datastore from 'nedb-promises';
import ERCTable from '../components/ERC/ERCTable';
import CreateToken from '../components/ERC/CreateToken';
import { getERCTokensModel } from '../services/mongoDb';
// styles
import '../App.global.scss';

const ERCView = () => {
  const [isModalShowen, setIsModelShowen] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [filtredTokens, setFiltredTokens] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  const { Title } = Typography;
  const suffix = (
    <SearchOutlined
      style={{
        fontSize: 16,
        color: '#000852',
      }}
    />
  );
  const search = (e) => {
    if (e.length === 0) {
      setFiltredTokens(null);
    } else {
      const ft = tokens.filter((record) => {
        return record.name === e;
      });
      setFiltredTokens(ft);
    }
  };
  useEffect(() => {
    async function loadTokens() {
      setPageLoading(true);
      if (mongoose.connection.readyState !== 1) {
        await getERCTokensModel();
      }
      const ERCTOKEN = mongoose.model('ERCTokens');
      const tokensDb = await ERCTOKEN.find({}).lean().exec();

      setTokens(tokensDb);
      setPageLoading(false);
    }
    loadTokens();
  }, []);
  return (
    <>
      {pageLoading && (
        <>
          <Spin
            style={{
              margin: 'auto',
              display: 'block',
              marginBottom: '20px',
            }}
          />
        </>
      )}
      <Card bordered={false} className="wallet-card">
        <CreateToken
          visible={isModalShowen}
          changeVisibility={() => {
            setIsModelShowen(false);
          }}
          onAdd={(record) => {
            const newList = tokens.concat(record);
            // tokens.push(record);
            setTokens(newList);
          }}
        />
        <Row gutter={12} justify="space-between" align="middle">
          <Col span={4}>
            <Title level={5} style={{ color: '#000852' }}>
              Manage Tokens
            </Title>
          </Col>
          <Col span={2}>
            <Tag
              className="selected-tag"
              color="processing"
              onClick={() => {
                setIsModelShowen(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="filter-name">{`  Create a Token  `}</div>
            </Tag>
          </Col>
          <Col span={12}>
            <Input
              placeholder="Search"
              onChange={(e) => {
                search(e.target.value);
              }}
              suffix={suffix}
              className="searchInput"
              style={{
                background: '#818CFC !important',
                borderRadius: 30,
                width: '100%',
                backgroundColor: '#d9ddff',
              }}
            />
          </Col>
        </Row>
        <ERCTable
          data={tokens}
          filtredData={filtredTokens}
          setContextData={setTokens}
        />
      </Card>
    </>
  );
};

export default ERCView;
