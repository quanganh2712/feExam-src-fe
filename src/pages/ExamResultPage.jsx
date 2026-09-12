import { useEffect, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import QuestionCard from "../components/QuestionCard";
import ResultSummary from "../components/ResultSummary";
import StatusPill from "../components/StatusPill";
import examsApi from "../services/examsApi";

function ExamResultPage() {
  const { examId } = useParams();
  const location = useLocation();
  const [rawResult, setRawResult] = useState(location.state?.result ?? null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
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

  useEffect(() => {
    let ignore = false;

    examsApi
      .getExamReview(examId)
      .then((response) => {
        const review = response?.data?.data ?? response?.data ?? {};
        const questions = Array.isArray(review.questions)
          ? review.questions
              .map((question, index) => ({
                ...question,
                id:
                  question.questionId ?? question._id ?? `result-${index + 1}`,
                number: Number(question.questionNumber ?? index + 1),
                text: question.question ?? question.text ?? question.content,
                selectedOptionId: question.selectedAnswer,
                correctOptionId: question.correctAnswer,
                status:
                  question.selectedAnswer == null
                    ? "Chưa trả lời"
                    : question.isCorrect
                      ? "Đúng"
                      : "Sai",
              }))
              .sort((left, right) => left.number - right.number)
          : [];

        if (!ignore) setReviewQuestions(questions);
      })
      .catch((err) => {
        if (!ignore) {
          setReviewError(
            err?.response?.data?.message ||
              "Không thể tải câu hỏi và đáp án của bài thi.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setReviewLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [examId]);

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

      <section className="d-grid gap-3">
        <div>
          <h2 className="h4 mb-1">Câu hỏi và đáp án</h2>
          <p className="text-secondary mb-0">
            Đáp án bạn đã chọn và đáp án đúng được đánh dấu trong từng câu.
          </p>
        </div>

        {reviewLoading ? (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <Spinner animation="border" size="sm" />
            <span>Đang tải câu hỏi và đáp án...</span>
          </div>
        ) : null}
        {reviewError ? <Alert variant="warning">{reviewError}</Alert> : null}

        {!reviewLoading && !reviewError ? (
          <Row className="g-3">
            {reviewQuestions.map((question) => (
              <Col xs={12} key={String(question.id)}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-semibold">Câu {question.number}</span>
                  <StatusPill status={question.status} />
                </div>
                <QuestionCard
                  question={question}
                  selectedOptionId={question.selectedOptionId}
                  locked
                  showAnswerKey
                  compact
                />
              </Col>
            ))}
          </Row>
        ) : null}
      </section>
    </div>
  );
}

export default ExamResultPage;
