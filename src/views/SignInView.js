import React, { useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaGoogle } from "react-icons/fa";
import { useAuthViewModel } from "../viewmodels/authViewModel";
import { useAuth } from "../AuthContext";
import "../styles/SignInView.css";

const SignInView = () => {
  const { currentUser } = useAuth();
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn,
    handleSignInWithGoogle,
    error,
  } = useAuthViewModel();

  useEffect(() => {
    if (currentUser) {
      window.location.href = "/chat";
    }
  }, []);
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <div className="text-center">
            <FaSignInAlt size={50} className="mb-3" />
            <h2>Sign In</h2>
          </div>
          <Form onSubmit={(e) => handleSignIn(e)}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 sign-in-btn"
            >
              Sign In
            </Button>
            <Button
              variant="light"
              className="w-100 mt-3"
              onClick={handleSignInWithGoogle}
            >
              <FaGoogle className="me-2" /> Sign in with Google
            </Button>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
            <div className="mt-3 text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="sign-up-link">
                  Sign up here
                </Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignInView;
