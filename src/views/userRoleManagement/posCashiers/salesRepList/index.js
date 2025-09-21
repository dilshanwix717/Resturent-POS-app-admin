import React from 'react';
import { Row, Col, Form, Table, Card, Badge, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';

const salesRepList = () => {

  const buttonVariants = ['success', /*, 'danger'*/];

  const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

  const contextualBadges = buttonVariants.map((variant, idx) => (
    <Badge key={idx} bg={variant} className={variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}>
      {variant}
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
        <Col>
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
                    <th>No</th>
                    <th>Sales Rep</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Store</th>
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
                    <td>-</td>
                    <td>{contextualBadges} <EditIcon /></td>
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
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default salesRepList;