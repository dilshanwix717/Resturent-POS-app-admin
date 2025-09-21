import React, { useEffect, useState, useRef } from 'react'; // Include useRef
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import './index.css'
const SalesProfit = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setData] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const tableRef = useRef(); // Ref for the table section

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchFinishedGoods = async () => {
      try {
        const response = await newRequest.get('/products');
        const finishedGoods = response.data
          .filter(product => product.productType.toLowerCase().includes('finished good'))
          .map(product => ({
            value: product.productId,
            label: product.name,
            size: product.size,
          }));
        setFinishedGoods(finishedGoods);
      } catch (error) {
        console.error('Error fetching finished good products:', error);
      }
    };

    const fetchTodayReport = async () => {
      try {
        const today = new Date();
        const adjust = new Date();
        adjust.setDate(adjust.getDate() + 1);

        const todayDate = today.toISOString().split('T')[0];
        const adjustedDate = adjust.toISOString().split('T')[0];

        setFromDate(todayDate);
        setToDate(todayDate);
        console.log(todayDate);
        console.log(adjustedDate);
        const response = await newRequest.get(`/orders/Sales/${todayDate}/${adjustedDate}`);
        setData(response.data.salesDetails);
        console.log(response.data.salesDetails)
      } catch (error) {
        console.error('Error fetching sales and profit data', error);
        setData([]);
      }
    }

    fetchFinishedGoods();
    fetchTodayReport();
  }, [currentUser.id]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const adjust = new Date(toDate);
      adjust.setDate(adjust.getDate() + 1);

      const adjustedDate = adjust.toISOString().split('T')[0];

      const response = await newRequest.get(`/orders/Sales/${fromDate}/${adjustedDate}`);
      setData(response.data.salesDetails);
      console.log(response.data.salesDetails)
    } catch (error) {
      console.error('Error fetching sales and profit data', error);
      setData([]);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank'); // Open a new window
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
            <h5>Sales and Profit Report</h5>
            <p>Date Range: ${fromDate} to ${toDate}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th style="text-align: left;">Finished Good Name</th>
                <th>Quantity</th>
                <th>Sale</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((item, index) => `
                <tr>
                  <th scope="row">${index + 1}</th>
                   <td >${getFinishedGoodName(item.finishedGoodId)} (${getFinishedGoodSize(item.finishedGoodId)})</td>
                  <td style="text-align: center;">${item.finishedgoodQty}</td>
                  <td style="text-align: center;">${item.sale}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2" style="text-align: right;">Total:</th>
                <th>${totalQuantity}</th>
                <th>${totalSales}</th>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close(); // Close the document
    printWindow.print(); // Trigger print
    printWindow.close(); // Close the print window after printing
  };

  const downloadCSV = () => {
    const modifiedData = data.map((item, index) => {
      return {
        index: (index + 1),
        name: `${getFinishedGoodName(item.finishedGoodId)} (${getFinishedGoodSize(item.finishedGoodId)})`,
        quantity: item.finishedgoodQty,
        sale: item.sale
      }
    })

    const content = [
      ["#", "Finished Good Name", "Quantity", "Sale"],
      ...modifiedData.map(row => [row.index, row.name, row.quantity, row.sale])
    ];

    const csvContent = "Sales and Profit Report\n" + `Date Range ${fromDate} to ${toDate}\n` + content.map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Sales And Profit Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFinishedGoodName = (finishedGoodId) => {
    const finishedGood = finishedGoods.find(finishedGood => finishedGood.value === finishedGoodId);
    return finishedGood ? finishedGood.label : '-';
  };

  // const getFinishedGoodSize = (finishedGoodId) => {
  //   const finishedGood = finishedGoods.find(finishedGood => finishedGood.value === finishedGoodId);
  //   return finishedGood ? finishedGood.size : '-';
  // };
  const getFinishedGoodSize = (finishedGoodId) => {
    if (finishedGoodId === 'ProductID-212') {
      return ''; // Return an empty string for ProductID-212
    }
    const finishedGood = finishedGoods.find(finishedGood => finishedGood.value === finishedGoodId);
    return finishedGood ? finishedGood.size : '-';
  };


  const totalQuantity = data.reduce((sum, item) => sum + item.finishedgoodQty, 0);
  const totalSales = data.reduce((sum, item) => sum + item.sale, 0);

  return (
    <React.Fragment>
      <Row>
        <Col sm={12} lg={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Sales and Profit Report</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12} style={{ overflowX: 'auto' }}>
                  <Form className="d-inline-flex" onSubmit={handleGenerate}>
                    <Form.Group className="d-inline-flex mr-5 mx-3 align-items-center">
                      <Form.Label className="mb-0">From</Form.Label>
                      <Form.Control
                        className="mx-2"
                        type="date"
                        placeholder="Date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="d-inline-flex mr-5 mx-3 align-items-center">
                      <Form.Label className="mb-0">To</Form.Label>
                      <Form.Control
                        className="mx-2"
                        type="date"
                        placeholder="Date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
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
              <Card.Title as="h5">Receipt Wise Sales</Card.Title>
              <Button variant="primary" onClick={handlePrint} className="float-right">
                Print
              </Button>
              <Button variant="primary" onClick={downloadCSV} className="float-right">
                Export CSV
              </Button>
            </Card.Header>
            <Card.Body ref={tableRef}>
              <div className="print-header">
                <h5>Sales and Profit Report</h5>
                <p>Date Range: {fromDate} to {toDate}</p>
              </div>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Finished Good Name</th>
                    <th>Quantity</th>
                    <th>Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      {/* <td>{getFinishedGoodName(item.finishedGoodId)} ({getFinishedGoodSize(item.finishedGoodId)})</td> */}
                      <td>
                        {getFinishedGoodName(item.finishedGoodId)}
                        {getFinishedGoodSize(item.finishedGoodId) && ` (${getFinishedGoodSize(item.finishedGoodId)})`}
                      </td>

                      <td>{item.finishedgoodQty}</td>
                      <td>{item.sale}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="2" style={{ textAlign: 'right' }}>Total:</th>
                    <th>{totalQuantity}</th>
                    <th>{totalSales}</th>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>

          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SalesProfit;
