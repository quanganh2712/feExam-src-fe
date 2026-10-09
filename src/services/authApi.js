import apiClient from "./apiClient";

export const authApi = {
  register(payload) {
    return apiClient.post("/auth/register", payload);
  },

  login(payload) {
    return apiClient.post("/auth/login", payload);
  },

  setPassword(password) {
    return apiClient.post("/auth/set-password", { password });
  },

  requestPasswordReset(email) {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword(payload) {
    return apiClient.post("/auth/reset-password", payload);
  },

  loginWithGoogle(idToken) {
    return apiClient.post("/auth/google", { idToken });
  },
};

export default authApi;
