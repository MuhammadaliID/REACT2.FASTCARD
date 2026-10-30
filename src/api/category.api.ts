import api from "./axios";
import type { ApiResponse, Category } from "./types";

export const categoryApi = {
  getCategories: () =>
    api.get<ApiResponse<Category[]>>("/Category/get-categories"),

  getCategoryById: (id: number) =>
    api.get<ApiResponse<Category>>("/Category/get-category-by-id", {
      params: { id },
    }),

  addCategory: (data: { CategoryName: string; CategoryImage: File }) => {
    const form = new FormData();
    form.append("CategoryName", data.CategoryName);
    form.append("CategoryImage", data.CategoryImage);
    return api.post<ApiResponse<number>>("/Category/add-category", form);
  },

  updateCategory: (data: {
    Id: number;
    CategoryName: string;
    CategoryImage: File;
  }) => {
    const form = new FormData();
    form.append("Id", String(data.Id));
    form.append("CategoryName", data.CategoryName);
    form.append("CategoryImage", data.CategoryImage);
    return api.put<ApiResponse<boolean>>("/Category/update-category", form);
  },

  deleteCategory: (id: number) =>
    api.delete<ApiResponse<boolean>>("/Category/delete-category", {
      params: { id },
    }),
};
