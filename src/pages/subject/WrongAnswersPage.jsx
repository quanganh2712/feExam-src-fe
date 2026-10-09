import { useEffect, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import QuestionCard from "../../components/QuestionCard";
import examsApi from "../../services/examsApi";

function getQuestionId(question) {
  const questionId = question?.questionId;

  return questionId?._id ?? questionId?.id ?? questionId ?? null;
}

function getUniqueQuestionKey(question) {
  const questionId = getQuestionId(question);

  if (questionId != null) {
    return `id:${String(questionId)}`;
  }

  const questionText = String(question?.question ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return questionText ? `text:${questionText}` : null;
}

function WrongAnswersPage() {
  const { subjectId } = useParams();
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [answers, setAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const uniqueQuestions = [];
        const seenQuestionKeys = new Set();

        items.forEach((item) => {
          const questionKey = getUniqueQuestionKey(item);

          if (questionKey && !seenQuestionKeys.has(questionKey)) {
            seenQuestionKeys.add(questionKey);
            uniqueQuestions.push(item);
          }
        });

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

  const handleSelectAnswer = async (question, optionId) => {
    const questionId = getQuestionId(question);
    const questionKey = String(questionId);
    const selectedAnswer = String(optionId ?? "").trim();
    const correctAnswer = String(question.correctAnswer ?? "").trim();

    setAnswers((previous) => ({
      ...previous,
      [questionKey]: optionId,
    }));
    setCheckedAnswers((previous) => ({
      ...previous,
      [questionKey]: true,
    }));

    try {
      if (selectedAnswer !== correctAnswer) return;

      await examsApi.removeWrongAnswer(questionKey);
      setWrongAnswers((previous) =>
        previous.filter((item) => String(getQuestionId(item)) !== questionKey),
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
    }
  };

  return (
    <Row className="g-3 g-lg-4">
      <Col xs={12}>
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
              const questionKey = String(getQuestionId(question));
              const isChecked = checkedAnswers[questionKey];

              return (
                <div className="soft-card border-0" key={questionKey}>
                  <div className="p-4 p-lg-5">
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
                        handleSelectAnswer(question, optionId)
                      }
                      showAnswerKey={false}
                      showWrongAnswer={isChecked}
                      showQuestionNumber={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Col>
    </Row>
  );
}

export default WrongAnswersPage;
