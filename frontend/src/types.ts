export interface User {
  id: number;
  username: string;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  operation: Operation | null;
  number: number;
  result: number;
  created_at: string;
  username?: string;
  children?: Calculation[];
}

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateCalculationRequest {
  number: number;
}

export interface AddOperationRequest {
  operation: Operation;
  number: number;
}
