import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import './index.css';

const ServiceReport = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const tableRef = useRef();

  useEffect(() => {
    const fetchServiceChargeReport = async () => {
      try {
        const response = await newRequest.get('/discount/service-charge-report');
        setData(response.data);
        setFilteredData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching service charge data', error);
        setData([]);
        setFilteredData([]);
      }
    };

    fetchServiceChargeReport();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = data.filter((item) => {
      const date = formatDate(item.date);
      return (
        item.paymentID.toLowerCase().includes(query) ||
        item.invoiceID.toLowerCase().includes(query) ||
        item.transactionCode.toLowerCase().includes(query) ||
        item.authorizer.id.toLowerCase().includes(query) ||
        item.authorizer.name.toLowerCase().includes(query) ||
        date.includes(query)
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
          </style>
        </head>
        <body>
          <div class="print-header">
            <h5>Service Charge Report</h5>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Time</th>
                <th>Shop ID</th>
                <th>Authorizer Name</th>
                <th>Payment ID</th>
                <th>Invoice ID</th>
                <th>Bill Total</th>
                <th>Service Charge</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((item, index) => `
                <tr>
                  <th scope="row">${index + 1}</th>
                  <td>${formatDate(item.date)}</td>
                  <td>${formatTime(item.date)}</td>
                  <td>${item.shopId}</td>
                  <td>${item.authorizer.name}</td>
                  <td>${item.paymentID}</td>
                  <td>${item.invoiceID}</td>
                  <td style="text-align: right;">${item.billTotal.toFixed(2)}</td>
                  <td>${item.sellingTypeCharge}</td>
                  <td style="text-align: right;">${item.sellingTypeAmount.toFixed(2)}</td>
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
    const modifiedData = filteredData.map((item, index) => {
      return {
        index: (index + 1),
        date: formatDate(item.date),
        time: formatTime(item.date),
        paymentID: item.paymentID,
        invoiceID: item.invoiceID,
        billTotal: item.billTotal.toFixed(2),
        serviceCharge: item.sellingTypeCharge,
        amount: item.sellingTypeAmount.toFixed(2),
        authorizerId: item.authorizer.id,
        authorizerName: item.authorizer.name
      };
    });

    const content = [
      ["#", "Date", "Time", "Payment ID", "Invoice ID", "Bill Total", "Service Charge", "Amount", "Authorizer ID", "Authorizer Name"],
      ...modifiedData.map(row => [
        row.index,
        row.date,
        row.time,
        row.paymentID,
        row.invoiceID,
        row.billTotal,
        row.serviceCharge,
        row.amount,
        row.authorizerId,
        row.authorizerName
      ])
    ];

    const csvContent = `Service Charge Report\nGenerated on: ${new Date().toLocaleDateString()}\n${content.map(row => row.join(",")).join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Service Charge Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5" className="mb-3">Service Charge Report</Card.Title>
              <Row>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Search by Payment ID, Invoice ID, Authorizer ID, Authorizer Name, or Date"
                    onChange={handleSearch}
                    value={searchQuery}
                  />
                </Col>
                <Col md={6} className="text-right">
                  <Button variant="primary" onClick={handlePrint} className="ml-2">
                    Print
                  </Button>
                  <Button variant="primary" onClick={downloadCSV} className="ml-2">
                    Export CSV
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body ref={tableRef}>
              <div className="print-header">
                <h5>Service Charge Report</h5>
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Shop ID</th>
                    <th>Authorizer Name</th>
                    <th>Payment ID</th>
                    <th>Invoice ID</th>
                    <th style={{ textAlign: 'right' }}>Bill Total</th>
                    <th style={{ textAlign: 'right' }}>Service Charge</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <th scope="row">{indexOfFirstItem + index + 1}</th>
                      <td>{formatDate(item.date)}</td>
                      <td>{formatTime(item.date)}</td>
                      <td>{item.shopId}</td>
                      <td>{item.authorizer.name}</td>
                      <td>{item.paymentID}</td>
                      <td>{item.invoiceID}</td>
                      <td style={{ textAlign: 'right' }}>{item.billTotal.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{item.sellingTypeCharge}</td>
                      <td style={{ textAlign: 'right' }}>{item.sellingTypeAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="pagination mt-3 d-flex justify-content-center">
                  <Button
                    variant="light"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={currentPage === index + 1 ? 'primary' : 'light'}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}

                  <Button
                    variant="light"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ServiceReport;