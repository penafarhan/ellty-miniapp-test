import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import { Calculation, CreateCalculationRequest, AddOperationRequest, Operation } from '../types';

const router = Router();

// Helper function to build tree structure
const buildTree = (calculations: Calculation[]): Calculation[] => {
  const map = new Map<number, Calculation>();
  const roots: Calculation[] = [];

  // Initialize all nodes
  calculations.forEach(calc => {
    map.set(calc.id, { ...calc, children: [] });
  });

  // Build tree
  calculations.forEach(calc => {
    const node = map.get(calc.id)!;
    if (calc.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(calc.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  return roots;
};

// Calculate result based on operation
const calculateResult = (parentResult: number, operation: Operation, number: number): number => {
  switch (operation) {
    case 'add':
      return parentResult + number;
    case 'subtract':
      return parentResult - number;
    case 'multiply':
      return parentResult * number;
    case 'divide':
      if (number === 0) {
        throw new Error('Division by zero');
      }
      return parentResult / number;
    default:
      throw new Error('Invalid operation');
  }
};

// GET /api/calculations - Get all calculations as tree
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.user_id, 
        c.parent_id, 
        c.operation, 
        c.number, 
        c.result, 
        c.created_at,
        u.username
      FROM calculations c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at ASC
    `);

    const tree = buildTree(result.rows);
    res.json(tree);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/calculations - Create a starting number
router.post(
  '/',
  authMiddleware,
  [body('number').isNumeric()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { number } = req.body as CreateCalculationRequest;
    const userId = req.userId!;

    try {
      const result = await pool.query(
        `INSERT INTO calculations (user_id, parent_id, operation, number, result) 
         VALUES ($1, NULL, NULL, $2, $2) 
         RETURNING id, user_id, parent_id, operation, number, result, created_at`,
        [userId, number]
      );

      const calculation = result.rows[0];
      
      // Get username
      const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
      calculation.username = userResult.rows[0].username;
      calculation.children = [];

      res.status(201).json(calculation);
    } catch (error) {
      console.error('Error creating calculation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/calculations/:id/operation - Add operation to a calculation
router.post(
  '/:id/operation',
  authMiddleware,
  [
    body('operation').isIn(['add', 'subtract', 'multiply', 'divide']),
    body('number').isNumeric(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parentId = parseInt(req.params.id);
    const { operation, number } = req.body as AddOperationRequest;
    const userId = req.userId!;

    try {
      // Get parent calculation
      const parentResult = await pool.query(
        'SELECT result FROM calculations WHERE id = $1',
        [parentId]
      );

      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent calculation not found' });
      }

      const parentResultValue = parseFloat(parentResult.rows[0].result);

      // Calculate new result
      let newResult: number;
      try {
        newResult = calculateResult(parentResultValue, operation, number);
      } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
      }

      // Insert new calculation
      const result = await pool.query(
        `INSERT INTO calculations (user_id, parent_id, operation, number, result) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, user_id, parent_id, operation, number, result, created_at`,
        [userId, parentId, operation, number, newResult]
      );

      const calculation = result.rows[0];
      
      // Get username
      const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
      calculation.username = userResult.rows[0].username;
      calculation.children = [];

      res.status(201).json(calculation);
    } catch (error) {
      console.error('Error adding operation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
