import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

const profile = () => {
  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={9}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Authentication Settings</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Username
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" placeholder="Username" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    Current Password
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="password" placeholder="Enter current password" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    New password
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="password" placeholder="Enter new password" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    Confirm new password
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="password" placeholder="Confirm new password" />
                  </Col>
                </Form.Group>
              
                <Form.Group className="mb-3" as={Row}>
                  <Col sm={{ span: 10 }}>
                    <Button>Change password</Button>
                  </Col>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default profile;