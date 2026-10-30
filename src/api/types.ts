export interface ApiResponse<T> {
  data: T;
  errors: string[];
  statusCode: number;
}

export interface PagedResponse<T> extends ApiResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalRecord: number;
}

export interface Brand {
  id: number;
  brandName: string;
}

export interface Color {
  id: number;
  colorName: string;
}

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId?: number;
}

export interface Category {
  id: number;
  categoryName: string;
  categoryImage: string;
  subCategories: SubCategory[];
}

export interface ProductImage {
  id: number;
  images: string;
}

export interface ProductListItem {
  id: number;
  productName: string;
  image: string;
  color: string;
  price: number;
  hasDiscount: boolean;
  discountPrice: number;
  quantity: number;
  productInMyCart: boolean;
  categoryId: number;
  categoryName: string;
  productInfoFromCart: { id: number; quantity: number } | null;
}

export interface ProductListData {
  products: ProductListItem[];
  colors: Color[];
  brands: Brand[];
  minMaxPrice: { minPrice: number; maxPrice: number };
}

export interface ProductDetail {
  id: number;
  productName: string;
  description: string;
  brand: string;
  color: string;
  images: ProductImage[];
  productInMyCart: boolean;
  productInfoFromCart: { id: number; quantity: number } | null;
  quantity: number;
  weight: string;
  size: string;
  code: string;
  price: number;
  hasDiscount: boolean;
  discountPrice: number;
  subCategoryId: number;
}

export interface UserProfile {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  image: string;
  userRoles: { id: string; name: string }[];
}

export interface Role {
  id: string;
  name: string;
}
