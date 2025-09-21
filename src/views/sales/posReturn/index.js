import React from 'react';
import { Row, Col, Form, Table, Card, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

const posReturn= () => {
  const completeButtonGlowVariants = ['Complete GRN'];

  const completeButton = completeButtonGlowVariants.map((variant, idx) => (
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

              <Row className="mb-3">
                  <Col lg={6} md={6} sm={6} col={12}>
                    <Form.Control type="text" placeholder="" className="mb-3" />
                  </Col>

                  <Col lg={6} md={6} sm={6} col={12}>
                    <Form.Group  as={Col} controlId="formGridState">
                      <Form.Control as="select">
                        <option>Select Product</option>
                        {/* product names should be taken from the database */}
                      </Form.Control>
                    </Form.Group>
                  </Col>

                  <Col>
                    <span>{completeButton}</span>
                  </Col>
              </Row>

            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Unit Price (LKR)</th>
                    <th>Quantity</th>
                    <th>Total (LKR)</th>
                    <th>Stock</th>
                    <th>Settle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Text</Form.Label>
                        <Form.Control type="number" placeholder="" />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Text</Form.Label>
                        <Form.Control type="number" placeholder="" />
                      </Form.Group>
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <Button variant="warning" size="sm">
                        Add to Bill
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
      </Row>
    </React.Fragment>
  );
};

export default posReturn;