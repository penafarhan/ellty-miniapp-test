import axios from "axios";
import { AuthResponse, Calculation, CreateCalculationRequest, AddOperationRequest } from "./types";

// Get API URL from runtime config (injected by Docker) or environment variable or default
const API_URL = (window as any).ENV?.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
	baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Auth
export const register = async (username: string, password: string): Promise<AuthResponse> => {
	const response = await api.post("/auth/register", { username, password });
	return response.data;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
	const response = await api.post("/auth/login", { username, password });
	return response.data;
};

// Calculations
export const getCalculations = async (): Promise<Calculation[]> => {
	const response = await api.get("/calculations");
	return response.data;
};

export const createCalculation = async (data: CreateCalculationRequest): Promise<Calculation> => {
	const response = await api.post("/calculations", data);
	return response.data;
};

export const addOperation = async (
	calculationId: number,
	data: AddOperationRequest
): Promise<Calculation> => {
	const response = await api.post(`/calculations/${calculationId}/operation`, data);
	return response.data;
};

export default api;
