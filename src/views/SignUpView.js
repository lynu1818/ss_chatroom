import React from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUserPlus, FaGoogle } from "react-icons/fa";
import { useAuthViewModel } from "../viewmodels/authViewModel";
import "../styles/SignUpView.css";

const SignUpView = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSignUp,
    handleSignInWithGoogle,
    error,
  } = useAuthViewModel();

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <div className="text-center">
            <FaUserPlus size={50} className="mb-3" />
            <h2>Sign Up</h2>
          </div>
          <Form>
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
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              className="w-100 sign-up-btn"
              onClick={(e) => handleSignUp(e)}
            >
              Register
            </Button>
            <Button
              variant="light"
              className="w-100 mt-3"
              onClick={handleSignInWithGoogle}
            >
              <FaGoogle className="me-2" /> Sign up with Google
            </Button>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
            <div className="mt-3 text-center">
              <p>
                Already have an account?{" "}
                <Link to="/signin" className="sign-in-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpView;
