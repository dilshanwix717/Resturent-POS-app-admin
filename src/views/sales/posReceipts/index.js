import React from 'react';
import { Row, Col, Form, Table, Card, Badge, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import FolderOff from '@mui/icons-material/FolderOff';

const posReceipts = () => {

  const buttonVariants = ['success', /*, 'danger'*/];

  const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

  const contextualBadges = buttonVariants.map((variant, idx) => (
    <Badge key={idx} bg={variant} className={variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}>
      Active
    </Badge>
  ));

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
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Receipt</th>
                    <th>Cash</th>
                    <th>Card</th>
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
                    <td>-</td>
                    <td>-</td>
                    <td>
                      {contextualBadges}
                      <Button variant="danger" size="sm">
                        Cancel
                      </Button>
                      <FolderOff /> 
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

export default posReceipts;