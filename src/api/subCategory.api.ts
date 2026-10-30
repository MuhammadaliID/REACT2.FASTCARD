import api from "./axios";
import type { ApiResponse, SubCategory } from "./types";

export const subCategoryApi = {
  getSubCategories: () =>
    api.get<ApiResponse<SubCategory[]>>("/SubCategory/get-sub-category"),

  getSubCategoryById: (id: number) =>
    api.get<ApiResponse<SubCategory>>("/SubCategory/get-sub-category-by-id", {
      params: { id },
    }),

  addSubCategory: (categoryId: number, subCategoryName: string) =>
    api.post<ApiResponse<number>>("/SubCategory/add-sub-category", null, {
      params: { CategoryId: categoryId, SubCategoryName: subCategoryName },
    }),

  updateSubCategory: (
    id: number,
    categoryId: number,
    subCategoryName: string
  ) =>
    api.put<ApiResponse<boolean>>(
      "/SubCategory/update-sub-category",
      null,
      {
        params: { Id: id, CategoryId: categoryId, SubCategoryName: subCategoryName },
      }
    ),

  deleteSubCategory: (id: number) =>
    api.delete<ApiResponse<boolean>>("/SubCategory/delete-sub-category", {
      params: { id },
    }),
};
