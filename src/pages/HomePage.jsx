import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Col, Row, Spinner } from "react-bootstrap";
import SubjectCard from "../components/SubjectCard";
import subjectsApi from "../services/subjectsApi";

const fallbackSubjects = [
  {
    id: "MLN1",
    name: "MLN1",
    description: "Môn học mẫu cho dữ liệu từ Backend.",
  },
  {
    id: "MLN2",
    name: "MLN2",
    description: "Môn học mẫu cho dữ liệu từ Backend.",
  },
  {
    id: "Triet-hoc",
    name: "Triết học",
    description: "Hiển thị như một môn độc lập, không hard-code vào luồng.",
  },
  {
    id: "Phap-luat",
    name: "Pháp luật",
    description: "Môn học khác với cùng cấu trúc thi và ôn tập.",
  },
];

function HomePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSubjects() {
      try {
        setLoading(true);
        setError("");
        const response = await subjectsApi.getSubjects();
        const payload = response?.data;
        const nextSubjects = (() => {
          if (Array.isArray(payload)) {
            return payload;
          }

          if (payload && typeof payload === "object") {
            if (Array.isArray(payload.data)) return payload.data;
            if (Array.isArray(payload.items)) return payload.items;
            if (Array.isArray(payload.subjects)) return payload.subjects;
            return [payload];
          }

          return [];
        })();

        if (!ignore) {
          setSubjects(nextSubjects.length ? nextSubjects : fallbackSubjects);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              "Không thể tải danh sách môn học từ backend. Đang hiển thị dữ liệu mẫu.",
          );
          setSubjects(fallbackSubjects);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSubjects();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleSubjects = useMemo(() => {
    if (subjects.length) {
      return subjects;
    }
    return fallbackSubjects;
  }, [subjects]);

  return (
    <div className="d-grid gap-4 gap-lg-5">
      <section className="hero-panel p-4 p-lg-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 align-items-lg-center">
          <div className="col-lg-8">
            <Badge bg="warning" text="dark" className="mb-3 app-badge">
              Nền tảng ôn thi cuối kỳ
            </Badge>
            <h1 className="mb-3">Ôn tập, thi thử và review</h1>
          </div>
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-end gap-3 mb-3">
          <div>
            <h2 className="section-title mb-1">Danh sách môn học</h2>
          </div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <Spinner animation="border" size="sm" />
            <span>Đang tải dữ liệu từ backend...</span>
          </div>
        ) : null}

        {error ? (
          <Alert variant="warning" className="mb-3">
            {error}
          </Alert>
        ) : null}

        <Row className="g-3 g-lg-4">
          {visibleSubjects.map((subject, index) => {
            const subjectKey =
              subject?.id ??
              subject?.subjectId ??
              subject?.slug ??
              subject?.name ??
              `subject-${index}`;

            return (
              <Col key={`${subjectKey}-${index}`} xs={12} md={6} xl={3}>
                <SubjectCard subject={subject} />
              </Col>
            );
          })}
        </Row>
      </section>
    </div>
  );
}

export default HomePage;
