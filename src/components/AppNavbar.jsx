import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";

function AppNavbar() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  return (
    <Navbar expand="lg" bg="white" className="border-bottom shadow-sm">
      <Container fluid="xl">
        <Navbar.Brand as={Link} to="/" className="fw-bold text-dark">
          Ôn Thi Cuối Kỳ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto gap-lg-2">
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/" end className="fw-semibold">
                  Trang chủ
                </Nav.Link>
                <Nav.Link as={NavLink} to="/history" className="fw-semibold">
                  Lịch sử
                </Nav.Link>
                <Nav.Link
                  as="button"
                  onClick={handleLogout}
                  className="fw-semibold"
                >
                  Đăng xuất
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login" className="fw-semibold">
                Đăng nhập
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
