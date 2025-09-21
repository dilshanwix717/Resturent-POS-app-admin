import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Modal, Button } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import { BsFillPrinterFill } from "react-icons/bs";
import GRNPrintForm from '../GRNPrintForm';
import ReactToPrint from 'react-to-print';

const CompletePurchase = () => {

  const [grns, setGrns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const [shops, setShops] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPrint, setShowPrint] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);

  const printRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = storedUser.role;
    const userCompanyId = storedUser.companyId;
    const userShopId = storedUser.shopId;
  
    newRequest.get('/grns')
      .then(response => {
        let filteredGrns = response.data.grns;
        filteredGrns = filteredGrns.slice().reverse();
  
        if (userRole === 'admin' || userRole === 'stockManager') {
          filteredGrns = filteredGrns.filter(grn => 
            grn.companyId === userCompanyId && grn.shopId === userShopId
          );
        }
        setGrns(filteredGrns);
      })
      .catch(error => {
        console.error('Error fetching GRNs data:', error);
      });

    newRequest.get('/shops').then(response => setShops(response.data));
    newRequest.get('/suppliers').then(response => setSuppliers(response.data));
    newRequest.get('/companies').then(response => setCompanies(response.data));
    newRequest.get('/users').then(response => setUsers(response.data));
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getShopName = (shopId) => shops.find(shop => shop.shopId === shopId)?.shopName || 'Unknown Shop';
  const getSupplierName = (supplierId) => suppliers.find(supplier => supplier.supplierId === supplierId)?.supplierName || 'Unknown Supplier';
  const getCompanyName = (companyId) => companies.find(company => company.companyId === companyId)?.companyName || 'Unknown Company';
  const getUserName = (userId) => users.find(user => user.userId === userId)?.name || 'Unknown User';

  const filteredGRNs = grns.filter(grn => 
    grn.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCompanyName(grn.companyId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getShopName(grn.shopId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSupplierName(grn.supplierId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserName(grn.createdBy).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedGRNs = filteredGRNs.filter(grn => grn.transactionStatus === 'Completed');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGRNs = completedGRNs.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(completedGRNs.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemClick = (grn) => {
    setSelectedGRN(grn);
    setShowPrint(true);
  };

  const handlePrintClose = () => {
    setShowPrint(false);
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Complete GRN</Card.Title>
            <Row>
              <Col></Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Search GRN by name"
                  className="mb-3"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Shop</th>
                  <th>GRN Code</th>
                  <th>Company</th>
                  <th>Supplier</th>
                  <th>Created by</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentGRNs.map((grn, index) => (
                  <tr key={grn.transactionCode}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{getShopName(grn.shopId)}</td>
                    <td>{grn.transactionCode}</td>
                    <td>{getCompanyName(grn.companyId)}</td>
                    <td>{getSupplierName(grn.supplierId)}</td>
                    <td>{getUserName(grn.createdBy)}</td>
                    <td>{new Date(grn.transactionDateTime).toLocaleDateString()}</td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => handleItemClick(grn)}>
                        <BsFillPrinterFill />
                      </Button>
                      <Button variant="success" size="sm" className="ml-2">
                        Complete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="pagination">
              <Button variant="light" onClick={handlePrevPage} disabled={currentPage === 1}>
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
              <Button variant="light" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>

          </Card.Body>
        </Card>
      </Row>

      <Modal show={showPrint} onHide={handlePrintClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>GRN Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GRNPrintForm ref={printRef} grn={selectedGRN} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrintClose}>
            Close
          </Button>
          <ReactToPrint
            trigger={() => <Button variant="primary">Print</Button>}
            content={() => printRef.current}
          />
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default CompletePurchase;
