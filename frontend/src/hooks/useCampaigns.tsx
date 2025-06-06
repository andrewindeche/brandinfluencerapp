import { useState } from 'react';

const useCampaigns = () => {
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});

  const handleToggleExpand = (title: string) => {
    setExpandedCards((prevState) => ({
      ...prevState,
      [title]: !prevState[title],
    }));
  };

  return { expandedCards, handleToggleExpand };
};

export default useCampaigns;
