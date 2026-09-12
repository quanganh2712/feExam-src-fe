import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import questionsApi from "../../services/questionsApi";

function getOptionText(option, index) {
  return (
    option?.content ??
    option?.text ??
    option?.label ??
    option?.title ??
    option?.optionText ??
    option?.value ??
    `Phương án ${index + 1}`
  );
}

function getOptionId(option, index) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  return (
    option?.key ??
    option?.optionId ??
    option?.value ??
    letters[index] ??
    String(index)
  );
}

function PracticePage() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");
        const response = await questionsApi.getPracticeQuestions(subjectId);
        const payload = response?.data;
        const nextQuestions = Array.isArray(payload)
          ? payload
          : payload?.data || payload?.items || payload?.questions || [];

        if (!ignore) {
          setQuestions(nextQuestions);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message || "Không thể tải câu hỏi từ backend.",
          );
          setQuestions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      ignore = true;
    };
  }, [subjectId]);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary">
        <Spinner animation="border" size="sm" />
        <span>Đang tải câu hỏi từ backend...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  if (!questions.length) {
    return (
      <EmptyState
        title="Chưa có dữ liệu ôn tập"
        description="Khi Backend sẵn sàng, trang này sẽ tải câu hỏi theo môn học và hiển thị câu hỏi kèm đáp án đúng."
      />
    );
  }

  return (
    <Row className="g-3 g-lg-4">
      <Col xs={12} lg={8}>
        <Card className="soft-card border-0 mb-3">
          <Card.Body className="p-3 p-lg-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <div className="text-secondary small text-uppercase fw-semibold">
                Chế độ ôn tập
              </div>
              <div className="fw-semibold">
                Tổng: {questions.length} câu hỏi
              </div>
            </div>
            <Button variant="outline-dark" onClick={() => navigate("/")}>
              Quay về danh sách môn
            </Button>
          </Card.Body>
        </Card>

        <div className="d-grid gap-3">
          {questions.map((question, qIndex) => {
            const options = Array.isArray(question?.options)
              ? question.options
              : [];
            const correctAnswerKey =
              question?.correctAnswer ??
              question?.correctOptionId ??
              question?.answerId;
            const questionNumber =
              question.sourceQuestionNumber ?? question.number ?? qIndex + 1;
            const questionText =
              question.question ??
              question.text ??
              question.content ??
              "Nội dung câu hỏi sẽ được tải từ Backend.";

            return (
              <Card
                className="soft-card border-0"
                key={question._id ?? question.id ?? qIndex}
              >
                <Card.Body className="p-3 p-lg-4">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <Badge
                      bg="dark"
                      className="px-3 py-2 flex-shrink-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Câu {questionNumber}
                    </Badge>
                    <h2 className="h5 mb-0" style={{ lineHeight: 1.6 }}>
                      {questionText}
                    </h2>
                  </div>

                  <div className="d-grid gap-2">
                    {options.map((option, oIndex) => {
                      const optionId = getOptionId(option, oIndex);
                      const isCorrect =
                        correctAnswerKey != null &&
                        String(correctAnswerKey).trim().toUpperCase() ===
                          String(optionId).trim().toUpperCase();

                      return (
                        <div
                          key={optionId}
                          className={`question-option ${isCorrect ? "is-correct" : ""}`}
                          style={{ cursor: "default" }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="fw-semibold flex-shrink-0"
                              style={{ minWidth: 24 }}
                            >
                              {optionId}.
                            </span>
                            <span>{getOptionText(option, oIndex)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!options.length && (
                    <div className="rounded-3 border border-dashed bg-light p-3 text-secondary">
                      Backend sẽ trả về danh sách options cho câu này.
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </Col>

      <Col xs={12} lg={4}>
        <div className="position-sticky" style={{ top: "1rem" }}>
          <Card className="soft-card border-0">
            <Card.Body className="p-3 p-lg-4">
              <div className="text-secondary small text-uppercase fw-semibold mb-2">
                Tổng kết
              </div>
              <div className="d-grid gap-2">
                <div>Tổng số câu: {questions.length}</div>
                <div>Trạng thái: Xem đáp án ôn tập</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
}

export default PracticePage;
