import React, { useState } from 'react';
import { Tag } from 'antd';
import HistoryCard from '../components/HistoryCard';
// styles
import './../App.global.scss';

// fake data
import fakeCards from '../HistoryCards.js';

const HistoryView = () => {
  const filters = ['All', 'Sent', 'Received', 'Staking', 'Swap'];
  const [selectedTag, setSelectedTag] = useState('All');
  const [cardsToDisplay, setCardsToDisplay] = useState(fakeCards);
  const handleTagClick = (filter) => {
    setSelectedTag(filter);
    setCardsToDisplay(
      filter === 'All'
        ? fakeCards
        : fakeCards.filter((card) => card.method === filter)
    );
  };
  return (
    <>
      {filters.map((filter, index) => (
        <Tag
          key={index}
          className={filter === selectedTag ? 'selected-tag' : 'unselected-tag'}
          color="processing"
          onClick={() => handleTagClick(filter)}
        >
          <div className="filter-name">{filter}</div>
        </Tag>
      ))}
      {cardsToDisplay.map((card, index) => (
        <HistoryCard
          key={index}
          date={card.date}
          fee={card.fee}
          id={card.id}
          amount={card.amount}
          amountDollars={card.amountDollars}
          method={card.method}
          lost={card.lost === 'true'}
        />
      ))}
    </>
  );
};

export default HistoryView;
