import React from 'react';
import { Form } from 'react-bootstrap';

function NewsLetterForm({ isSubscribed, setIsSubscribed }) {
  const handleCheckboxChange = (event) => {
    setIsSubscribed(event.target.checked);
  };

  return (
    <Form>
      <Form.Group controlId="formBasicCheckbox">
        <Form.Check
          type="checkbox"
          label="I wish to subscribe to the newsletter to receive tips and news once a week. I know I can unsubscribe at any time."
          checked={isSubscribed}
          onChange={handleCheckboxChange}
        />
      </Form.Group>
    </Form>
  );
}

export default NewsLetterForm;
