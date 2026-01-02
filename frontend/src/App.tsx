import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCalculations, createCalculation, addOperation } from './api';
import { Calculation, Operation } from './types';
import AuthForm from './components/AuthForm';
import StartNumberForm from './components/StartNumberForm';
import OperationForm from './components/OperationForm';
import CalculationNode from './components/CalculationNode';
import './App.css';

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const data = await getCalculations();
      setCalculations(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load calculations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalculations();
  }, []);

  const handleCreateCalculation = async (number: number) => {
    const newCalc = await createCalculation({ number });
    setCalculations([...calculations, newCalc]);
  };

  const handleAddOperation = async (calculationId: number, operation: Operation, number: number) => {
    await addOperation(calculationId, { operation, number });
    await loadCalculations();
  };

  const openOperationForm = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
    setShowOperationForm(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔢 Calculation Tree</h1>
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="username">Welcome, {user?.username}</span>
              <button onClick={() => setShowStartForm(true)} className="btn btn-primary">
                Start New Calculation
              </button>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuthForm(true)} className="btn btn-primary">
              Login / Register
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading calculations...</div>
        ) : calculations.length === 0 ? (
          <div className="empty-state">
            <h2>No calculations yet</h2>
            <p>
              {isAuthenticated
                ? 'Be the first to start a calculation!'
                : 'Login to start a new calculation chain'}
            </p>
            {isAuthenticated && (
              <button onClick={() => setShowStartForm(true)} className="btn btn-primary">
                Start New Calculation
              </button>
            )}
          </div>
        ) : (
          <div className="calculations-tree">
            {calculations.map((calc) => (
              <CalculationNode
                key={calc.id}
                calculation={calc}
                onAddOperation={openOperationForm}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>

      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
      
      {showStartForm && (
        <StartNumberForm
          onSubmit={handleCreateCalculation}
          onClose={() => setShowStartForm(false)}
        />
      )}
      
      {showOperationForm && selectedCalculation && (
        <OperationForm
          calculation={selectedCalculation}
          onSubmit={handleAddOperation}
          onClose={() => {
            setShowOperationForm(false);
            setSelectedCalculation(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
