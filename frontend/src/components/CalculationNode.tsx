import React from 'react';
import { Calculation } from '../types';
import './CalculationNode.css';

interface CalculationNodeProps {
  calculation: Calculation;
  onAddOperation: (calc: Calculation) => void;
  isAuthenticated: boolean;
}

const CalculationNode: React.FC<CalculationNodeProps> = ({
  calculation,
  onAddOperation,
  isAuthenticated,
}) => {
  const getOperationSymbol = (operation: string | null) => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  };

  const formatNumber = (num: any) => {
    const n = Number(num);
    if (isNaN(n)) return '0';
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  };

  return (
    <div className="calculation-node">
      <div className="calculation-content">
        {calculation.operation ? (
          <div className="calculation-operation">
            <span className="operation-symbol">{getOperationSymbol(calculation.operation)}</span>
            <span className="operation-number">{formatNumber(calculation.number)}</span>
          </div>
        ) : (
          <div className="calculation-start">
            <span className="start-label">Start:</span>
            <span className="start-number">{formatNumber(calculation.number)}</span>
          </div>
        )}
        
        <div className="calculation-result">
          = <strong>{formatNumber(calculation.result)}</strong>
        </div>
        
        <div className="calculation-meta">
          <span className="username">@{calculation.username || 'anonymous'}</span>
          <span className="timestamp">
            {new Date(calculation.created_at).toLocaleString()}
          </span>
        </div>
        
        {isAuthenticated && (
          <button
            className="add-operation-btn"
            onClick={() => onAddOperation(calculation)}
          >
            Add Operation
          </button>
        )}
      </div>
      
      {calculation.children && calculation.children.length > 0 && (
        <div className="calculation-children">
          {calculation.children.map((child) => (
            <CalculationNode
              key={child.id}
              calculation={child}
              onAddOperation={onAddOperation}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalculationNode;
