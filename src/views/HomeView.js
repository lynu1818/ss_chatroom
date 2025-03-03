import React, { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsChatDots } from "react-icons/bs";
import "../styles/HomeView.css";

const HomeView = () => {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <Row>
        <Col xs={3}></Col>
        <Col xs={6} className="text-center scale-up">
          <BsChatDots
            size={50}
            className="bounce"
            style={{ marginBottom: "4px" }}
          />
          <h1>Welcome to the Chat App</h1>
          <p>
            Explore the features of our chat application and start connecting
            with others!
          </p>
          <Row className="mt-3">
            <Col xs={12} sm={6} className="d-flex justify-content-center mb-2">
              <Link to="/signin" className="btn sign-in-btn-home">
                Sign In
              </Link>
            </Col>
            <Col xs={12} sm={6} className="d-flex justify-content-center mb-2">
              <Link to="/signup" className="btn sign-up-btn-home">
                Sign Up
              </Link>
            </Col>
          </Row>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>
  );
};

export default HomeView;
