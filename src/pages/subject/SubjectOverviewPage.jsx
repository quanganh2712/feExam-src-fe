import { Col, Row } from "react-bootstrap";
import SubjectFeatureCard from "../../components/SubjectFeatureCard";

function SubjectOverviewPage() {
  const features = [
    {
      title: "Ôn tập",
      description: "Xem tất cả câu hỏi kèm đáp án đúng trên cùng một trang.",
      to: "practice",
      icon: "📘",
    },
    {
      title: "Thi thử",
      description:
        "Làm 60 câu, có timer, navigator và submit sau khi hoàn tất.",
      to: "exam",
      icon: "📝",
      variant: "warning",
    },
    {
      title: "Câu sai",
      description: "Luyện lại đúng các câu đã từng làm sai trong quá khứ.",
      to: "wrong-answers",
      icon: "🔁",
      variant: "white",
    },
    {
      title: "Lịch sử làm bài",
      description: "Xem điểm, số câu đúng/sai, thời gian và mở lại kết quả.",
      to: "/history",
      icon: "🕘",
      variant: "white",
    },
  ];

  return (
    <Row className="g-3 g-lg-4">
      {features.map((feature) => (
        <Col key={feature.title} xs={12} md={6}>
          <SubjectFeatureCard {...feature} />
        </Col>
      ))}
    </Row>
  );
}

export default SubjectOverviewPage;
