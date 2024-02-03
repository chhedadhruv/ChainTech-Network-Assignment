import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { getDoc, updateDoc, collection, doc } from "firebase/firestore";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  // navigate to login screen if user is not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [navigate]);

  // get user data from firestore
  useEffect(() => {
    if (user) {
      const getUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setName(docSnap.data().name);
          setPhoneNumber(docSnap.data().phoneNumber);
          setAddress(docSnap.data().address);
        }
      };

      getUserData();
    }
  }, [user]);

  // toggle between edit and save button
  const handleEditClick = () => {
    setEditMode(true);
  };

  // save user data to firestore
  const handleSaveClick = async () => {
    if (!name || !phoneNumber || !address) {
      alert("Please enter all fields");
      return;
    } else {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name,
        phoneNumber,
        address,
      });
      setEditMode(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row>
        <Col md={12} lg={6}>
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <Card.Title className="text-center mb-4">Profile</Card.Title>
              {userData && (
                <Form>
                  <Form.Group controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicPhoneNumber">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>
                  <Col className="text-center mt-3 mb-2">
                    {editMode ? (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={handleSaveClick}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={handleEditClick}
                      >
                        Edit
                      </Button>
                    )}
                  </Col>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;
