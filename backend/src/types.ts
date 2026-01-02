export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  operation: Operation | null;
  number: number;
  result: number;
  created_at: Date;
  username?: string;
  children?: Calculation[];
}

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface CreateCalculationRequest {
  number: number;
}

export interface AddOperationRequest {
  operation: Operation;
  number: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}
