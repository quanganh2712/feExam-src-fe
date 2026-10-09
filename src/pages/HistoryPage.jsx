import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import historyApi from "../services/historyApi";
import { formatDateTime, formatDuration } from "../utils/formatters";

function HistoryPage() {
  const [historyRows, setHistoryRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");
        const response = await historyApi.getHistory();
        const payload = response?.data;
        const nextRows = Array.isArray(payload)
          ? payload
          : payload?.data || payload?.items || payload?.history || [];

        if (!ignore) {
          setHistoryRows(nextRows);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              "Chưa có lịch sử làm bài. Hãy làm bài trước để dữ liệu xuất hiện.",
          );
          setHistoryRows([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  const rows = useMemo(() => historyRows, [historyRows]);

  return (
    <div>
      <BreadcrumbHeader
        title="Lịch sử làm bài"
        description="Danh sách các lần thi đã làm, có thể mở lại kết quả hoặc review chi tiết."
        crumbs={[{ label: "Trang chủ", to: "/" }, { label: "Lịch sử" }]}
      />

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-secondary mb-3">
          <Spinner animation="border" size="sm" />
          <span>Đang tải lịch sử làm bài...</span>
        </div>
      ) : null}

      {error ? <Alert variant="warning">{error}</Alert> : null}

      {!loading && !error && rows.length === 0 ? (
        <Alert variant="secondary">
          Chưa có lịch sử làm bài nào. Sau khi bạn làm bài, dữ liệu sẽ xuất hiện
          ở đây theo từng môn.
        </Alert>
      ) : null}

      {rows.length > 0 ? (
        <Card className="soft-card border-0">
          <Card.Body className="p-0">
            <Table responsive hover className="history-table mb-0 align-middle">
              <colgroup>
                <col className="history-col-subject" />
                <col className="history-col-total" />
                <col className="history-col-score" />
                <col className="history-col-count" />
                <col className="history-col-count" />
                <col className="history-col-duration" />
                <col className="history-col-date" />
                <col className="history-col-action" />
              </colgroup>
              <thead className="table-light">
                <tr>
                  <th>Môn học</th>
                  <th className="text-center">Số câu</th>
                  <th className="text-center">Điểm</th>
                  <th className="text-center">Đúng</th>
                  <th className="text-center">Sai</th>
                  <th className="text-center">Thời gian</th>
                  <th className="text-center">Ngày làm bài</th>
                  <th className="text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const subject = row.subject;
                  const subjectName =
                    subject?.name ||
                    row.subjectName ||
                    row.subject ||
                    row.subjectCode ||
                    "Môn học";
                  const examId = row.examId || row.id;
                  const totalQuestions =
                    row.totalQuestions ?? row.questionCount ?? row.total ?? "-";
                  const rawScore = row.score ?? row.finalScore ?? row.point;
                  const score =
                    rawScore === undefined || rawScore === null
                      ? "-"
                      : Number.isFinite(Number(rawScore))
                        ? Number(rawScore).toFixed(1)
                        : rawScore;
                  const correctCount =
                    row.correctAnswers ??
                    row.correctCount ??
                    row.correct ??
                    "-";
                  const wrongCount =
                    row.wrongAnswers ?? row.wrongCount ?? row.incorrect ?? "-";
                  const rawDuration =
                    row.duration ?? row.timeSpent ?? row.durationSeconds;
                  const duration =
                    rawDuration === undefined || rawDuration === null
                      ? "-"
                      : Number.isFinite(Number(rawDuration))
                        ? formatDuration(Number(rawDuration))
                        : rawDuration;
                  const takenAt =
                    row.submittedAt || row.takenAt || row.createdAt;
                  const attemptNumber = row.attemptNumber ?? "—";

                  return (
                    <tr key={examId}>
                      <td>
                        {subjectName}
                        <div className="text-secondary small">
                          Lần thi {attemptNumber}
                        </div>
                      </td>
                      <td className="text-center">{totalQuestions}</td>
                      <td className="text-center fw-semibold">{score}</td>
                      <td className="text-center text-success">
                        {correctCount}
                      </td>
                      <td className="text-center text-danger">{wrongCount}</td>
                      <td className="text-center text-nowrap">{duration}</td>
                      <td className="text-center text-nowrap">
                        {takenAt ? formatDateTime(takenAt) : "-"}
                      </td>
                      <td className="text-center">
                        <Link
                          className="btn btn-sm btn-warning text-nowrap"
                          to={`/exams/${examId}/review`}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : null}
    </div>
  );
}

export default HistoryPage;
