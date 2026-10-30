import api from "./axios";
import type { ApiResponse, Color, PagedResponse } from "./types";

export interface ColorFilter {
  ColorName?: string;
  PageNumber?: number;
  PageSize?: number;
}

export const colorApi = {
  getColors: (params?: ColorFilter) =>
    api.get<PagedResponse<Color[]>>("/Color/get-colors", { params }),

  getColorById: (id: number) =>
    api.get<ApiResponse<Color>>("/Color/get-color-by-id", { params: { id } }),

  addColor: (colorName: string) =>
    api.post<ApiResponse<number>>("/Color/add-color", null, {
      params: { ColorName: colorName },
    }),

  updateColor: (id: number, colorName: string) =>
    api.put<ApiResponse<boolean>>("/Color/update-color", null, {
      params: { Id: id, ColorName: colorName },
    }),

  deleteColor: (id: number) =>
    api.delete<ApiResponse<boolean>>("/Color/delete-color", {
      params: { id },
    }),
};
