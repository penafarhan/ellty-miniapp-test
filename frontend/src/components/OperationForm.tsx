import React, { useState } from 'react';
import { Calculation, Operation } from '../types';
import './OperationForm.css';

interface OperationFormProps {
  calculation: Calculation;
  onSubmit: (calculationId: number, operation: Operation, number: number) => Promise<void>;
  onClose: () => void;
}

const OperationForm: React.FC<OperationFormProps> = ({ calculation, onSubmit, onClose }) => {
  const [operation, setOperation] = useState<Operation>('add');
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

    if (operation === 'divide' && numValue === 0) {
      setError('Cannot divide by zero');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(calculation.id, operation, numValue);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add operation');
    } finally {
      setLoading(false);
    }
  };

  const getOperationSymbol = (op: Operation) => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
    }
  };

  const previewResult = () => {
    const numValue = parseFloat(number);
    if (isNaN(numValue)) return null;

    const currentResult = Number(calculation.result);
    let result: number;
    switch (operation) {
      case 'add':
        result = currentResult + numValue;
        break;
      case 'subtract':
        result = currentResult - numValue;
        break;
      case 'multiply':
        result = currentResult * numValue;
        break;
      case 'divide':
        if (numValue === 0) return 'Cannot divide by zero';
        result = currentResult / numValue;
        break;
    }

    return Number.isInteger(result) ? result.toString() : result.toFixed(2);
  };

  return (
    <div className="operation-modal">
      <div className="operation-form-container">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Add Operation</h2>
        
        <div className="current-value">
          Current result: <strong>{calculation.result}</strong>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="operation">Operation</label>
            <select
              id="operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value as Operation)}
              className="operation-select"
            >
              <option value="add">Addition (+)</option>
              <option value="subtract">Subtraction (-)</option>
              <option value="multiply">Multiplication (×)</option>
              <option value="divide">Division (÷)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="number">Number</label>
            <input
              id="number"
              type="number"
              step="any"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter a number"
              required
            />
          </div>
          
          {number && (
            <div className="preview">
              {calculation.result} {getOperationSymbol(operation)} {number} = {previewResult()}
            </div>
          )}
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Adding...' : 'Add Operation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OperationForm;
