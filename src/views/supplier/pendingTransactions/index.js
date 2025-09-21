import React, { useState, useEffect } from 'react';
import { Row, Table, Card, Button } from 'react-bootstrap';
import './index.scss';
import newRequest from '../../../utils/newRequest';
import { useLocation } from 'react-router-dom';

const PendingTransactions = () => {
  const [shops, setShops] = useState([]);
  const [companies, setCompanies] = useState([]);

  const location = useLocation();
  const { supplier } = location.state || {};
  const [grns, setGrns] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));

    newRequest.get(`/grns/supplier/grn-details/${storedUser.companyId}/${storedUser.shopId}/${supplier.supplierId}`)
      .then(response => {
        // Ensure grnsData is an array and filter for "Pending" transactions
        const grnsData = response.data.grnHeader || [];
        const pendingGrns = grnsData.filter(grn => grn.transactionStatus === 'Pending');
        setGrns(pendingGrns);
      })
      .catch(error => {
        console.error('Error fetching GRNs data:', error);
      });
  }, [ supplier ]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await newRequest.get('/companies');
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGrns = grns.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(grns.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.shopId === shopId);
    return shop ? shop.shopName : '-'; // Return shop name if found, otherwise '-'
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(company => company.companyId === companyId);
    return company ? company.companyName : '-'; // Return company name if found, otherwise '-'
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Pending GRNs</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Transaction Code</th>
                      <th>Transaction Date</th>
                      <th>Shop</th>
                      <th>Company</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGrns.map((grn, index) => (
                        <tr key={grn._id}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{grn.transactionCode}</td>
                            <td>{new Date(grn.transactionDateTime).toLocaleDateString()}</td>
                            <td>{getShopName(grn.shopId)}</td>
                            <td>{getCompanyName(grn.companyId)}</td>
                            <td>{grn.totalCost}</td>
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
    </React.Fragment>
  );
};

export default PendingTransactions;
