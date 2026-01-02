import React, { useState } from 'react';
import './StartNumberForm.css';

interface StartNumberFormProps {
  onSubmit: (number: number) => Promise<void>;
  onClose: () => void;
}

const StartNumberForm: React.FC<StartNumberFormProps> = ({ onSubmit, onClose }) => {
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const numValue = parseFloat(number);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(numValue);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create calculation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="start-number-modal">
      <div className="start-number-form-container">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Start New Calculation</h2>
        
        <p className="description">
          Enter a starting number to begin a new calculation chain.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="number">Starting Number</label>
            <input
              id="number"
              type="number"
              step="any"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter a number"
              required
              autoFocus
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartNumberForm;
