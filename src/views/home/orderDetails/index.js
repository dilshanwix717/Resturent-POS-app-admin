

import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import PrintableBill from './PrintableBill';
import './index.css';
import ReactDOM from 'react-dom'; // Add this import


const OrderDetails = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    // Helper function to safely format numbers
    const formatNumber = (value) => {
        return typeof value === 'number' ? value.toFixed(2) : '0.00';
    };

    // Helper function to calculate totals safely
    const calculateSubTotal = (items) => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, item) => {
            const qty = item.finishedgoodQty || 0;
            const price = item.sellingPrice || 0;
            return sum + (qty * price);
        }, 0);
    };

    const calculateTotalDiscount = (items) => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, item) => {
            return sum + (item.discountAmount || 0);
        }, 0);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await newRequest.get('/orders');
                const sortedOrders = response.data.sort(
                    (a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime)
                );
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const fetchProductDetails = async (productIds) => {
        const details = {};
        try {
            for (const productId of productIds) {
                const response = await newRequest.get(`/products/${productId}`);
                details[productId] = response.data;
            }
            return details;
        } catch (error) {
            console.error('Error fetching product details:', error);
            return {};
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = orders.filter((order) => {
            const date = new Date(order.transactionDateTime).toLocaleDateString();
            return (
                order.transactionCode.toLowerCase().includes(query) ||
                order.invoiceID.toLowerCase().includes(query) ||
                date.includes(query)
            );
        });

        setFilteredOrders(filtered);
        setCurrentPage(1); // Reset to the first page after filtering
    };

    const handleViewDetails = async (salesID) => {
        try {
            const response = await newRequest.get(`/orders/${salesID}`);
            const order = response.data;

            const productIds = [...new Set(order.finishedGoods.map(item => item.finishedgoodId))];

            const details = await fetchProductDetails(productIds);
            setProductDetails(details);
            setSelectedOrder(order);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handlePrintReceipt = () => {
        const printContent = document.createElement('div');
        ReactDOM.render(
            <PrintableBill
                selectedOrder={selectedOrder}
                productDetails={productDetails}
            />,
            printContent
        );

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Bill</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    };
    return (
        <div>
            <Col sm={12}>
                <Card>
                    <Card.Header>
                        <Card.Title className="mb-3" as="h5">Order Details</Card.Title>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="text"
                                    placeholder="Search Orders"
                                    onChange={handleSearch}
                                    value={searchQuery}
                                />
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Table hover responsive size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Transaction Date</th>
                                    <th>Invoice ID</th>
                                    <th>Transaction ID</th>
                                    <th>Bill Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order, index) => (
                                    <tr key={order._id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{new Date(order.transactionDateTime).toLocaleString()}</td>
                                        <td>{order.invoiceID}</td>
                                        <td>{order.transactionCode}</td>
                                        <td>{order.billTotal}</td>
                                        <td>
                                            <Button onClick={() => handleViewDetails(order.transactionCode)}>
                                                View & Print
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className="pagination">
                            <Button
                                variant="light"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            {/* Calculate Pagination Range */}
                            {totalPages > 6 && currentPage > 3 && (
                                <Button variant="light" onClick={() => setCurrentPage(1)}>1</Button>
                            )}

                            {totalPages > 6 && currentPage > 4 && <span>...</span>}

                            {Array.from({ length: Math.min(6, totalPages) }, (_, index) => {
                                let pageNum;
                                if (totalPages <= 6) {
                                    pageNum = index + 1;
                                } else {
                                    let start = Math.max(1, currentPage - 2);
                                    let end = Math.min(totalPages, start + 5);

                                    pageNum = start + index;
                                    if (pageNum > end) return null;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "primary" : "light"}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            {totalPages > 6 && currentPage < totalPages - 3 && <span>...</span>}

                            {totalPages > 6 && currentPage < totalPages - 2 && (
                                <Button variant="light" onClick={() => setCurrentPage(totalPages)}>{totalPages}</Button>
                            )}

                            <Button
                                variant="light"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            {selectedOrder && (
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="bg-light">
                        <Modal.Title>
                            <div className="d-flex flex-column">
                                <span>Transaction Details</span>
                                <small className="text-muted">Invoice ID: {selectedOrder.invoiceID}</small>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-4">
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <h6 className="mb-3">Transaction Information</h6>
                                            <div className="mb-2">
                                                <strong>Date: </strong>
                                                {selectedOrder.transactionDateTime ?
                                                    new Date(selectedOrder.transactionDateTime).toLocaleString() :
                                                    'N/A'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Transaction ID: </strong>
                                                {selectedOrder.transactionCode || 'N/A'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Payment Method: </strong>
                                                {selectedOrder.paymentMethod || 'Cash'}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="h-100">
                                        <Card.Body>
                                            <h6 className="mb-3">Amount Summary</h6>
                                            <div className="mb-2">
                                                <strong>Sub Total: </strong>
                                                LKR {formatNumber(calculateSubTotal(selectedOrder.finishedGoods))}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Service Charges: </strong>
                                                LKR {formatNumber(selectedOrder.serviceCharges)}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Total Discount: </strong>
                                                LKR {formatNumber(calculateTotalDiscount(selectedOrder.finishedGoods))}
                                            </div>
                                            <div className="mt-3">
                                                <strong>Bill Total: </strong>
                                                <span className=" fs-5">
                                                    LKR {formatNumber(selectedOrder.billTotal)}
                                                </span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Card>
                                <Card.Body>
                                    <h6 className="mb-3">Order Items</h6>
                                    <Table responsive bordered hover size="sm">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Item Name</th>
                                                <th>Size</th>
                                                <th className="text-center">Quantity</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Discount</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedOrder.finishedGoods || []).map((item, index) => {
                                                const product = productDetails[item.finishedgoodId] || {};
                                                const quantity = item.finishedgoodQty || 0;
                                                const unitPrice = item.sellingPrice || 0;
                                                const discount = item.discountAmount || 0;
                                                const total = (quantity * unitPrice) - discount;

                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{product.name || 'N/A'}</td>
                                                        <td>{product.size || '-'}</td>
                                                        <td className="text-center">{quantity}</td>
                                                        <td className="text-end">{formatNumber(unitPrice)}</td>
                                                        <td className="text-end">{formatNumber(discount)}</td>
                                                        <td className="text-end">{formatNumber(total)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="d-none">
                            <PrintableBill selectedOrder={selectedOrder} productDetails={productDetails} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handlePrintReceipt}>
                            Print Receipt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default OrderDetails;
