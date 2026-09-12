import { Alert, Card } from "react-bootstrap";

function EmptyState({ title, description, tone = "light" }) {
  return (
    <Card className="soft-card border-0">
      <Card.Body className="p-4 p-lg-5">
        <Alert variant={tone} className="mb-0">
          <Alert.Heading className="h5 mb-2">{title}</Alert.Heading>
          <p className="mb-0">{description}</p>
        </Alert>
      </Card.Body>
    </Card>
  );
}

export default EmptyState;
