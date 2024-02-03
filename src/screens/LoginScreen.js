import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Container, Col, Card, Form, Button } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const LoginScreen = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // navigate to profile if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigate("/");
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // login function
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } catch (error) {
        if (error.code === "auth/invalid-email") {
          setError("Please enter a valid email");
        } else if (error.code === "auth/user-not-found") {
          setError("Account not created");
        } else if (error.code === "auth/wrong-password") {
          setError("You entered a wrong password");
        } else if (error.code === "auth/too-many-requests") {
          setError("Too many requests. Try again later");
        } else if (error.code === "auth/user-disabled") {
          setError("Your account has been disabled");
        } else if (error.code === "auth/operation-not-allowed") {
          setError("Operation not allowed");
        } else if (error.code === "auth/invalid-credential") {
          setError("Please enter valid email and password");
        } else {
          setError(error.message);
        }
      }
    }
  };
  // google login function
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        // saves user data to firestore in users collection in user id document
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, {
          name: user.displayName,
          phone: "",
          address: "",
          email: user.email,
          userId: user.uid,
        });
        navigate("/");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Login</Card.Title>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Col className="text-center mt-3 mb-2">
              <Button variant="primary" type="button" onClick={handleLogin}>
                Login
              </Button>
            </Col>
            <Col className="text-center mt-3 mb-2">
              <Button type="button" onClick={handleGoogleLogin}>
                <FaGoogle /> Sign Up with Google
              </Button>
            </Col>
            <Link to="/signup" className="text-center d-block">
              Don't have an account? Sign up
            </Link>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginScreen;
