import React from 'react';
import { Row, Card, Table, Form, Col } from 'react-bootstrap';

// import Card from '../../../components/Card/MainCard';

const posStock = () => {
  return (
    <React.Fragment>
      <Row>
        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Available Products Qunantities</Card.Title>
              
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
                    <th>#</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Last Purchased Price</th>
                    <th>Available Stock</th>
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
            </Card.Body>
          </Card>
      </Row>
    </React.Fragment>
  );
};

export default posStock;