import { Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function SubjectCard({ subject }) {
  const subjectId =
    subject?._id ??
    subject?.id ??
    subject?.subjectId ??
    subject?.slug ??
    subject?.name;
  const subjectName =
    subject?.name ?? subject?.title ?? subject?.subjectName ?? "Môn học";
  const subjectDescription = subject?.description ?? subject?.summary ?? "";
  const subjectCode = subject?.code ?? subject?.subjectCode ?? null;

  return (
    <Card className="soft-card subject-tile h-100 border-0">
      <Card.Body className="p-4 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <Badge bg="warning" text="dark" className="app-badge mb-3">
              Môn học
            </Badge>
            <Card.Title as="h2" className="h5 mb-1">
              {subjectName}
            </Card.Title>
            {subjectDescription ? (
              <Card.Text className="text-secondary mb-0">
                {subjectDescription}
              </Card.Text>
            ) : null}
          </div>
          {subjectCode ? <Badge bg="dark">{subjectCode}</Badge> : null}
        </div>

        <div className="d-flex gap-2 flex-wrap mt-auto">
          <Button
            as={Link}
            to={`/subjects/${subjectId}`}
            variant="dark"
            className="fw-semibold"
          >
            Mở môn
          </Button>
          <Button
            as={Link}
            to={`/subjects/${subjectId}/practice`}
            variant="outline-dark"
            className="fw-semibold"
          >
            Ôn tập
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SubjectCard;
