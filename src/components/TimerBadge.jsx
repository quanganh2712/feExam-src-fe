import { Badge } from "react-bootstrap";

function TimerBadge({ timeText }) {
  return (
    <Badge bg="dark" className="px-3 py-2 fs-6">
      ⏱ {timeText}
    </Badge>
  );
}

export default TimerBadge;
