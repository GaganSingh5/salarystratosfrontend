import React, { useEffect, useRef, useState } from 'react';
import './Multiselect.css'; // You can create a CSS file for styling
import { Form } from 'react-bootstrap';

const Multiselect = ({setCrawlInput}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const inputRef = useRef();

  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue !== '') {
        setSelectedItems([...selectedItems, trimmedValue]);
        setInputValue('');
        setCrawlInput([...selectedItems, trimmedValue]);
      }
    }
  };

  const removeChip = (item) => {
    const updatedItems = selectedItems.filter((selectedItem) => selectedItem !== item);
    setSelectedItems(updatedItems);
    setCrawlInput(updatedItems);
  };

  return (
    <div className="multiselect">
      <Form.Label htmlFor="searchTerms">Search Terms</Form.Label>
      <Form.Control
        ref={inputRef}
        type="text"
        id="searchTerms"
        onKeyUp={handleKeyDown}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <div className="chip-container">
        {selectedItems.map((item, index) => (
          <div
            key={index}
            className="chip primary"
            onClick={() => removeChip(item)}
          >
            {item}
            <span className="chip-close">×</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Multiselect;