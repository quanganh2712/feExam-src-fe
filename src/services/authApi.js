import apiClient from "./apiClient";

export const authApi = {
  register(payload) {
    return apiClient.post("/auth/register", payload);
  },

  login(payload) {
    return apiClient.post("/auth/login", payload);
  },

  loginWithGoogle(idToken) {
    return apiClient.post("/auth/google", { idToken });
  },
};

export default authApi;
