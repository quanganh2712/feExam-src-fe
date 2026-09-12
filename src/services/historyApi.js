import apiClient from "./apiClient";

export const historyApi = {
  getHistory() {
    return apiClient.get("/exams/history");
  },
};

export default historyApi;
