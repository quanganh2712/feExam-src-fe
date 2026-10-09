import { Card, Form, Stack } from "react-bootstrap";

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
  return (
    option?.id ??
    option?.value ??
    option?.key ??
    option?.optionId ??
    String(index)
  );
}

function normalizeOptionId(value) {
  return value === undefined || value === null ? null : String(value);
}

function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  showAnswerKey = false,
  showWrongAnswer = false,
  locked = false,
  compact = false,
  showQuestionNumber = true,
}) {
  if (!question) {
    return null;
  }

  const options = Array.isArray(question?.options) ? question.options : [];
  const correctOptionId =
    question?.correctOptionId ??
    question?.answerId ??
    question?.correctAnswer ??
    question?.correctOption?.id ??
    question?.correctOption?.value;

  return (
    <Card className="soft-card border-0 h-100">
      <Card.Body className={compact ? "p-3 p-lg-4" : "p-4 p-lg-5"}>
        <Stack gap={2}>
          <div>
            {showQuestionNumber ? (
              <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                <div className="text-uppercase text-secondary small fw-semibold">
                  Câu {question.number ?? question.index ?? question.id}
                </div>
              </div>
            ) : null}
            <h2 className="h4 mb-0">
              {question.question ??
                question.content ??
                "Nội dung câu hỏi sẽ được tải từ Backend."}
            </h2>
          </div>

          <div className="d-grid gap-2">
            {options.map((option, index) => {
              const optionId = getOptionId(option, index);
              const normalizedOptionId = normalizeOptionId(optionId);
              const isSelected =
                normalizeOptionId(selectedOptionId) === normalizedOptionId;
              const isCorrect =
                showAnswerKey &&
                normalizeOptionId(correctOptionId) === normalizedOptionId;
              const isWrong =
                (showAnswerKey || showWrongAnswer) &&
                isSelected &&
                correctOptionId !== undefined &&
                correctOptionId !== null &&
                !isCorrect;

              return (
                <Form.Label
                  key={optionId}
                  className={`question-option ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""} mb-0`}
                >
                  <Form.Check
                    type="radio"
                    name={`question-${question.id ?? question.number ?? "item"}`}
                    id={`${question.id ?? question.number ?? "item"}-${optionId}`}
                    label={getOptionText(option, index)}
                    checked={isSelected}
                    disabled={locked}
                    onChange={() => onSelectOption?.(optionId)}
                  />
                </Form.Label>
              );
            })}
          </div>

          {!options.length ? (
            <div className="rounded-3 border border-dashed bg-light p-3 text-secondary">
              Backend sẽ trả về danh sách options với số lượng linh hoạt cho
              từng câu.
            </div>
          ) : null}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default QuestionCard;
