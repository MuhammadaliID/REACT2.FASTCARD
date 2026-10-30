import api from "./axios";
import type {
  ApiResponse,
  PagedResponse,
  ProductDetail,
  ProductListData,
} from "./types";

export interface ProductFilter {
  UserId?: string;
  ProductName?: string;
  MinPrice?: number;
  MaxPrice?: number;
  BrandId?: number;
  ColorId?: number;
  CategoryId?: number;
  SubcategoryId?: number;
  PageNumber?: number;
  PageSize?: number;
}

export interface AddProductDto {
  Images: File[];
  BrandId: number;
  ColorId: number;
  ProductName: string;
  Description: string;
  Quantity: number;
  Weight?: string;
  Size?: string;
  Code: string;
  Price: number;
  HasDiscount: boolean;
  DiscountPrice?: number;
  SubCategoryId: number;
}

export interface UpdateProductQuery {
  Id: number;
  BrandId: number;
  ColorId: number;
  ProductName: string;
  Description: string;
  Quantity: number;
  Weight?: string;
  Size?: string;
  Code: string;
  Price: number;
  HasDiscount: boolean;
  DiscountPrice?: number;
  SubCategoryId: number;
}

export const productApi = {
  getProducts: (params?: ProductFilter) =>
    api.get<PagedResponse<ProductListData>>("/Product/get-products", {
      params,
    }),

  getProductById: (id: number) =>
    api.get<ApiResponse<ProductDetail>>("/Product/get-product-by-id", {
      params: { id },
    }),

  addProduct: (data: AddProductDto) => {
    const form = new FormData();
    data.Images.forEach((file) => form.append("Images", file));
    form.append("BrandId", String(data.BrandId));
    form.append("ColorId", String(data.ColorId));
    form.append("ProductName", data.ProductName);
    form.append("Description", data.Description);
    form.append("Quantity", String(data.Quantity));
    if (data.Weight) form.append("Weight", data.Weight);
    if (data.Size) form.append("Size", data.Size);
    form.append("Code", data.Code);
    form.append("Price", String(data.Price));
    form.append("HasDiscount", String(data.HasDiscount));
    if (data.DiscountPrice !== undefined)
      form.append("DiscountPrice", String(data.DiscountPrice));
    form.append("SubCategoryId", String(data.SubCategoryId));
    return api.post<ApiResponse<number>>("/Product/add-product", form);
  },

  updateProduct: (params: UpdateProductQuery) =>
    api.put<ApiResponse<number>>("/Product/update-product", null, {
      params: {
        ...params,
        Weight: params.Weight ?? "",
        Size: params.Size ?? "",
        DiscountPrice: params.DiscountPrice ?? 0,
      },
    }),

  addImageToProduct: (productId: number, files: File[]) => {
    const form = new FormData();
    form.append("ProductId", String(productId));
    files.forEach((file) => form.append("Files", file));
    return api.post<ApiResponse<string>>(
      "/Product/add-image-to-product",
      form
    );
  },

  deleteImageFromProduct: (imageId: number) =>
    api.delete<ApiResponse<string>>("/Product/delete-image-from-product", {
      params: { imageId },
    }),

  deleteProduct: (id: number) =>
    api.delete<ApiResponse<boolean>>("/Product/delete-product", {
      params: { id },
    }),
};
