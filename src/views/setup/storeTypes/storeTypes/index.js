import React from 'react';
import { Row, Col, Form, Table, Card, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

const storeTypes = () => {

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
              <Card.Title className="mb-3" as="h5">Supplier Details</Card.Title>
              
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
                    <th>Store Type</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>Created By</th>
                    <th>Status</th>
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

export default storeTypes;