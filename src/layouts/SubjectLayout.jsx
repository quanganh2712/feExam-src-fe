import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Nav,
  Row,
} from "react-bootstrap";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import subjectsApi from "../services/subjectsApi";

function getSubjectName(subject, fallback) {
  return (
    subject?.name ??
    subject?.title ??
    subject?.subjectName ??
    subject?.displayName ??
    fallback
  );
}

function SubjectLayout() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);

  const fallbackSubjectLabel = useMemo(() => {
    if (!subjectId) {
      return "Môn học";
    }

    return decodeURIComponent(subjectId);
  }, [subjectId]);

  useEffect(() => {
    let ignore = false;

    async function loadSubject() {
      if (!subjectId) {
        setSubject(null);
        return;
      }

      try {
        const response = await subjectsApi.getSubjectById(subjectId);
        const payload = response?.data;
        const nextSubject = payload?.data ?? payload?.subject ?? payload;

        if (!ignore) {
          setSubject(nextSubject && typeof nextSubject === "object" ? nextSubject : null);
        }
      } catch {
        if (!ignore) {
          setSubject(null);
        }
      }
    }

    loadSubject();

    return () => {
      ignore = true;
    };
  }, [subjectId]);

  const subjectLabel = getSubjectName(subject, fallbackSubjectLabel);

  const sections = [
    { to: "", label: "Tổng quan", end: true },
    { to: "practice", label: "Ôn tập" },
    { to: "exam", label: "Thi thử" },
    { to: "wrong-answers", label: "Câu sai" },
  ];

  return (
    <Container fluid className="px-0">
      <Card className="soft-card mb-4 border-0 hero-panel">
        <Card.Body className="p-4 p-lg-5">
          <Breadcrumb className="mb-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
              Trang chủ
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{subjectLabel}</Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
            <div>
              <Badge bg="warning" text="dark" className="mb-3 app-badge">
                Môn học
              </Badge>
              <h1 className="mb-2">{subjectLabel}</h1>
              <p className="text-secondary mb-0">
                Khu vực thao tác cho ôn tập, thi thử, câu sai và lịch sử làm
                bài.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Button
                as={Link}
                to="practice"
                variant="warning"
                className="fw-semibold"
              >
                Bắt đầu ôn tập
              </Button>
              <Button
                as={Link}
                to="exam"
                variant="outline-dark"
                className="fw-semibold"
              >
                Vào thi thử
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <Nav variant="pills" className="flex-wrap gap-2">
            {sections.map((section) => (
              <Nav.Link
                key={section.label}
                as={NavLink}
                to={section.to}
                end={section.end}
                className="px-3 py-2 fw-semibold"
              >
                {section.label}
              </Nav.Link>
            ))}
          </Nav>
        </Col>
      </Row>

      <Outlet />
    </Container>
  );
}

export default SubjectLayout;
