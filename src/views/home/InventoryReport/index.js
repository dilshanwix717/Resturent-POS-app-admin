import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import './index.css';

const InventoryReport = () => {
  const [pastDate, setPastDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setData] = useState([]);
  const tableRef = useRef();

  useEffect(() => {
    const fetchTodayReport = async () => {
      try {
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];

        setPastDate(todayDate);

        const response = await newRequest.get(`/reports/inventoryReport?pastDate=${todayDate}`);
        setData(response.data.reportData);
        setFromDate(new Date(response.data.fromDate).toISOString().split('T')[0]);
        setToDate(new Date(response.data.toDate).toISOString().split('T')[0]);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching inventory data', error);
        setData([]);
      }
    };

    fetchTodayReport();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await newRequest.get(`/reports/inventoryReport?pastDate=${pastDate}`);
      setData(response.data.reportData);
      setFromDate(new Date(response.data.fromDate).toISOString().split('T')[0]);
      setToDate(new Date(response.data.toDate).toISOString().split('T')[0]);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching inventory data', error);
      setData([]);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-header h5 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }
            .print-header p {
              margin: 5px 0;
              font-size: 14px;
              color: #555;
            }
            .table {
              border-collapse: collapse;
              width: 100%;
              margin: 0 auto;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f4f4f4;
              font-weight: bold;
              text-align: center;
            }
            .table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .table tr:hover {
              background-color: #f1f1f1;
            }
            .alert {
              color: #721c24;
              background-color: #f8d7da;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h5>Inventory Report</h5>
            <p>Date Range: ${fromDate} to ${toDate}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Type</th>
                <th>Opening Stock</th>
                <th>Purchases</th>
                <th>Sales</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((item, index) => `
                <tr ${item.needsRestock ? 'class="alert"' : ''}>
                  <th scope="row">${index + 1}</th>
                  <td>${item.productId}</td>
                  <td>${item.productName}</td>
                  <td>${item.productType}</td>
                  <td style="text-align: center;">${item.openingInventory}</td>
                  <td style="text-align: center;">${item.purchasesDuringPeriod}</td>
                  <td style="text-align: center;">${item.salesDuringPeriod}</td>
                  <td style="text-align: center;">${item.currentInventory}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const downloadCSV = () => {
    const modifiedData = data.map((item, index) => {
      return {
        index: (index + 1),
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        openingInventory: item.openingInventory,
        purchasesDuringPeriod: item.purchasesDuringPeriod,
        salesDuringPeriod: item.salesDuringPeriod,
        currentInventory: item.currentInventory
      };
    });

    const content = [
      ["#", "Product ID", "Product Name", "Type", "Opening Stock", "Purchases", "Sales", "Current Stock"],
      ...modifiedData.map(row => [row.index, row.productId, row.productName, row.productType, row.openingInventory, row.purchasesDuringPeriod, row.salesDuringPeriod, row.currentInventory])
    ];

    const csvContent = `Inventory Report\nDate Range: ${fromDate} to ${toDate}\n${content.map(row => row.join(",")).join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Inventory Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Inventory Report</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12} style={{ overflowX: 'auto' }}>
                  <Form className="d-inline-flex" onSubmit={handleGenerate}>
                    <Form.Group className="d-inline-flex mr-5 mx-3 align-items-center">
                      <Form.Label className="mb-0">Select Past Date</Form.Label>
                      <Form.Control
                        className="mx-2"
                        type="date"
                        placeholder="Date"
                        value={pastDate}
                        onChange={(e) => setPastDate(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="d-inline-flex mx-3" style={{ overflow: 'unset' }}>
                      <Button className="mb-0" type="submit">Generate</Button>
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Inventory Details</Card.Title>
              <Button variant="primary" onClick={handlePrint} className="float-right ml-2">
                Print
              </Button>
              <Button variant="primary" onClick={downloadCSV} className="float-right">
                Export CSV
              </Button>
            </Card.Header>
            <Card.Body ref={tableRef}>
              <div className="print-header">
                <h5>Inventory Report</h5>
                <p>Date Range: {fromDate} to {toDate}</p>
              </div>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Type</th>
                    <th>Opening Stock</th>
                    <th>Purchases</th>
                    <th>Sales</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className={item.needsRestock ? 'alert' : ''}>
                      <th scope="row">{index + 1}</th>
                      <td>{item.productId}</td>
                      <td>{item.productName}</td>
                      <td>{item.productType}</td>
                      <td>{item.openingInventory}</td>
                      <td>{item.purchasesDuringPeriod}</td>
                      <td>{item.salesDuringPeriod}</td>
                      <td>{item.currentInventory}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default InventoryReport;