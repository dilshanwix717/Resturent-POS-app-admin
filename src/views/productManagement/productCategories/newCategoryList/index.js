import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

const newCategoryList = () => {
  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={9}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Category Setup</Card.Title>
              <br />
              <Form.Label>You can create New Categories from here.</Form.Label>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Category name [Minimum 3 charactors]
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text"/>
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                    <Col lg={3} md={3} sm={3} col={3}>
                      <Form.Label>Description</Form.Label>
                      
                    </Col>
                    <Col lg={9} md={9} sm={9} col={9}>
                      <Form.Control as="textarea" rows="3"/>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row}>
                  <Col sm={{ span: 10, offset: 0 }}>
                    <Button>Save</Button>
                    <Button>New</Button>
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

export default newCategoryList;