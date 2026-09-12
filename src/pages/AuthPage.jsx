import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authApi from "../services/authApi";
import { firebaseAuth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return "";

    localStorage.setItem("authToken", token);
    return `Đăng nhập thành công${params.get("name") ? `, ${params.get("name")}` : ""}.`;
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("token")) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isRegister && form.password !== form.confirmPassword) {
      setFieldErrors({});
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    async function submitAuth() {
      try {
        setIsSubmitting(true);
        const response = isRegister
          ? await authApi.register({
              name: form.name,
              email: form.email,
              password: form.password,
            })
          : await authApi.login({
              email: form.email,
              password: form.password,
            });
        const data = response?.data?.data ?? response?.data;

        if (isRegister) {
          localStorage.removeItem("authToken");
          setMode("login");
          setFieldErrors({});
          setForm((previous) => ({
            ...previous,
            password: "",
            confirmPassword: "",
          }));
          setMessage("Đăng ký thành công. Vui lòng đăng nhập lại.");
        } else {
          localStorage.setItem("authToken", data.token);
          navigate("/", { replace: true });
        }
      } catch (error) {
        const nextFieldErrors = error?.response?.data?.fieldErrors || {};
        setFieldErrors(nextFieldErrors);
        setMessage(
          Object.keys(nextFieldErrors).length
            ? ""
            : error?.response?.data?.message || "Không thể xác thực tài khoản.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    submitAuth();
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const response = await authApi.loginWithGoogle(idToken);
      const data = response?.data?.data ?? response?.data;

      localStorage.setItem("authToken", data.token);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          (error?.code === "auth/popup-closed-by-user"
            ? "Cửa sổ đăng nhập đã được đóng."
            : "Không thể đăng nhập bằng Google."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setMessage("");
  };

  return (
    <div className="auth-page">
      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="align-items-center justify-content-center g-4 g-lg-5">
          <Col xs={12} lg={5} xl={4}>
            <div className="auth-intro">
              <span className="auth-kicker">ÔN THI CUỐI KỲ</span>
              <h1 className="auth-title">Học chắc hơn, thi tự tin hơn.</h1>
              <p className="auth-description">
                Lưu lại tiến độ, xem lịch sử làm bài và luyện lại những câu bạn
                chưa làm đúng.
              </p>
            </div>
          </Col>

          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="auth-card border-0">
              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex gap-1 auth-tabs mb-4" role="tablist">
                  <button
                    type="button"
                    className={`auth-tab ${!isRegister ? "is-active" : ""}`}
                    onClick={() => switchMode("login")}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    className={`auth-tab ${isRegister ? "is-active" : ""}`}
                    onClick={() => switchMode("register")}
                  >
                    Đăng ký
                  </button>
                </div>

                <div className="mb-4">
                  <h2 className="h3 mb-2">
                    {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
                  </h2>
                  <p className="text-secondary mb-0">
                    {isRegister
                      ? "Bắt đầu lưu lại hành trình ôn thi của bạn."
                      : "Đăng nhập để tiếp tục việc học của bạn."}
                  </p>
                </div>

                {message ? <Alert variant="info">{message}</Alert> : null}

                <Form onSubmit={handleSubmit}>
                  {isRegister ? (
                    <Form.Group className="mb-3" controlId="auth-name">
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        placeholder="Nguyễn Văn A"
                        isInvalid={Boolean(fieldErrors.name)}
                        required
                      />
                      <Form.Control.Feedback type="invalid" className="small">
                        {fieldErrors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : null}

                  <Form.Group className="mb-3" controlId="auth-email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="ban@example.com"
                      isInvalid={Boolean(fieldErrors.email)}
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="small">
                      {fieldErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="auth-password">
                    <div className="d-flex justify-content-between">
                      <Form.Label>Mật khẩu</Form.Label>
                      {!isRegister ? (
                        <button type="button" className="auth-link">
                          Quên mật khẩu?
                        </button>
                      ) : null}
                    </div>
                    <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={updateField}
                      placeholder="Tối thiểu 6 ký tự"
                      minLength={6}
                      required
                    />
                  </Form.Group>

                  {isRegister ? (
                    <Form.Group
                      className="mb-3"
                      controlId="auth-confirm-password"
                    >
                      <Form.Label>Nhập lại mật khẩu</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={updateField}
                        placeholder="Nhập lại mật khẩu"
                        minLength={6}
                        required
                      />
                    </Form.Group>
                  ) : null}

                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 py-2 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : isRegister
                        ? "Tạo tài khoản"
                        : "Đăng nhập"}
                  </Button>
                </Form>

                <div className="auth-divider">
                  <span>hoặc tiếp tục với</span>
                </div>

                <Button
                  type="button"
                  variant="outline-dark"
                  className="google-button w-100 py-2"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  <span className="google-mark" aria-hidden="true">
                    G
                  </span>
                  Google
                </Button>

                <p className="text-center text-secondary small mt-4 mb-0">
                  {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                  <button
                    type="button"
                    className="auth-link fw-semibold"
                    onClick={() =>
                      switchMode(isRegister ? "login" : "register")
                    }
                  >
                    {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
                  </button>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AuthPage;
