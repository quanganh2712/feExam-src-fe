import { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import ResultSummary from "../components/ResultSummary";
import examsApi from "../services/examsApi";

function ExamResultPage() {
  const { examId } = useParams();
  const location = useLocation();
  const [rawResult, setRawResult] = useState(location.state?.result ?? null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.result) return undefined;

    let ignore = false;
    examsApi
      .getExamResult(examId)
      .then((response) => {
        if (!ignore) {
          setRawResult(response?.data?.data ?? response?.data ?? {});
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err?.response?.data?.message || "Không thể tải kết quả bài thi.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [examId, location.state]);

  const resultData = rawResult ?? {};
  const result = {
    ...resultData,
    score: resultData.score ?? "—",
    totalQuestions: resultData.totalQuestions ?? 50,
    correctCount: resultData.correctCount ?? resultData.correctAnswers ?? "—",
    wrongCount: resultData.wrongCount ?? resultData.wrongAnswers ?? "—",
    duration: resultData.duration ?? "—",
  };

  return (
    <div className="d-grid gap-4">
      <BreadcrumbHeader
        title={`Kết quả bài thi lần ${result.attemptNumber ?? "—"}`}
        description="Trang này hiển thị kết quả sau khi Backend chấm điểm và trả về dữ liệu."
        crumbs={[
          { label: "Trang chủ", to: "/" },
          { label: "Lịch sử", to: "/history" },
          { label: "Kết quả" },
        ]}
        actions={[
          {
            label: "Xem chi tiết",
            to: `/exams/${examId}/review`,
            variant: "warning",
          },
        ]}
      />
      {loading ? <Spinner animation="border" size="sm" /> : null}
      {error ? <Alert variant="warning">{error}</Alert> : null}
      <ResultSummary result={result} />
    </div>
  );
}

export default ExamResultPage;
