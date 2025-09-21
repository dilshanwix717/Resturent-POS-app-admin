import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';

const CashInHand = () => {
  const [date, setDate] = useState('');
  const [cashierData, setCashierData] = useState([]);

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleGenerate = async () => {
    try {
      const response = await newRequest.get(`/POS/daily-balance/getAllCashierDetails/${date}`);
      console.log('API Response:', response.data);
      setCashierData(response.data);
    } catch (error) {
      console.error('Error fetching cashier details:', error);
    }
  };

  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const todayDate = new Date().toISOString().split('T')[0];
        setDate(todayDate);
        const response = await newRequest.get(`/POS/daily-balance/getAllCashierDetails/${todayDate}`);
        setCashierData(response.data);
      } catch (error) {
        console.error('Error fetching cashier details:', error);
      }
    };

    fetchTodayData();
  }, [])

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Cash in Hand</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12} style={{ overflowX: 'auto' }}>
                  <Form className="d-inline-flex">
                    <Form.Group className="d-inline-flex mr-5 mx-3 align-items-center">
                      <Form.Label className="mb-0">Date</Form.Label>
                      <Form.Control className="mx-2" type="date" value={date} onChange={handleDateChange} />
                    </Form.Group>
                    <Form.Group className="d-inline-flex mx-3" style={{ overflow: 'unset' }}>
                      <Button className="mb-0" onClick={handleGenerate}>Generate</Button>
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {cashierData.length > 0 ? (
        <Row>
          {cashierData.map((cashier, index) => (
            <Col key={index} md={6} lg={4} className="mb-4" style={{ minWidth: '500px' }}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-secondary text-white text-center py-3">
                  <h5 className="mb-0 text-white">{cashier.name}</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="table-responsive">
                    <Table className="table table-striped table-bordered" hover style={{ minWidth: '400px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '45%', padding: '12px 16px' }}><strong>Name</strong></td>
                          <td style={{ width: '55%', padding: '12px 16px' }}>{cashier.name}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Tel</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.tel}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Address</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.address}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Email</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.email}</td>
                        </tr>
                        <tr className="bg-light">
                          <td style={{ padding: '12px 16px' }}><strong>Cash In Hand</strong></td>
                          <td style={{ padding: '12px 16px' }} className="text-success">{cashier.cashInHand}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Close Amount</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.closeAmount}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Cash Transactions</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.totalCashTransactions}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Card Transactions</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.totalCardTransactions}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Wallet Transactions</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.totalWalletTransactions}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px 16px' }}><strong>Other Transactions</strong></td>
                          <td style={{ padding: '12px 16px' }}>{cashier.totalOtherTransactions}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <p>No data available</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export default CashInHand;