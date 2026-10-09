import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Modal,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import QuestionCard from "../../components/QuestionCard";
import QuestionNavigator from "../../components/QuestionNavigator";
import TimerBadge from "../../components/TimerBadge";
import useCountdown from "../../hooks/useCountdown";
import examsApi from "../../services/examsApi";
import questionsApi from "../../services/questionsApi";
import { formatDuration } from "../../utils/formatters";

const EXAM_QUESTION_LIMIT = 60;

function normalizeQuestions(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.questions)) return payload.questions;
  if (Array.isArray(payload.exam?.questions)) return payload.exam.questions;
  if (Array.isArray(payload.data?.questions)) return payload.data.questions;

  return [];
}

function getExamId(payload) {
  return (
    payload?._id ??
    payload?.id ??
    payload?.examId ??
    payload?.exam?._id ??
    payload?.exam?.id ??
    payload?.data?._id ??
    payload?.data?.id ??
    payload?.data?.examId
  );
}

function getQuestionId(question, index) {
  return (
    question?._id ?? question?.id ?? question?.questionId ?? `question-${index}`
  );
}

function withQuestionNumbers(questions) {
  return questions.map((question, index) => ({
    ...question,
    number: index + 1,
  }));
}

function ExamPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const canLeaveExamRef = useRef(false);
  const historyGuardInitializedRef = useRef(false);
  const [examId, setExamId] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const secondsLeft = useCountdown(60 * 60, true);

  useEffect(() => {
    let ignore = false;

    async function loadExamQuestions() {
      try {
        setLoading(true);
        setError("");
        setExamId(null);
        setExamQuestions([]);
        setCurrentIndex(0);
        setAnswers({});

        let rawQuestions = [];
        let createdExamId = null;

        // Ưu tiên lấy trực tiếp danh sách câu hỏi từ API questions (/api/questions?subjectId=...) - API này giấu correctAnswer
        try {
          const questionsResponse = await questionsApi.getQuestions(subjectId);
          const fetchedQuestions = normalizeQuestions(questionsResponse?.data);
          if (fetchedQuestions.length > 0) {
            rawQuestions = fetchedQuestions;
          }
        } catch (e) {
          console.warn("Failed to get questions from questionsApi:", e);
        }

        // Tạo phiên thi mới ở Backend để lấy examId cho việc Submit bài thi sau này
        try {
          const examResponse = await examsApi.startExam(subjectId);
          const examPayload = examResponse?.data;
          createdExamId = getExamId(examPayload);
          const examQuestionsFromBE = normalizeQuestions(examPayload);
          if (examQuestionsFromBE.length > 0) {
            rawQuestions = examQuestionsFromBE;
          }
        } catch (e) {
          console.warn("Failed to start exam backend session:", e);
        }

        // Backend đã random và lưu thứ tự câu hỏi trong phiên thi.
        const selectedQuestions = rawQuestions.slice(0, EXAM_QUESTION_LIMIT);

        if (!ignore) {
          setExamId(createdExamId);
          setExamQuestions(withQuestionNumbers(selectedQuestions));
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              "Không thể tải đề thi thử theo môn học từ backend.",
          );
          setExamQuestions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadExamQuestions();

    return () => {
      ignore = true;
    };
  }, [subjectId]);

  useEffect(() => {
    if (!historyGuardInitializedRef.current) {
      window.history.pushState({ examGuard: true }, "", window.location.href);
      historyGuardInitializedRef.current = true;
    }

    const warnBeforeLeaving = (event) => {
      if (canLeaveExamRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue =
        "Bạn đang làm bài thi thử. Bạn có chắc muốn rời đi không?";
    };

    const preventBackNavigation = () => {
      if (canLeaveExamRef.current) {
        return;
      }

      window.history.pushState({ examGuard: true }, "", window.location.href);
      window.alert("Bạn cần nộp bài trước khi rời khỏi trang thi thử.");
    };

    const warnWhenReturningToExam = () => {
      if (document.visibilityState === "visible") {
        window.alert(
          "Bạn vừa rời khỏi tab thi thử. Vui lòng tập trung làm bài và không chuyển sang tab khác.",
        );
      }
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    window.addEventListener("popstate", preventBackNavigation);
    document.addEventListener("visibilitychange", warnWhenReturningToExam);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      window.removeEventListener("popstate", preventBackNavigation);
      document.removeEventListener("visibilitychange", warnWhenReturningToExam);
    };
  }, []);

  const answeredSet = useMemo(
    () =>
      new Set(
        examQuestions
          .map((question, index) =>
            answers[getQuestionId(question, index)] ? index + 1 : null,
          )
          .filter(Boolean),
      ),
    [answers, examQuestions],
  );

  const currentQuestion = examQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examQuestions.length;
  const progress = Math.round(
    (answeredCount / Math.max(totalQuestions, 1)) * 100,
  );

  const handleSelect = (optionId) => {
    const questionKey = getQuestionId(currentQuestion, currentIndex);

    setAnswers((previous) => ({ ...previous, [questionKey]: optionId }));
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);

    const payload = {
      answers: examQuestions.map((question, index) => ({
        questionId: getQuestionId(question, index),
        selectedOptionId: answers[getQuestionId(question, index)],
      })),
      duration: 60 * 60 - secondsLeft,
    };

    if (examId) {
      try {
        const response = await examsApi.submitExam(examId, payload);
        const result =
          response?.data?.result ?? response?.data?.data ?? response?.data;

        canLeaveExamRef.current = true;
        navigate(`/exams/${examId}/result`, {
          replace: true,
          state: {
            result: {
              ...result,
              totalQuestions,
              duration: formatDuration(60 * 60 - secondsLeft),
              subjectId,
            },
          },
        });
        return;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Không thể nộp bài thi thử lên backend.",
        );
        return;
      }
    }

    setError("Không tạo được phiên thi để lưu kết quả. Vui lòng thử lại.");
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary">
        <Spinner animation="border" size="sm" />
        <span>Đang tạo đề thi thử 60 câu theo môn học...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error}</Alert>;
  }

  if (!totalQuestions) {
    return (
      <EmptyState
        title="Chưa có dữ liệu thi thử"
        description="Backend chưa trả về câu hỏi cho môn học này. Khi có dữ liệu, hệ thống sẽ tạo đề thi thử ngẫu nhiên tối đa 60 câu theo môn."
      />
    );
  }

  return (
    <Container fluid="xl" className="py-4 py-lg-5">
      <Row className="g-3 g-lg-4">
        <Col xs={12} xl={8}>
          <Card className="soft-card border-0 mb-3">
            <Card.Body className="p-3 p-lg-4 d-flex flex-column gap-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <div className="text-secondary small text-uppercase fw-semibold">
                    Chế độ thi thử
                  </div>
                  <div className="fw-semibold">
                    Câu {currentIndex + 1} / {totalQuestions}
                  </div>
                </div>
                <TimerBadge timeText={formatDuration(60 * 60 - secondsLeft)} />
              </div>
              <ProgressBar
                now={progress}
                label={`${progress}%`}
                variant="warning"
              />
            </Card.Body>
          </Card>

          <QuestionCard
            question={currentQuestion}
            selectedOptionId={
              answers[getQuestionId(currentQuestion, currentIndex)]
            }
            onSelectOption={handleSelect}
            showAnswerKey={false}
            locked={false}
            compact={false}
          />

          <div className="d-flex justify-content-between gap-2 mt-3">
            <Button
              variant="outline-secondary"
              onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
              disabled={currentIndex === 0}
            >
              Câu trước
            </Button>
            <div className="d-flex gap-2">
              <Button
                variant="outline-dark"
                onClick={() => setShowSubmitModal(true)}
              >
                Nộp bài
              </Button>
              <Button
                variant="warning"
                onClick={() =>
                  setCurrentIndex((value) =>
                    Math.min(value + 1, totalQuestions - 1),
                  )
                }
                disabled={currentIndex === totalQuestions - 1}
              >
                Tiếp theo
              </Button>
            </div>
          </div>

          {totalQuestions < EXAM_QUESTION_LIMIT ? (
            <Alert variant="warning" className="mt-3 mb-0">
              Backend hiện chỉ trả về {totalQuestions}/{EXAM_QUESTION_LIMIT} câu
              cho môn học này.
            </Alert>
          ) : null}
        </Col>

        <Col xs={12} xl={4}>
          <QuestionNavigator
            total={totalQuestions}
            currentIndex={currentIndex}
            answeredSet={answeredSet}
            onSelect={setCurrentIndex}
          />
        </Col>

        <Modal
          show={showSubmitModal}
          onHide={() => setShowSubmitModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận nộp bài</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {answeredCount < totalQuestions ? (
              <p className="text-danger fw-semibold mb-2">
                Bạn mới làm {answeredCount}/{totalQuestions} câu. Bạn có chắc
                chắn muốn nộp bài không?
              </p>
            ) : (
              <p className="mb-2">
                Bạn có chắc chắn muốn nộp bài thi thử không?
              </p>
            )}
            <div className="text-secondary small">
              Sau khi nộp, toàn bộ đáp án sẽ được gửi lên hệ thống để chấm điểm
              và hiển thị kết quả.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowSubmitModal(false)}
            >
              Hủy
            </Button>
            <Button variant="warning" onClick={handleSubmit}>
              Xác nhận nộp bài
            </Button>
          </Modal.Footer>
        </Modal>
      </Row>
    </Container>
  );
}

export default ExamPage;
