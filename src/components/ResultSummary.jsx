import { Card, Col, Row } from "react-bootstrap";
import { formatDuration } from "../utils/formatters";

function ResultSummary({ result }) {
  const displayScore =
    result.score !== undefined && result.score !== null && result.score !== "—"
      ? `${Number(result.score).toFixed(1)}/10`
      : "—";
  const rawDuration = result.duration;
  const displayDuration =
    rawDuration === undefined || rawDuration === null || rawDuration === "—"
      ? "—"
      : Number.isFinite(Number(rawDuration))
        ? formatDuration(Number(rawDuration))
        : rawDuration;

  const cards = [
    { label: "Điểm số", value: displayScore },
    {
      label: "Tổng số câu",
      value: result.totalQuestions ?? result.totalCount ?? "—",
    },
    {
      label: "Số câu đúng",
      value: result.correctCount ?? result.correctAnswers ?? "—",
    },
    {
      label: "Số câu sai",
      value: result.wrongCount ?? result.wrongAnswers ?? "—",
    },
    { label: "Thời gian làm bài", value: displayDuration },
  ];

  return (
    <Row className="g-3">
      {cards.map((card) => (
        <Col key={card.label} xs={12} sm={6} lg={4}>
          <Card className="soft-card border-0 h-100">
            <Card.Body className="p-4">
              <div className="text-secondary small text-uppercase fw-semibold mb-2">
                {card.label}
              </div>
              <div className="display-6 lh-1 fw-bold">{card.value}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default ResultSummary;
