import { Container } from "react-bootstrap";

function AppFooter() {
  return (
    <footer className="border-top bg-white py-3">
      <Container
        fluid="xl"
        className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-center"
      ></Container>
    </footer>
  );
}

export default AppFooter;
