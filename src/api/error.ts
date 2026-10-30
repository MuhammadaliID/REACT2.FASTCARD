interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { errors?: string[]; message?: string };
  };
}

export const apiError = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  if (e?.response?.status === 401) {
    return "Session expired. Please sign in again.";
  }
  if (e?.response?.status === 403) {
    return "Access denied: this action requires the Admin role (verified by the backend).";
  }
  const errors = e?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) return errors.join(", ");
  const message = e?.response?.data?.message;
  if (message) return message;
  return fallback;
};
