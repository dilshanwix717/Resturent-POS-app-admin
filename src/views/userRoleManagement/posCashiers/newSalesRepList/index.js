import React from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';

const newSalesRepList = () => {
  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={9}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Sales Rep List Setup</Card.Title>
              <br />
              <Form.Label>You can create New Sales Reps from here.</Form.Label>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Sales Rep name
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" placeholder="Sales Rep name" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Username
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" placeholder="Username" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Col} controlId="formGridState">
                    <Row>
                      <Col lg={3} md={3} sm={3}>
                        <Form.Label>State</Form.Label>
                      </Col>
                    
                      <Col lg={9} md={9} sm={9}>
                        <Form.Control as="select">
                          <option>Choose...</option>
                          <option>Option 1</option>
                        </Form.Control>
                      </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                  <Row>
                    <Col lg={3} md={3} sm={3}>
                      <Form.Label>Description</Form.Label>
                    </Col>
                      
                    <Col lg={9} md={9} sm={9}>
                      <Form.Control as="textarea" rows="3" />
                    </Col>    
                  </Row> 
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Email
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="email" placeholder="Enter email" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Phone
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" placeholder="Ex- +94 78 2468 457" />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Remarks
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" placeholder="Remarks" />
                  </Col>
                </Form.Group>
                
                <fieldset>
                  <Form.Group className="mb-3" as={Row}>
                    <Form.Label as="legend" column sm={3}>
                      Select
                    </Form.Label>
                    <Col sm={9}>
                      <Form.Check type="radio" label="Send an Email notification with login details to the Sales Rep" name="formHorizontalRadios" id="formHorizontalRadios1" />
                      <Form.Check type="radio" label="Send login details to the Sales Rep Manually" name="formHorizontalRadios" id="formHorizontalRadios2" />
                    </Col>
                  </Form.Group>
                </fieldset>

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

export default newSalesRepList;