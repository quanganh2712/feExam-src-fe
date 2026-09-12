import apiClient from "./apiClient";

export const questionsApi = {
  getQuestions(subjectId) {
    return apiClient.get("/questions", {
      params: subjectId ? { subjectId } : {},
    });
  },

  getPracticeQuestions(subjectId) {
    return apiClient.get("/questions/practice", {
      params: subjectId ? { subjectId } : {},
    });
  },
};

export default questionsApi;
