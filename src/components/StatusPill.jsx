import { Badge } from "react-bootstrap";

function StatusPill({ status }) {
  const variantMap = {
    Đúng: "success",
    Sai: "danger",
    "Chưa trả lời": "secondary",
  };

  return (
    <Badge
      bg={variantMap[status] || "secondary"}
      className="status-pill py-2 px-3"
    >
      {status}
    </Badge>
  );
}

export default StatusPill;
