import { Button, Card } from "react-bootstrap";

function QuestionNavigator({
  total = 50,
  currentIndex = 0,
  answeredSet = new Set(),
  onSelect,
}) {
  return (
    <Card className="soft-card border-0">
      <Card.Body className="p-3 p-lg-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title as="h3" className="h6 mb-0">
            Danh sách câu hỏi
          </Card.Title>
          <span className="badge text-bg-light border">
            {answeredSet.size}/{total} đã trả lời
          </span>
        </div>

        <div className="navigator-grid">
          {Array.from({ length: total }, (_, index) => {
            const questionNumber = index + 1;
            const isCurrent = index === currentIndex;
            const isAnswered = answeredSet.has(questionNumber);

            return (
              <Button
                key={questionNumber}
                type="button"
                variant={
                  isCurrent
                    ? "warning"
                    : isAnswered
                      ? "success"
                      : "outline-secondary"
                }
                className={`navigator-btn fw-semibold ${isCurrent ? "is-current" : ""} ${isAnswered ? "is-answered" : ""}`}
                onClick={() => onSelect?.(index)}
              >
                {questionNumber}
              </Button>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}

export default QuestionNavigator;
