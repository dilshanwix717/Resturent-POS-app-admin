import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import newRequest from '../../../../utils/newRequest';
import './index.scss';
import Select from 'react-select';

const InventoryStock = () => {

  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser.role;
  const userCompany = currentUser.companyId;
  // const userShop = currentUser.shopId;
  const [categoryList, setCategoryList] = useState([]);
  const [filteredStocksByCategory, setFilteredStocksByCategory] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState({ label: "All Categories", value: "all" });

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await newRequest.get('/products/product-stock/all');
        const allStocks = response.data;

        // Filter stocks if user is a superAdmin
        if (userRole === 'superAdmin' || userRole === 'admin' || userRole === 'stockManager') {
          const filteredForSuperAdmin = allStocks.filter(
            stock => stock.companyId === userCompany
          );
          setFilteredStocks(filteredForSuperAdmin);
        } else {
          setFilteredStocks([]);
        }

        setStocks(allStocks); // Store all stocks regardless of role
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await newRequest.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await newRequest.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchStocks();
    fetchProducts();
    fetchCategories();
  }, [])

  useEffect(() => {
    const list = [{ label: "All Categories", value: "all" },
    ...categories.map(category => ({
      label: category.categoryName,
      value: category.categoryId
    }))
    ];

    setCategoryList(list);
    setFilteredStocksByCategory(filteredStocks);
    console.log(filteredStocksByCategory);
  }, [filteredStocks]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStocks = filteredStocksByCategory.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredStocksByCategory.length / itemsPerPage);

  // const handlePrevPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  // const handleNextPage = () => {
  //   if (currentPage < totalPages) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  //search the inventory table by product name
  const handleProductSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchProductQuery(query);

    // Filter products based on name
    const filteredStocks = products.filter(product =>
      product.name.toLowerCase().includes(query)
    );

    // Extract filtered product IDs
    const filteredStockIds = filteredStocks.map(product => product.productId);

    // Filter product prices based on filtered product IDs
    setFilteredStocks(
      stocks.filter(stock =>
        filteredStockIds.includes(stock.productId) // Use productId for filtering
      )
    );
  };

  const getProductName = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.name : '-'; // Return user name if found, otherwise '-'
  };

  const getProductSize = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.size : '-'; // Return user name if found, otherwise '-'
  };

  const getProductPLU = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.pluCode : '-'; // Return user name if found, otherwise '-'
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(category => category.categoryId === categoryId);
    return category ? category.categoryName : '-'; // Return user name if found, otherwise '-'
  };

  const handleFilterByCategory = (e) => {
    setSelectedCategoryFilter(e);

    if (e.value === "all") {
      setFilteredStocksByCategory(filteredStocks)
    } else {
      const filteredData = filteredStocks.filter(stock => stock.categoryId === e.value);
      setFilteredStocksByCategory(filteredData);
      console.log(filteredData);
    }
  }

  return (
    <React.Fragment>
      <Row>

        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Product Prices</Card.Title>
              <Row>
                <Col>
                  <Form.Control type="text" placeholder="Search Products by name" className="mb-3" onChange={handleProductSearch} value={searchProductQuery} />
                </Col>

                <Col>
                  <Select
                    options={categoryList}
                    onChange={handleFilterByCategory}
                    value={selectedCategoryFilter}
                    placeholder="Select Category Filter"
                    required
                  />
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Size</th>
                    <th>PLU</th>
                    <th>Category</th>
                    <th>Product Availability</th>
                    {/* <th>Number of Products Available</th> */}
                  </tr>
                </thead>
                <tbody>
                  {currentStocks.map((stock, index) => (
                    <tr key={index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{getProductName(stock.productId)}</td>
                      <td>{getProductSize(stock.productId)}</td>
                      <td>{getProductPLU(stock.productId)}</td>
                      <td>{getCategoryName(stock.categoryId)}</td>
                      <td>{stock.stockDetails.productAvailability ? stock.stockDetails.numberOfProductsAvailable : 'Out of Stock'}</td>
                      {/* <td>{stock.stockDetails.numberOfProductsAvailable}</td> */}
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
      </Row>
    </React.Fragment>
  );
};

export default InventoryStock;
