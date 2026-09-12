import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import QuestionCard from "../../components/QuestionCard";
import examsApi from "../../services/examsApi";
import subjectsApi from "../../services/subjectsApi";

function WrongAnswersPage() {
  const { subjectId } = useParams();
  const [subjectName, setSubjectName] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [answers, setAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [checkingQuestionId, setCheckingQuestionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSubject() {
      if (!subjectId) return;

      try {
        const response = await subjectsApi.getSubjectById(subjectId);
        const payload = response?.data;
        const subject = payload?.data ?? payload?.subject ?? payload;
        const name =
          subject?.name ??
          subject?.title ??
          subject?.subjectName ??
          subject?.displayName;

        if (!ignore && name) {
          setSubjectName(name);
        }
      } catch {
        return;
      }
    }

    loadSubject();

    return () => {
      ignore = true;
    };
  }, [subjectId]);

  useEffect(() => {
    let ignore = false;

    async function loadWrongAnswers() {
      try {
        setLoading(true);
        setError("");
        const response = await examsApi.getWrongAnswers(subjectId);
        const payload = response?.data;
        const items = Array.isArray(payload)
          ? payload
          : (payload?.data ?? payload?.items ?? []);
        const uniqueQuestions = Array.from(
          new Map(
            items.map((item) => [String(item.questionId), item]),
          ).values(),
        );

        if (!ignore) {
          setWrongAnswers(uniqueQuestions);
          setAnswers({});
          setCheckedAnswers({});
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message || "Không thể tải các câu đã làm sai.",
          );
          setWrongAnswers([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadWrongAnswers();

    return () => {
      ignore = true;
    };
  }, [subjectId]);

  const displaySubjectName =
    subjectName || (subjectId ? decodeURIComponent(subjectId) : "đang chọn");

  const handleCheck = async (question) => {
    const questionKey = String(question.questionId);
    const selectedAnswer = String(answers[questionKey] ?? "").trim();
    const correctAnswer = String(question.correctAnswer ?? "").trim();

    setCheckedAnswers((previous) => ({
      ...previous,
      [questionKey]: true,
    }));

    if (selectedAnswer !== correctAnswer) return;

    try {
      setCheckingQuestionId(questionKey);
      await examsApi.removeWrongAnswer(questionKey);
      setWrongAnswers((previous) =>
        previous.filter((item) => String(item.questionId) !== questionKey),
      );
      setAnswers((previous) => {
        const next = { ...previous };
        delete next[questionKey];
        return next;
      });
      setCheckedAnswers((previous) => {
        const next = { ...previous };
        delete next[questionKey];
        return next;
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Không thể xóa câu hỏi đã trả lời đúng.",
      );
    } finally {
      setCheckingQuestionId(null);
    }
  };

  return (
    <Row className="g-3 g-lg-4">
      <Col xs={12} lg={8}>
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <Spinner animation="border" size="sm" />
            <span>Đang tải các câu đã làm sai...</span>
          </div>
        ) : null}
        {error ? <Alert variant="warning">{error}</Alert> : null}
        {!loading && !error && !wrongAnswers.length ? (
          <EmptyState
            title="Chưa có câu sai để luyện lại"
            description="Các câu bạn đã trả lời sai trong phần thi thử sẽ xuất hiện ở đây."
          />
        ) : null}
        {!loading && !error && wrongAnswers.length ? (
          <div className="d-grid gap-3">
            {wrongAnswers.map((question) => {
              const questionKey = String(question.questionId);
              const isChecked = checkedAnswers[questionKey];

              return (
                <div className="soft-card border-0" key={questionKey}>
                  <div className="p-3 p-lg-4">
                    <QuestionCard
                      question={{
                        ...question,
                        id: questionKey,
                        text: question.question,
                        selectedOptionId: answers[questionKey],
                        correctOptionId: question.correctAnswer,
                      }}
                      selectedOptionId={answers[questionKey]}
                      onSelectOption={(optionId) =>
                        setAnswers((previous) => ({
                          ...previous,
                          [questionKey]: optionId,
                        }))
                      }
                      showAnswerKey={isChecked}
                      showQuestionNumber={false}
                    />
                    <div className="d-flex align-items-center gap-2 mt-3">
                      <Button
                        variant="warning"
                        onClick={() => handleCheck(question)}
                        disabled={
                          !answers[questionKey] ||
                          checkingQuestionId === questionKey
                        }
                      >
                        {checkingQuestionId === questionKey
                          ? "Đang cập nhật..."
                          : "Kiểm tra đáp án"}
                      </Button>
                      {isChecked ? (
                        <span
                          className={
                            answers[questionKey] === question.correctAnswer
                              ? "text-success fw-semibold"
                              : "text-danger fw-semibold"
                          }
                        >
                          {answers[questionKey] === question.correctAnswer
                            ? "Đúng"
                            : "Chưa đúng"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Col>

      <Col xs={12} lg={4}>
        <Card className="soft-card border-0">
          <Card.Body className="p-4">
            <div className="fw-semibold mb-2">Luyện lại theo môn</div>
            <p className="text-secondary mb-3">
              Dùng đúng dữ liệu sai của môn {displaySubjectName}.
            </p>
            <Button
              as={Link}
              to={`/subjects/${subjectId ?? ""}/practice`}
              variant="warning"
              className="fw-semibold"
            >
              Vào ôn tập
            </Button>
          </Card.Body>
        </Card>

        <Alert variant="info" className="mt-3 mb-0">
          Trang này chỉ dành cho câu người dùng thực sự làm sai. Không có chức
          năng câu trọng tâm hay câu hay thi.
        </Alert>
      </Col>
    </Row>
  );
}

export default WrongAnswersPage;
