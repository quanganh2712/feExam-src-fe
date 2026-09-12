import apiClient from "./apiClient";

export const subjectsApi = {
  getSubjects() {
    return apiClient.get("/subjects");
  },

  getSubjectById(subjectId) {
    return apiClient.get(`/subjects/${subjectId}`);
  },
};

export default subjectsApi;
