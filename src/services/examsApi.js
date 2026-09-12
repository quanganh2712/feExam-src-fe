import apiClient from "./apiClient";

export const examsApi = {
  startPractice(subjectId) {
    return apiClient.post(`/subjects/${subjectId}/practice/start`);
  },

  startExam(subjectId) {
    return apiClient.post("/exams/generate", {
      subjectId,
      numberOfQuestions: 60,
    });
  },

  submitExam(examId, payload) {
    return apiClient.post(`/exams/${examId}/submit`, payload);
  },

  getExamResult(examId) {
    return apiClient.get(`/exams/${examId}/result`);
  },

  getExamReview(examId) {
    return apiClient.get(`/exams/${examId}/review`);
  },

  getWrongAnswers(subjectId) {
    return apiClient.get("/wrong-answers", {
      params: subjectId ? { subjectId } : {},
    });
  },

  removeWrongAnswer(questionId) {
    return apiClient.delete(`/wrong-answers/${questionId}`);
  },
};

export default examsApi;
