import api from "./axios";
import type { ApiResponse, Brand, PagedResponse } from "./types";

export interface BrandFilter {
  BrandName?: string;
  BrandId?: number;
  PageNumber?: number;
  PageSize?: number;
}

export const brandApi = {
  getBrands: (params?: BrandFilter) =>
    api.get<PagedResponse<Brand[]>>("/Brand/get-brands", { params }),

  getBrandById: (id: number) =>
    api.get<ApiResponse<Brand>>("/Brand/get-brand-by-id", { params: { id } }),

  addBrand: (brandName: string) =>
    api.post<ApiResponse<number>>("/Brand/add-brand", null, {
      params: { BrandName: brandName },
    }),

  updateBrand: (id: number, brandName: string) =>
    api.put<ApiResponse<boolean>>("/Brand/update-brand", null, {
      params: { Id: id, BrandName: brandName },
    }),

  deleteBrand: (id: number) =>
    api.delete<ApiResponse<boolean>>("/Brand/delete-brand", {
      params: { id },
    }),
};
