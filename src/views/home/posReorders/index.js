import React from 'react';
import { Row, Card, Table } from 'react-bootstrap';

// import Card from '../../../components/Card/MainCard';

const posStock = () => {
  return (
    <React.Fragment>
      <Row>
        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Re-order Products</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Sale Qty (Last 90 Days)</th>
                    <th>Price</th>
                    <th>Last Purchased Price</th>
                    <th>Minimum Stock</th>
                    <th>Current Stock</th>
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