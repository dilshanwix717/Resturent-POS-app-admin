import React from 'react';
import { Row, Col, Form, Table, Card, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

const posExpenses = () => {

  const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

  const glowButtons = buttonGlowVariants.map((variant, idx) => (
    <OverlayTrigger key={idx} placement="top" overlay={<Tooltip className="mb-2">{variant}</Tooltip>}>
      <Button className={'text-capitalize my-2 btn' + variant} variant={'light'}>
        {variant}
      </Button>
    </OverlayTrigger>
  ));

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title as="h5">Expenses Setup</Card.Title>
            <br />
            <Form.Label>You can create New Expenses from here.</Form.Label>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                <Form.Label column sm={3}>
                  Date
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="date"/>
                </Col>
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                  <Col lg={3} md={3} sm={3} col={3}>
                    <Form.Label>Amount (LKR)</Form.Label>
                    
                  </Col>
                  <Col lg={9} md={9} sm={9} col={9}>
                    <Form.Control type="text"/>
                  </Col>
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                  <Col lg={3} md={3} sm={3} col={3}>
                    <Form.Label>Details</Form.Label>
                    
                  </Col>
                  <Col lg={9} md={9} sm={9} col={9}>
                    <Form.Control type="text"/>
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

        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Receipt Details</Card.Title>
              
              <Row>
                  <Col>
                    <Form.Group className="mb-3" as={Col} controlId="formGridState" lg={6} md={6} sm={6}>
                      <Form.Control as="select">
                        <option>Entries per page</option>
                        {/* product names should be taken from the database */}
                      </Form.Control>
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Control type="text" placeholder="Search" className="mb-3" />
                  </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Date</th>
                    <th>Expense</th>
                    <th>Amount</th>
                    <th>Created Date</th>
                    <th>Created By</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button> 
                    </td>
                  </tr>
                </tbody>
              </Table>

              <Row>
                <Col>
                  <span>{glowButtons}</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
      </Row>
    </React.Fragment>
  );
};

export default posExpenses;