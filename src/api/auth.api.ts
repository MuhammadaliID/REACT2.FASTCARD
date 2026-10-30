import api from "./axios";
import type { ApiResponse } from "./types";

export interface RegisterDto {
  UserName: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  PhoneNumber: string;
}

export interface LoginDto {
  UserName: string;
  Password: string;
}

export const authApi = {
  register: (body: RegisterDto) =>
    api.post<ApiResponse<string>>("/Account/register", body),

  login: (body: LoginDto) =>
    api.post<ApiResponse<string>>("/Account/login", body),
};
