/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import { Typography, Row, Input, Col, Spin, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { remote } from 'electron';
import Datastore from 'nedb-promises';
import ERCTable from '../components/ERC/ERCTable';
import CreateToken from '../components/ERC/CreateToken';
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
      const ercDb = Datastore.create({
        filename: `${remote.app.getPath('userData')}/ERC.db`,
        timestampData: true,
      });
      const tokensDb = await ercDb.find({});
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
      <CreateToken
        visible={isModalShowen}
        changeVisibility={() => {
          setIsModelShowen(false);
        }}
        onAdd={(record) => {
          tokens.push(record);
          setTokens(tokens);
        }}
      />
      <Row gutter={12} justify="space-between" align="middle">
        <Col span={4}>
          <Title level={5}>Manage Tokens</Title>
        </Col>
        <Col span={4}>
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
        <Col span={4}>
          <Input
            placeholder="input search text"
            onChange={(e) => {
              search(e.target.value);
            }}
            suffix={suffix}
            style={{
              background: '#818CFC !important',
              borderRadius: 30,
              width: 200,
            }}
          />
        </Col>
      </Row>
      <ERCTable
        data={tokens}
        filtredData={filtredTokens}
        setContextData={setTokens}
      />
    </>
  );
};

export default ERCView;
