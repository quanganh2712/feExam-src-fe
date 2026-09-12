import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import SubjectLayout from "../layouts/SubjectLayout";
import HomePage from "../pages/HomePage";
import SubjectOverviewPage from "../pages/subject/SubjectOverviewPage";
import PracticePage from "../pages/subject/PracticePage";
import ExamPage from "../pages/subject/ExamPage";
import WrongAnswersPage from "../pages/subject/WrongAnswersPage";
import HistoryPage from "../pages/HistoryPage";
import ExamResultPage from "../pages/ExamResultPage";
import ExamReviewPage from "../pages/ExamReviewPage";
import AuthPage from "../pages/AuthPage";

function RequireAuth({ children }) {
  return localStorage.getItem("authToken") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/subjects/:subjectId" element={<SubjectLayout />}>
                  <Route index element={<SubjectOverviewPage />} />
                  <Route path="practice" element={<PracticePage />} />
                  <Route path="exam" element={<ExamPage />} />
                  <Route path="wrong-answers" element={<WrongAnswersPage />} />
                </Route>
                <Route path="/history" element={<HistoryPage />} />
                <Route
                  path="/exams/:examId/result"
                  element={<ExamResultPage />}
                />
                <Route
                  path="/exams/:examId/review"
                  element={<ExamReviewPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
