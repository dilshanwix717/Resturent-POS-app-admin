import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import newRequest from '../../../../utils/newRequest';
import ProductTable from '../../../../components/product/productTable';
import CreateProductForm from '../../../../components/product/CreateProductForm';
import EditProductForm from '../../../../components/product/EditProductForm';
import ErrorModal from '../../../../components/product/ErrorModal';
import './index.scss';

const ProductList = () => {
  // State for panels
  const [showPanelCreateProduct, setShowPanelCreateProduct] = useState(false);
  const [showPanelEditProduct, setShowPanelEditProduct] = useState(false);

  // State for data
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [shops, setShops] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredRawProducts, setFilteredRawProducts] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredActiveShops, setFilteredActiveShops] = useState([]);

  // State for selected product
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for search
  const [searchProductQuery, setSearchProductQuery] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // State for error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser.role;
  const userCompany = currentUser.companyId;
  const userShop = currentUser.shopId;

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await newRequest.get('/products');
        const allProducts = productsResponse.data;

        // Filter products based on user role
        if (userRole === 'superAdmin') {
          setFilteredProducts(allProducts.filter(product => product.companyId === userCompany));
        } else if (userRole === 'admin' || userRole === 'stockManager') {
          setFilteredProducts(allProducts.filter(product => product.activeShopIds.includes(userShop)));
        } else {
          setFilteredProducts(allProducts);
        }

        setProducts(allProducts);

        // Fetch raw products
        const rawMaterials = allProducts
          .filter(product =>
            (['raw material', 'wip'].some(type => product.productType.toLowerCase().includes(type)) && product.toggle === 'enable'))
          .map(product => ({
            value: product.productId,
            label: product.name,
            uomId: product.uomId,
          }));
        setFilteredRawProducts(rawMaterials);

        // Fetch categories
        const categoriesResponse = await newRequest.get('/categories');
        setCategories(categoriesResponse.data);

        // Fetch shops
        const shopsResponse = await newRequest.get('/shops');
        setShops(shopsResponse.data);
        setFilteredActiveShops(shopsResponse.data.filter(shop => shop.toggle === 'enable'));

        // Fetch companies
        const companiesResponse = await newRequest.get('/companies');
        setCompanies(companiesResponse.data);
        setFilteredCompanies(companiesResponse.data.filter(company => company.toggle === 'enable'));

        // Fetch users
        const usersResponse = await newRequest.get('/users');
        setUsers(usersResponse.data);

        // Fetch uoms
        const uomsResponse = await newRequest.get('/uoms');
        setUoms(uomsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Load saved pagination page
    const savedPage = localStorage.getItem("currentPage");
    setCurrentPage(savedPage ? parseInt(savedPage, 10) : 1);
  }, [currentUser.id, userCompany, userRole, userShop]);

  // Save current page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  // Handle product search
  const handleProductSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchProductQuery(query);
    setFilteredProducts(
      products.filter(product => product.name.toLowerCase().includes(query) && product.activeShopIds.includes(userShop))
    );
  };

  // Toggle create product panel
  const togglePanelCreateProduct = () => {
    setShowPanelCreateProduct(!showPanelCreateProduct);
    setShowPanelEditProduct(false);
  };

  // Toggle edit product panel
  const togglePanelEditProduct = async (product) => {
    try {
      const response = await newRequest.get(`/products/${product.productId}`);
      setSelectedProduct(response.data);
      setShowPanelEditProduct(true);
      setShowPanelCreateProduct(false);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  // Close panels
  const handleClose = () => {
    setShowPanelCreateProduct(false);
    setShowPanelEditProduct(false);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle pagination
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

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Products</Card.Title>
            <Row>
              <Col md={6} className="mb-2">
                <Button onClick={togglePanelCreateProduct} className="btn-create-product shadow-1 w-auto px-5" variant="primary">
                  Create Product
                </Button>
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search Products by name"
                  className="mb-2"
                  onChange={handleProductSearch}
                  value={searchProductQuery}
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <ProductTable
              currentProducts={currentProducts}
              indexOfFirstItem={indexOfFirstItem}
              categories={categories}
              companies={companies}
              uoms={uoms}
              users={users}
              togglePanelEditProduct={togglePanelEditProduct}
            />

            <div className="d-flex justify-content-center mt-3 pagination">
              <Button variant="light" onClick={handlePrevPage} disabled={currentPage === 1} className="me-2">
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                // Show 5 pages at most, centered around current page
                let pageNum = currentPage;
                if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'light'}
                      onClick={() => setCurrentPage(pageNum)}
                      className="mx-1"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              <Button variant="light" onClick={handleNextPage} disabled={currentPage === totalPages} className="ms-2">
                Next
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Row>

      {showPanelCreateProduct && (
        <CreateProductForm
          handleClose={handleClose}
          categories={categories}
          companies={companies}
          shops={shops}
          uoms={uoms}
          filteredCompanies={filteredCompanies}
          filteredActiveShops={filteredActiveShops}
          filteredRawProducts={filteredRawProducts}
          products={products}
          currentUser={currentUser}
          userRole={userRole}
          setShowErrorModal={setShowErrorModal}
          setErrorMessage={setErrorMessage}
        />
      )}

      {showPanelEditProduct && selectedProduct && (
        <EditProductForm
          handleClose={handleClose}
          selectedProduct={selectedProduct}
          categories={categories}
          companies={companies}
          shops={shops}
          uoms={uoms}
          filteredCompanies={filteredCompanies}
          filteredActiveShops={filteredActiveShops}
          filteredRawProducts={filteredRawProducts}
          products={products}
          currentUser={currentUser}
          setShowErrorModal={setShowErrorModal}
          setErrorMessage={setErrorMessage}
        />
      )}

      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        errorMessage={errorMessage}
      />
    </React.Fragment>
  );
};

export default ProductList;
