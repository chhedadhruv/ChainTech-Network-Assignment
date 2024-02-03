import React, { useState, useEffect } from "react";
import { auth, createUser, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { FaGoogle } from "react-icons/fa";
import { setDoc, doc } from "firebase/firestore";

const SignupScreen = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

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

  const handleSignup = async () => {
    if (name && phone && address && email && password && confirmPassword) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      } else if (phone.length < 10) {
        setError("Phone number must be at least 10 characters");
        return;
      } else if (address.length < 10) {
        setError("Address must be at least 10 characters");
        return;
      } else {
        if (password === confirmPassword) {
          try {
            const userCredential = await createUser(auth, email, password);
            const user = userCredential.user;
            // saves user data to firestore in users collection in user id document
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, {
              name,
              phone,
              address,
              email,
              userId: user.uid,
            });
            navigate("/");
          } catch (error) {
            if (error.code === "auth/email-already-in-use") {
              setError("Email already in use");
            } else if (error.code === "auth/invalid-email") {
              setError("Please enter a valid email");
            } else if (error.code === "auth/weak-password") {
              setError("Enter a strong password");
            } else if (error.code === "auth/operation-not-allowed") {
              setError("Operation not allowed");
            } else {
              setError(error.message);
            }
          }
        } else {
          setError("Passwords do not match");
        }
      }
    } else {
      setError("All fields are required");
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
          <Card.Title className="text-center mb-4">Sign Up</Card.Title>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form>
            <Form.Group controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formBasicAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                minLength="10"
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
            <Form.Group controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            <Col className="text-center mt-3 mb-2">
              <Button variant="primary" type="button" onClick={handleSignup}>
                Sign Up
              </Button>
            </Col>
            <Col className="text-center mt-3 mb-2">
              <Button type="button" onClick={handleGoogleLogin}>
                <FaGoogle /> Sign Up with Google
              </Button>
            </Col>
            <Link to="/login" className="text-center d-block">
              Already have an account? Log in
            </Link>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignupScreen;
