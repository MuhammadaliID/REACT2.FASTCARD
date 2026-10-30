import api from "./axios";
import type { ApiResponse, PagedResponse, Role, UserProfile } from "./types";

export interface UserProfileFilter {
  UserName?: string;
  PageNumber?: number;
  PageSize?: number;
}

export const userProfileApi = {
  getUserProfiles: (params?: UserProfileFilter) =>
    api.get<PagedResponse<UserProfile[]>>("/UserProfile/get-user-profiles", {
      params,
    }),

  getUserProfileById: (id: string) =>
    api.get<ApiResponse<UserProfile>>("/UserProfile/get-user-profile-by-id", {
      params: { id },
    }),

  deleteUser: (id: string) =>
    api.delete<ApiResponse<boolean>>("/UserProfile/delete-user", {
      params: { id },
    }),

  addRoleToUser: (userId: string, roleId: string) =>
    api.post<ApiResponse<boolean>>("/UserProfile/addrole-from-user", null, {
      params: { UserId: userId, RoleId: roleId },
    }),

  removeRoleFromUser: (userId: string, roleId: string) =>
    api.delete<ApiResponse<boolean>>("/UserProfile/remove-role-from-user", {
      params: { UserId: userId, RoleId: roleId },
    }),

  getUserRoles: () =>
    api.get<ApiResponse<Role[]>>("/UserProfile/get-user-roles"),
};
