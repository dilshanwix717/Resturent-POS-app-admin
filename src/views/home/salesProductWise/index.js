import React from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';

// import Card from '../../../components/Card/MainCard';

const dashSalesData = [
  { title: 'Product Sales', amount: 'Rs. 0', icon: 'icon-arrow-up text-c-green', value: 50, class: 'progress-c-theme' },
  { title: 'Empty Bottle Deposits', amount: 'Rs. 0', icon: 'icon-arrow-down text-c-red', value: 36, class: 'progress-c-theme2' },
  { title: 'Cost', amount: 'Rs. 0', icon: 'icon-arrow-up text-c-green', value: 70, color: 'progress-c-theme' },
  { title: 'Profit', amount: 'Rs. 0', icon: 'icon-arrow-up text-c-green', value: 70, color: 'progress-c-theme' },
];

const salesProfit = () => {
  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={12}>
            <Card>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                    <Form.Label column sm={3}>
                      From
                    </Form.Label>
                    <Col sm={9}>
                      <Form.Control type="date" placeholder="From" />
                    </Col>
                  </Form.Group>

                  <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                    <Form.Label column sm={3}>
                      To
                    </Form.Label>
                    <Col sm={9}>
                      <Form.Control type="date" placeholder="To" />
                    </Col>
                  </Form.Group>

                  <Form.Group className="mb-3" as={Col} controlId="formGridState">
                    <Row>
                      <Col lg={3} md={3} sm={9} col={3}>
                        <Form.Label>Select</Form.Label>
                      </Col>
                      <Col lg={9} md={9} sm={9} col={9}>
                        <Form.Control as="select">
                          <option>All</option>
                          <option>DCSL Breweries</option>
                          <option>IDL - International Distillers LTD</option>
                          <option>Lion Brewery (Ceylon) PLC</option>
                          <option>Luxury Brands</option>
                          <option>RockLand Distillers</option>
                          <option>VA Distillers</option>
                        </Form.Control>
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3" as={Row}>
                    <Col sm={{ span: 10, offset: 0 }}>
                      <Button>Generate</Button>
                    </Col>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {dashSalesData.map((data, index) => {
            return (
              <Col key={index} xl={6} xxl={3}>
                <Card>
                  <Card.Body>
                    <h6 className="mb-4">{data.title}</h6>
                    <div className="row d-flex align-items-center">
                      <div className="col-9">
                        <h3 className="f-w-300 d-flex align-items-center m-b-0">
                          <i className={`feather f-30 m-r-5`} />{data.amount}
                          {/* <i className={`feather ${data.icon} f-30 m-r-5`} />{data.amount} */}
                        </h3>
                      </div>
                      {/* <div className="col-3 text-end">
                        <p className="m-b-0">{data.value}%</p>
                      </div> */}
                    </div>
                    {/* <div className="progress m-t-30" style={{ height: '7px' }}>
                      <div
                        className={`progress-bar ${data.class}`}
                        role="progressbar"
                        style={{ width: `${data.value}%` }}
                        aria-valuenow={data.value}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div> */}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}

          <Card>
            <Card.Header>
              <Card.Title as="h5">Product Wise Sales</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Sales</th>
                    <th>Deposits</th>
                    <th>Cost</th>
                    <th>Profit</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
      </Row>
    </React.Fragment>
  );
};

export default salesProfit;