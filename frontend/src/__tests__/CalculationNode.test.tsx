import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculationNode from '../components/CalculationNode';
import { Calculation } from '../types';

describe('CalculationNode', () => {
  const mockCalculation: Calculation = {
    id: 1,
    user_id: 1,
    parent_id: null,
    operation: null,
    number: 42,
    result: 42,
    created_at: new Date().toISOString(),
    username: 'testuser',
    children: [],
  };

  it('renders starting number correctly', () => {
    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={mockCalculation}
        onAddOperation={onAddOperation}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('Start:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('renders operation correctly', () => {
    const calcWithOp: Calculation = {
      ...mockCalculation,
      operation: 'add',
      number: 5,
      result: 47,
      parent_id: 1,
    };

    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={calcWithOp}
        onAddOperation={onAddOperation}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('shows add operation button when authenticated', () => {
    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={mockCalculation}
        onAddOperation={onAddOperation}
        isAuthenticated={true}
      />
    );

    expect(screen.getByText('Add Operation')).toBeInTheDocument();
  });

  it('hides add operation button when not authenticated', () => {
    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={mockCalculation}
        onAddOperation={onAddOperation}
        isAuthenticated={false}
      />
    );

    expect(screen.queryByText('Add Operation')).not.toBeInTheDocument();
  });

  it('calls onAddOperation when button is clicked', () => {
    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={mockCalculation}
        onAddOperation={onAddOperation}
        isAuthenticated={true}
      />
    );

    const button = screen.getByText('Add Operation');
    fireEvent.click(button);

    expect(onAddOperation).toHaveBeenCalledWith(mockCalculation);
  });

  it('renders children recursively', () => {
    const calcWithChildren: Calculation = {
      ...mockCalculation,
      children: [
        {
          id: 2,
          user_id: 1,
          parent_id: 1,
          operation: 'add',
          number: 5,
          result: 47,
          created_at: new Date().toISOString(),
          username: 'testuser',
          children: [],
        },
      ],
    };

    const onAddOperation = vi.fn();
    render(
      <CalculationNode
        calculation={calcWithChildren}
        onAddOperation={onAddOperation}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('Start:')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });
});
