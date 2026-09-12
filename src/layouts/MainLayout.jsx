import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";

function MainLayout() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="app-main py-4 py-lg-5">
        <Container fluid="xl">
          <Outlet />
        </Container>
      </main>
      <AppFooter />
    </div>
  );
}

export default MainLayout;
