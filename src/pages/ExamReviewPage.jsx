import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import QuestionCard from "../components/QuestionCard";
import StatusPill from "../components/StatusPill";
import examsApi from "../services/examsApi";

function ExamReviewPage() {
  const { examId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadReview() {
      try {
        setLoading(true);
        setError("");
        const response = await examsApi.getExamReview(examId);
        const payload = response?.data;

        if (!ignore) {
          setReview(payload?.data ?? payload ?? null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Không thể tải chi tiết bài thi.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReview();

    return () => {
      ignore = true;
    };
  }, [examId]);

  const reviewQuestions = useMemo(
    () =>
      (review?.questions ?? [])
        .map((question, index) => ({
          ...question,
          id: question.questionId ?? question._id ?? `review-${index + 1}`,
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
        .sort((left, right) => left.number - right.number),
    [review],
  );

  const overview = useMemo(
    () => ({
      total: review?.totalQuestions ?? reviewQuestions.length,
      correct: review?.correctAnswers ?? "—",
      wrong: review?.wrongAnswers ?? "—",
    }),
    [review, reviewQuestions.length],
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary">
        <Spinner animation="border" size="sm" />
        <span>Đang tải chi tiết bài thi...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  return (
    <div className="d-grid gap-4">
      <BreadcrumbHeader
        title={`Chi tiết bài thi lần ${review?.attemptNumber ?? "—"}`}
        description="Hiển thị câu trả lời đã chọn, đáp án đúng và trạng thái của từng câu."
        crumbs={[
          { label: "Trang chủ", to: "/" },
          { label: "Lịch sử", to: "/history" },
          { label: "Review" },
        ]}
      />

      <Row className="g-3">
        <Col xs={12} md={4}>
          <Card className="soft-card border-0 h-100">
            <Card.Body className="p-4">
              <div className="text-secondary small text-uppercase fw-semibold mb-2">
                Tóm tắt
              </div>
              <div className="d-grid gap-2">
                <div>Tổng số câu: {overview.total}</div>
                <div>Số câu đúng: {overview.correct}</div>
                <div className="text-danger fw-semibold">
                  Số câu sai: {overview.wrong}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card className="soft-card border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <Badge bg="success">Đúng</Badge>
                <Badge bg="danger">Sai</Badge>
                <Badge bg="secondary">Chưa trả lời</Badge>
              </div>
              <p className="text-secondary mb-0">
                Mở từng câu để xem câu trả lời đã chọn và đáp án đúng.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Accordion defaultActiveKey="0" alwaysOpen>
        {reviewQuestions.map((question, index) => (
          <Accordion.Item eventKey={String(index)} key={String(question.id)}>
            <Accordion.Header>
              <div className="d-flex flex-wrap align-items-center gap-3 w-100 me-3">
                <span className="fw-semibold">Câu {question.number}</span>
                <StatusPill status={question.status} />
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <QuestionCard
                question={question}
                selectedOptionId={question.selectedOptionId}
                locked
                showAnswerKey
              />
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

export default ExamReviewPage;
