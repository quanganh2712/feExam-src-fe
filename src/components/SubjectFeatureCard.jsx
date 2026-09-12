import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function SubjectFeatureCard({
  title,
  description,
  to,
  icon,
  variant = "light",
}) {
  return (
    <Card
      as={Link}
      to={to}
      className="soft-card subject-tile h-100 text-decoration-none border-0"
    >
      <Card.Body className={`p-4 bg-${variant}`}>
        <div className="d-flex align-items-start gap-3">
          <div className="display-6 lh-1">{icon}</div>
          <div>
            <Card.Title as="h3" className="h5 mb-2 text-dark">
              {title}
            </Card.Title>
            <Card.Text className="text-secondary mb-0">{description}</Card.Text>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SubjectFeatureCard;
