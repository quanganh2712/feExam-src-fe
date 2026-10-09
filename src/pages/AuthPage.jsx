import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authApi from "../services/authApi";
import { firebaseAuth, googleProvider } from "../services/firebase";
import { getRedirectResult, signInWithRedirect } from "firebase/auth";

function RegistrationHint({ id, children }) {
  return (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={<Tooltip id={id}>{children}</Tooltip>}
    >
      <button
        type="button"
        className="auth-info-button"
        aria-label="Xem hướng dẫn nhập"
      >
        i
      </button>
    </OverlayTrigger>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(() =>
    localStorage.getItem("setupToken") ? "setup-password" : "login",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
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
  const isForgotPassword = mode === "forgot";
  const isResetPassword = mode === "reset";
  const isPasswordSetup = mode === "setup-password";
  const isPasswordResetFlow =
    isForgotPassword || isResetPassword || isPasswordSetup;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("token")) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    async function completeGoogleLogin() {
      try {
        const result = await getRedirectResult(firebaseAuth);

        if (!result || !isMounted) return;

        setIsSubmitting(true);
        const idToken = await result.user.getIdToken(true);
        const response = await authApi.loginWithGoogle(idToken);
        const data = response?.data?.data ?? response?.data;

        if (data.requiresPasswordSetup) {
          localStorage.removeItem("authToken");
          localStorage.setItem("setupToken", data.token);
          setForm((previous) => ({
            ...previous,
            email: data.user?.email || result.user.email || "",
          }));
          setMode("setup-password");
          setMessage("");
        } else {
          localStorage.removeItem("setupToken");
          localStorage.setItem("authToken", data.token);
          navigate("/", { replace: true });
        }
      } catch {
        return;
      } finally {
        if (isMounted) setIsSubmitting(false);
      }
    }

    completeGoogleLogin();

    return () => {
      isMounted = false;
    };
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

    if (isResetPassword && form.password !== form.confirmPassword) {
      setFieldErrors({});
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    if (isPasswordSetup && form.password !== form.confirmPassword) {
      setFieldErrors({});
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    async function submitAuth() {
      try {
        setIsSubmitting(true);
        let response;
        if (isPasswordSetup) {
          response = await authApi.setPassword(form.password);
        } else if (isForgotPassword) {
          response = await authApi.requestPasswordReset(form.email);
        } else if (isResetPassword) {
          response = await authApi.resetPassword({
            email: form.email,
            otp: form.otp,
            password: form.password,
          });
        } else {
          response = isRegister
            ? await authApi.register({
                name: form.name,
                email: form.email,
                password: form.password,
              })
            : await authApi.login({
                email: form.email,
                password: form.password,
              });
        }
        const data = response?.data?.data ?? response?.data;

        if (isPasswordSetup) {
          const setupData = response?.data?.data ?? response?.data;
          localStorage.removeItem("setupToken");
          localStorage.setItem("authToken", setupData.token);
          navigate("/", { replace: true });
        } else if (isForgotPassword) {
          setMode("reset");
          setMessage(
            "Nếu email tồn tại, mã OTP đã được gửi. Hãy kiểm tra hộp thư.",
          );
        } else if (isResetPassword) {
          setMode("login");
          setForm((previous) => ({
            ...previous,
            password: "",
            confirmPassword: "",
            otp: "",
          }));
          setMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
        } else if (isRegister) {
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
      await signInWithRedirect(firebaseAuth, googleProvider);
    } catch {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setMessage("");
    setForm((previous) => ({
      ...previous,
      password: "",
      confirmPassword: "",
      otp: "",
    }));
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
                {!isPasswordResetFlow ? (
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
                ) : null}

                <div className="mb-4">
                  <h2 className="h3 mb-2">
                    {isPasswordSetup
                      ? "Tạo mật khẩu cho tài khoản"
                      : isForgotPassword
                        ? "Quên mật khẩu?"
                        : isResetPassword
                          ? "Đặt lại mật khẩu"
                          : isRegister
                            ? "Tạo tài khoản mới"
                            : "Chào mừng trở lại"}
                  </h2>
                  <p className="text-secondary mb-0">
                    {isPasswordSetup
                      ? "Mật khẩu này sẽ dùng để đăng nhập bằng email về sau."
                      : isForgotPassword
                        ? "Nhập email để nhận mã OTP đặt lại mật khẩu."
                        : isResetPassword
                          ? "Nhập mã OTP trong email và mật khẩu mới của bạn."
                          : isRegister
                            ? "Bắt đầu lưu lại hành trình ôn thi của bạn."
                            : "Đăng nhập để tiếp tục việc học của bạn."}
                  </p>
                </div>

                {message ? <Alert variant="info">{message}</Alert> : null}

                <Form onSubmit={handleSubmit}>
                  {isRegister ? (
                    <Form.Group className="mb-3" controlId="auth-name">
                      <div className="auth-label-with-hint">
                        <Form.Label>Họ và tên</Form.Label>
                        <RegistrationHint id="name-hint">
                          Nhập họ và tên của bạn. Tên không được để trống.
                        </RegistrationHint>
                      </div>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        isInvalid={Boolean(fieldErrors.name)}
                        required
                      />
                      <Form.Control.Feedback type="invalid" className="small">
                        {fieldErrors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : null}

                  <Form.Group className="mb-3" controlId="auth-email">
                    <div className="auth-label-with-hint">
                      <Form.Label>Email</Form.Label>
                      <RegistrationHint id="email-hint">
                        Nhập email hợp lệ của tài khoản.
                      </RegistrationHint>
                    </div>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      isInvalid={Boolean(fieldErrors.email)}
                      disabled={isResetPassword || isPasswordSetup}
                      required
                    />
                    <Form.Control.Feedback type="invalid" className="small">
                      {fieldErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {!isForgotPassword && !isResetPassword && !isPasswordSetup ? (
                    <Form.Group className="mb-3" controlId="auth-password">
                      <div className="d-flex justify-content-between">
                        <div className="auth-label-with-hint">
                          <Form.Label>Mật khẩu</Form.Label>
                          <RegistrationHint id="password-hint">
                            {isRegister
                              ? "Mật khẩu phải có ít nhất 6 ký tự."
                              : "Nhập mật khẩu của tài khoản của bạn."}
                          </RegistrationHint>
                        </div>
                        {!isRegister ? (
                          <button
                            type="button"
                            className="auth-link"
                            onClick={() => switchMode("forgot")}
                          >
                            Quên mật khẩu?
                          </button>
                        ) : null}
                      </div>
                      {isRegister ? (
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={updateField}
                          minLength={6}
                          required
                        />
                      ) : (
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={updateField}
                          minLength={6}
                          required
                        />
                      )}
                    </Form.Group>
                  ) : null}

                  {isResetPassword || isPasswordSetup ? (
                    <>
                      {isResetPassword ? (
                        <Form.Group className="mb-3" controlId="auth-otp">
                          <Form.Label>Mã OTP</Form.Label>
                          <Form.Control
                            inputMode="numeric"
                            name="otp"
                            value={form.otp}
                            onChange={updateField}
                            maxLength={6}
                            isInvalid={Boolean(fieldErrors.otp)}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {fieldErrors.otp}
                          </Form.Control.Feedback>
                        </Form.Group>
                      ) : null}
                      <Form.Group
                        className="mb-3"
                        controlId={
                          isPasswordSetup
                            ? "auth-setup-password"
                            : "auth-new-password"
                        }
                      >
                        <Form.Label>
                          {isPasswordSetup ? "Mật khẩu" : "Mật khẩu mới"}
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={updateField}
                          minLength={6}
                          required
                        />
                      </Form.Group>
                    </>
                  ) : null}

                  {isRegister || isResetPassword || isPasswordSetup ? (
                    <Form.Group
                      className="mb-3"
                      controlId="auth-confirm-password"
                    >
                      <div className="auth-label-with-hint">
                        <Form.Label>Nhập lại mật khẩu</Form.Label>
                        <RegistrationHint id="confirm-password-hint">
                          Nhập lại đúng mật khẩu ở trên.
                        </RegistrationHint>
                      </div>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={updateField}
                        minLength={6}
                        required
                      />
                    </Form.Group>
                  ) : null}

                  <Button
                    type="submit"
                    variant="dark"
                    className="auth-submit-button w-100 py-2 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : isPasswordSetup
                        ? "Lưu mật khẩu"
                        : isForgotPassword
                          ? "Gửi mã OTP"
                          : isResetPassword
                            ? "Đặt lại mật khẩu"
                            : isRegister
                              ? "Tạo tài khoản"
                              : "Đăng nhập"}
                  </Button>
                </Form>

                {!isPasswordResetFlow ? (
                  <div className="auth-divider">
                    <span>hoặc tiếp tục với</span>
                  </div>
                ) : null}

                {!isPasswordResetFlow ? (
                  <Button
                    type="button"
                    variant="outline-dark"
                    className="google-button auth-google-button w-100 py-2"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                  >
                    <span className="google-mark" aria-hidden="true">
                      G
                    </span>
                    Google
                  </Button>
                ) : null}

                <p className="text-center text-secondary small mt-4 mb-0">
                  {isPasswordResetFlow
                    ? "Nhớ mật khẩu rồi?"
                    : isRegister
                      ? "Đã có tài khoản?"
                      : "Chưa có tài khoản?"}{" "}
                  <button
                    type="button"
                    className="auth-link fw-semibold"
                    onClick={() => switchMode("login")}
                  >
                    {isPasswordResetFlow
                      ? "Đăng nhập"
                      : isRegister
                        ? "Đăng nhập"
                        : "Đăng ký ngay"}
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
