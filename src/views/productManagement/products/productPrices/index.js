import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import Select from 'react-select';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import newRequest from '../../../../utils/newRequest';
import './index.scss';

const ProductPrices = () => {
  const [products, setProducts] = useState([]);
  const [showPanelCreateProductPrice, setShowPanelCreateProductPrice] = useState(false);
  const [showPanelEditProductPrice, setShowPanelEditProductPrice] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProductPrice, setSelectedProductPrice] = useState('');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [filteredProductPrices, setFilteredProductPrices] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredActiveShops, setFilteredActiveShops] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedSellingType, setSelectedSellingType] = useState('');
  const [selectedSellingTypeId, setSelectedSellingTypeId] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productPrices, setProductPrices] = useState([]);
  const [sellingTypes, setSellingTypes] = useState('');
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filteredShops, setFilteredShops] = useState([]);
  const [filteredSellingTypes, setFilteredSellingTypes] = useState([]);

  const panelCreateProductPriceRef = useRef(null);
  const panelEditProductPriceRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser.role;
  const userCompany = currentUser.companyId;
  const userShop = currentUser.shopId;

  // const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

  // const glowButtons = buttonGlowVariants.map((variant, idx) => (
  //   <OverlayTrigger key={idx} placement="top" overlay={<Tooltip className="mb-2">{variant}</Tooltip>}>
  //     <Button className={'text-capitalize my-2 btn' + variant} variant={'light'}>
  //       {variant}
  //     </Button>
  //   </OverlayTrigger>
  // ));  

  const [productPrice, setProductPrice] = useState({
    productName: '',
    category: '',
    shop: [],
    sellingType: '',
    sellingPrice: '',
    sellingTypeCommission: '',
  });

  useEffect(() => {
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
        console.error('Error fetching categories:', error);
      }
    };

    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        setShops(response.data);
        setFilteredActiveShops(response.data.filter(shop => shop.toggle === 'enable'));
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    const fetchSellingTypes = async () => {
      try {
        const response = await newRequest.get('/sellingTypes');
        setSellingTypes(response.data.filter(sellingType => sellingType.toggle === 'enable'));
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    const fetchProductPrices = async () => {
      try {
        const response = await newRequest.get('/prices');
        const allProductPrices = response.data;

        // Filter productPrices if user is a superAdmin
        if (userRole === 'superAdmin') {
          const filteredForSuperAdmin = allProductPrices.filter(
            productPrice => productPrice.companyId === userCompany
          );
          setFilteredProductPrices(filteredForSuperAdmin);
        } else if (userRole === 'admin') {
          const filteredForAdmin = allProductPrices.filter(
            productPrice => productPrice.shopId === userShop // Assuming shopID is the identifier for productPrices related to the shop
          );
          setFilteredProductPrices(filteredForAdmin);
        } else if (userRole === 'stockManager') {
          const filteredForAdmin = allProductPrices.filter(
            productPrice => productPrice.shopId === userShop // Assuming shopID is the identifier for productPrices related to the shop
          );
          setFilteredProductPrices(filteredForAdmin);
        } else {
          setFilteredProductPrices(allProductPrices);
        }

        setProductPrices(allProductPrices); // Store all productPrices regardless of role
      } catch (error) {
        console.error('Error fetching productPrices:', error);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await newRequest.get('/companies');
        setCompanies(response.data);
        setFilteredCompanies(response.data.filter(company => company.toggle === 'enable'));
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    const fetchUsers = async () => { // Fetch users data
      try {
        const response = await newRequest.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchProducts();
    fetchCategories();
    fetchShops();
    fetchSellingTypes();
    fetchCompanies();
    fetchUsers();
    fetchProductPrices();
  }, [currentUser.id]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductPrices = filteredProductPrices.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredProductPrices.length / itemsPerPage);

  //user stays in the same pagination page, although page is refreshed
  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    setCurrentPage(savedPage ? parseInt(savedPage, 10) : 1);

    // existing fetch functions
  }, [currentUser.userId]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

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

  useEffect(() => {
    console.log("Comapny: ", selectedCompany);
  }, [selectedCompany]);

  //Close popups
  const handleClose = () => {
    setShowPanelCreateProductPrice(false);
    setShowPanelEditProductPrice(false);
  }

  const handleProductSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchProductQuery(query);

    // Filter products based on name
    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(query)
    );

    // Extract filtered product IDs
    const filteredProductIds = filteredProducts.map(product => product.productId);

    // Filter product prices based on filtered product IDs
    setFilteredProductPrices(
      productPrices.filter(productPrice =>
        filteredProductIds.includes(productPrice.productId) && productPrice.shopId === userShop // Use productId for filtering
      )
    );
  };

  const handleProductSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedProductId(selectedOption.value);
      setSelectedProduct(selectedOption);

      const selectedProductData = products.find(product => product.productId === selectedOption.value);
      if (selectedProductData) {
        setSelectedCategoryId(selectedProductData.categoryId);
        setSelectedCompanyId(selectedProductData.companyId);
      }
    } else {
      // Handle case when selection is cleared
      setSelectedProductId(null);
      setSelectedProduct(null);
      setSelectedCategoryId(null);
      setSelectedCompanyId(null);
    }
  };

  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption ? selectedOption.value : null);
    setSelectedCompany(selectedOption);

    // Filter shops based on the selected company
    if (selectedOption) {
      const filteredCompanies = filteredActiveShops.filter(shop => shop.companyId === selectedOption.value);
      setFilteredShops(filteredCompanies);
    } else {
      setFilteredShops([]); // Clear shops when no company is selected
    }
  };

  const handleShopSelect = (selectedOption) => {
    setSelectedShopId(selectedOption.value);
    setSelectedShop(selectedOption);

    // Filter selling types based on the selected shop's ID
    const filteredSellingTypes = sellingTypes.filter(
      (sellingType) => sellingType.shopId === selectedOption.value
    );
    setFilteredSellingTypes(filteredSellingTypes);
  };

  const handleSellingTypeSelect = (selectedOption) => {
    setSelectedSellingTypeId(selectedOption.value);
    setSelectedSellingType(selectedOption);
  };

  const validateDiscount = (value) => {
    // Regular expression to check for valid decimal numbers with exactly two decimal places
    const decimalPattern = /^\d+(\.\d{2})$/;
    // Regular expression to check for valid percentage values with or without decimal places
    const percentagePattern = /^\d+(\.\d{2})?%$/;

    if (decimalPattern.test(value)) {
      // Valid decimal number with exactly two decimal places
      return true;
    } else if (percentagePattern.test(value)) {
      // Valid percentage value with optional two decimal places
      return true;
    }

    return false;
  };

  // Function to validate selling type commission values
  const validateSellingTypeCommission = (value) => {
    // Regular expression for selling type commission, allowing + or - and exactly two decimal places
    const commissionPattern = /^[+-]\d+(\.\d{2})%?$/;

    if (commissionPattern.test(value)) {
      return true;
    }

    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate discount field
    if (name === 'discount') {
      if (!validateDiscount(value)) {
        // Handle invalid input, e.g., set an error state or show a message
        console.error('Invalid discount format');
      }
    }

    setProductPrice((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePanelCreateProductPrice = () => {
    setShowPanelCreateProductPrice(!showPanelCreateProductPrice);
    if (!showPanelCreateProductPrice) {
      setProductPrice({
        // barcode: '',
        categoryId: '',
        shopId: [],
        companyId: '',
      });

      setSelectedCategoryId('');
      setSelectedProduct('');
      setSelectedSellingType('');

      setSelectedShopId(currentUser.shopId);
      setSelectedCompanyId(currentUser.companyId);

      if (userRole === 'admin' || userRole === 'stockManager') {
        const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
        setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);

        const selectedShop = shops.find(shop => shop.shopId === currentUser.shopId);
        setSelectedShop(selectedShop ? { value: currentUser.shopId, label: selectedShop.shopName } : null);

        // Filter selling types based on the selected shop's ID
        const filteredSellingTypes = sellingTypes.filter(
          (sellingType) => sellingType.shopId === currentUser.shopId
        );
        setFilteredSellingTypes(filteredSellingTypes);
      } else if (userRole === 'superAdmin') {
        const selectedCompany = companies.find(company => company.companyId === productPrice.companyId);
        setSelectedCompany(selectedCompany ? { value: productPrice.companyId, label: selectedCompany.companyName } : null);

        const selectedShop = shops.find(shop => shop.shopId === productPrice.shopId);
        setSelectedShop(selectedShop ? { value: productPrice.shopId, label: selectedShop.shopName } : null);
      }
    }
  };

  const togglePanelEditProductPrice = (productPrice) => {
    setSelectedProductPrice(productPrice);
    setSelectedProductId(productPrice.productId);
    setSelectedCategoryId(productPrice.categoryId);
    setSelectedSellingTypeId(productPrice.sellingTypeId);

    const selectedProduct = products.find(product => product.productId === productPrice.productId);
    setSelectedProduct(selectedProduct ? { value: selectedProduct.productId, label: selectedProduct.name } : null);

    if (userRole === 'admin' || userRole === 'stockManager') {
      const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
      const selectedShop = shops.find(shop => shop.shopId === currentUser.shopId);
      setSelectedShop(selectedShop ? { value: currentUser.shopId, label: selectedShop.shopName } : null);
    } else if (userRole === 'superAdmin') {
      const selectedCompany = companies.find(company => company.companyId === productPrice.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);

      const selectedShop = shops.find(shop => shop.shopId === productPrice.shopId);
      setSelectedShop(selectedShop ? { value: productPrice.shopId, label: selectedShop.shopName } : null);
    }

    const selectedSellingType = sellingTypes.find(sellingType => sellingType.sellingTypeId === productPrice.sellingTypeId);
    setSelectedSellingType(selectedSellingType ? { value: selectedSellingType.sellingTypeId, label: selectedSellingType.sellingType } : null);

    // Check if discountDateRange is present
    if (productPrice.discountDateRange) {
      // Parse the discountDateRange from the database
      const discountDateRange = productPrice.discountDateRange;
      const [from, to] = discountDateRange.split(" to:");
      const fromDate = from.split("From:")[1];
      const toDate = to;

      setFromDate(fromDate);
      setToDate(toDate);
    } else {
      // If no date range, clear the date states
      setFromDate('');
      setToDate('');
    }

    const filteredShops = filteredActiveShops.filter(shop => shop.companyId === productPrice.companyId);
    setFilteredShops(filteredShops);

    const filteredSellingTypes = sellingTypes.filter(sellingType => sellingType.shopId === productPrice.shopId);
    setFilteredSellingTypes(filteredSellingTypes);

    setProductPrice({
      productName: productPrice.productId,
      category: productPrice.categoryId,
      shop: productPrice.shopId,
      sellingType: productPrice.sellingType,
      sellingPrice: productPrice.sellingPrice,
      discount: productPrice.discount,
      sellingTypeCommission: productPrice.sellingTypeCommission,
    });

    //setSelectedCompany(selectedCompany);
    setSelectedCompanyId(productPrice.companyId);
    //setSelectedShop(selectedShop);
    setSelectedShopId(productPrice.shopId);
    setShowPanelEditProductPrice(true);
  };

  const handleCreateProductPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(productPrice.sellingPrice);
      console.log(productPrice.sellingTypeCommission);
      console.log(productPrice.sellingPrice);

      // Validate discount field
      if (!validateDiscount(productPrice.discount)) {
        console.error('Invalid discount format');
        return;
      }

      // Validate selling type commission field
      if (!validateSellingTypeCommission(productPrice.sellingTypeCommission)) {
        console.error('Invalid selling type commission format');
        return;
      }

      if (!selectedCategoryId || !selectedCompanyId || !selectedShopId || !currentUser.userId) {
        console.error('Required fields are missing.');
        return;
      }

      // Create discountDateRange string
      const discountDateRange = `From:${fromDate} to:${toDate}`;

      await newRequest.post("/prices/create", {
        ...productPrice,
        categoryId: selectedCategoryId,
        companyId: selectedCompanyId,
        productId: selectedProductId,
        shopId: selectedShopId,
        sellingTypeId: selectedSellingTypeId,
        discountDateRange: discountDateRange,
        userId: currentUser.userId,
      });

      console.log("Product price created successfully!");

      window.location.reload(); // Reload the browser

      // Clear form inputs and state
      setProductPrice({
        productName: '',
        categoryId: '',
        shopId: [],
        companyId: '',
      });
      setSelectedCategoryId('');
      setSelectedCompanyId('');
      setSelectedShop('');
      setFromDate(''); // Clear the date range fields
      setToDate('');

      setShowPanelEditProductPrice(false);
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const handleEditProductPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate discount field
      if (!validateDiscount(productPrice.discount)) {
        console.error('Invalid discount format');
        return;
      }

      // Validate selling type commission field
      if (!validateSellingTypeCommission(productPrice.sellingTypeCommission)) {
        console.error('Invalid selling type commission format');
        return;
      }

      if (!selectedCategoryId || !selectedCompanyId || !selectedShopId || !currentUser.userId) {
        console.log(selectedCategoryId, selectedCompanyId, selectedShopId, currentUser.userId);
        console.error('Required fields are missing.');
        return;
      }

      // Create discountDateRange string
      const discountDateRange = `From:${fromDate} to:${toDate}`;

      const response = await newRequest.put(`/prices/update/${selectedProductPrice.priceId}`, {
        ...productPrice,
        categoryId: selectedCategoryId,
        companyId: selectedCompanyId,
        productId: selectedProductId,
        shopId: selectedShopId,
        sellingTypeId: selectedSellingTypeId,
        discountDateRange: discountDateRange,
        userId: currentUser.userId,
      });

      if (response.status === 200) {
        console.log("Product price updated successfully!");
        // Handle success (e.g., refresh data, show success message)
      } else {
        console.error('Failed to update product price:', response.data.message);
      }

      window.location.reload(); // Reload the browser

      // Clear form inputs and state
      setProductPrice({
        productName: '',
        categoryId: '',
        shopId: [],
        companyId: '',
      });
      setSelectedCategoryId('');
      setSelectedCompanyId('');
      setSelectedShopId('');
      setSelectedShop('');
      setFromDate(''); // Clear the date range fields
      setToDate('');

      setShowPanelEditProductPrice(false);
    } catch (err) {
      console.error('Error updating product price:', err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.name : '-'; // Return user name if found, otherwise '-'
  };

  // Filter products to exclude "Raw Material" regardless of case
  const filteredProducts = products.filter(product => product.productType.toLowerCase() !== "raw material" && product.activeShopIds.includes(userShop));

  const getCreatedByUserName = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? user.name : '-'; // Return user name if found, otherwise '-'
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(category => category.categoryId === categoryId);
    return category ? category.categoryName : '-'; // Return user name if found, otherwise '-'
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(company => company.companyId === companyId);
    return company ? company.companyName : '-'; // Return user name if found, otherwise '-'
  };

  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.shopId === shopId);
    return shop ? shop.shopName : '-'; // Return user name if found, otherwise '-'
  };

  const getSellingTypeName = (sellingTypeId) => {
    const sellingType = sellingTypes.find(sellingType => sellingType.sellingTypeId === sellingTypeId);
    return sellingType ? sellingType.sellingType : '-'; // Return user name if found, otherwise '-'
  };

  const getProductSize = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.size : '-'; // Return user name if found, otherwise '-'
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Product Prices</Card.Title>
            <Row>
              <Col>
                <Button onClick={togglePanelCreateProductPrice} className="btn-create-product shadow-1 mb-4" variant="primary">
                  Create Product Price
                </Button>
              </Col>
              <Col>
                <Form.Control type="text" placeholder="Search Products by name" className="mb-3" onChange={handleProductSearch} value={searchProductQuery} />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Category</th>
                  <th>Company</th>
                  <th>Shop</th>
                  {/* <th>Empty Bottle Deposit</th> */}
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Selling Type Commission</th>
                  <th>Selling Type</th>
                  <th>Discount Data Range</th>
                  <th>Created Date</th>
                  <th>Created By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentProductPrices.map((productPrice, index) => {
                  return (
                    <tr key={productPrice.priceId}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{getProductName(productPrice.productId)}</td>
                      <td>{getProductSize(productPrice.productId)}</td>
                      <td>{getCategoryName(productPrice.categoryId)}</td>
                      <td>{getCompanyName(productPrice.companyId)}</td>
                      <td>{getShopName(productPrice.shopId)}</td>
                      <td>{productPrice.sellingPrice}</td>
                      <td>{productPrice.discount}</td>
                      <td>{productPrice.sellingTypeCommission}</td>
                      <td>{getSellingTypeName(productPrice.sellingTypeId)}</td>
                      <td>{productPrice.discountDateRange}</td>
                      <td>{new Date(productPrice.createdAt).toLocaleDateString()}</td>
                      <td>{getCreatedByUserName(productPrice.createdBy)}</td>
                      <td>
                        <EditIcon className='edit-icon' onClick={() => togglePanelEditProductPrice(productPrice)} />
                      </td>
                    </tr>
                  )
                })}
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


            {/* <Row>
                <Col>
                  <span>{glowButtons}</span>
                </Col>
              </Row> */}

            {showPanelCreateProductPrice && (
              <div className="panel-create-product-price-popup">
                <Card className='panel-create-product-price' ref={panelCreateProductPriceRef}>
                  <Card.Header className='popup-header'>
                    <Card.Title as="h5">Create Product Price</Card.Title>
                    <CloseIcon onClick={handleClose} className='close-icon' />
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateProductPriceSubmit}>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Product</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredProducts.map(product => ({ value: product.productId, label: `${product.name} - ${product.size}` }))}
                            onChange={handleProductSelect}
                            value={selectedProduct}
                            placeholder="Select product"
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Company</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                            onChange={handleCompanySelect}
                            value={selectedCompany}
                            placeholder="Select Company"
                            isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Shop</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredShops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                            onChange={handleShopSelect}
                            value={selectedShop}
                            placeholder="Select shop"
                            isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Selling Type</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredSellingTypes.map(sellingType => ({
                              value: sellingType.sellingTypeId,
                              label: sellingType.sellingType,
                            }))}
                            onChange={handleSellingTypeSelect}
                            value={selectedSellingType}
                            placeholder="Select selling type"
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                        <Form.Label column sm={3}>
                          Product Price
                        </Form.Label>
                        <Col sm={9}>
                          <Form.Control name="sellingPrice" value={productPrice.sellingPrice} type="number" onChange={handleChange} required />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                        <Form.Label column sm={3}>
                          Discount
                        </Form.Label>
                        <Col sm={9}>
                          <Form.Control name="discount" placeholder='0.00 or 0.00%' value={productPrice.discount} type="text" onChange={handleChange} isInvalid={!validateDiscount(productPrice.discount)} required />

                          <Form.Control.Feedback type="invalid">
                            Please enter a valid discount (e.g., 12.34 or 12.34%).
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label column>
                            Discount Date Range
                          </Form.Label>
                        </Col>
                        <Col className='date-range mb-4' lg={9} md={9} sm={9} col={9}>
                          <Form.Label className="mb-0">From</Form.Label>
                          <Form.Control
                            className="mx-2"
                            type="date"
                            placeholder="From Date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                          />

                          <Form.Label className="mb-0">To</Form.Label>
                          <Form.Control
                            className="mx-2 to-date"
                            type="date"
                            placeholder="To Date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Selling Type Commission</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Form.Control
                            name="sellingTypeCommission"
                            value={productPrice.sellingTypeCommission}
                            type="text"
                            onChange={handleChange}
                            isInvalid={!validateSellingTypeCommission(productPrice.sellingTypeCommission)}
                            placeholder='+12.34 or -12.34'
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter a valid commission (e.g., +12.34 or -12.34).
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row}>
                        <Col sm={{ span: 10, offset: 0 }}>
                          <Button type='submit'>Save</Button>
                          {/* <Button>New</Button> */}
                        </Col>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </div>
            )}

            {showPanelEditProductPrice && (
              <div className="panel-edit-product-price-popup">
                <Card className='panel-edit-product-price' ref={panelEditProductPriceRef}>
                  <Card.Header className='popup-header'>
                    <Card.Title as="h5">Edit Product Price</Card.Title>
                    <CloseIcon onClick={handleClose} className='close-icon' />
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleEditProductPriceSubmit}>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Product</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredProducts.map(product => ({ value: product.productId, label: `${product.name} - ${product.size}` }))}
                            onChange={handleProductSelect}
                            value={selectedProduct}
                            placeholder="Select product"
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Company</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                            onChange={handleCompanySelect}
                            value={selectedCompany}
                            placeholder="Select company"
                            isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Shop</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredShops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                            onChange={handleShopSelect}
                            value={selectedShop}
                            placeholder="Select shop"
                            isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Selling Type</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Select
                            options={filteredSellingTypes.map(sellingType => ({
                              value: sellingType.sellingTypeId,
                              label: sellingType.sellingType,
                            }))}
                            onChange={handleSellingTypeSelect}
                            value={selectedSellingType}
                            placeholder="Select selling type"
                            isClearable
                            required
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                        <Form.Label column sm={3}>
                          Product Price
                        </Form.Label>
                        <Col sm={9}>
                          <Form.Control name="sellingPrice" type="number" value={productPrice.sellingPrice} onChange={handleChange} required />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                        <Form.Label column sm={3}>
                          Discount
                        </Form.Label>
                        <Col sm={9}>
                          <Form.Control name="discount" value={productPrice.discount} type="text" onChange={handleChange} isInvalid={!validateDiscount(productPrice.discount)} required />

                          <Form.Control.Feedback type="invalid">
                            Please enter a valid discount (e.g., 12.34 or 12.34%).
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label column>
                            Discount
                          </Form.Label>
                        </Col>
                        <Col className='date-range mb-4' lg={9} md={9} sm={9} col={9}>
                          <Form.Label className="mb-0">From</Form.Label>
                          <Form.Control
                            className="mx-2"
                            type="date"
                            placeholder="From Date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                          />

                          <Form.Label className="mb-0">To</Form.Label>
                          <Form.Control
                            className="mx-2"
                            type="date"
                            placeholder="To Date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                        <Col lg={3} md={3} sm={3} col={3}>
                          <Form.Label>Selling Type Commission</Form.Label>
                        </Col>
                        <Col lg={9} md={9} sm={9} col={9}>
                          <Form.Control
                            name="sellingTypeCommission"
                            value={productPrice.sellingTypeCommission}
                            type="text"
                            onChange={handleChange}
                            isInvalid={!validateSellingTypeCommission(productPrice.sellingTypeCommission)}
                            placeholder='+12.34 or -12.34'
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter a valid commission (e.g., +12.34 or -12.34).
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group className="mb-3" as={Row}>
                        <Col sm={{ span: 10, offset: 0 }}>
                          <Button type='submit'>Save</Button>
                          {/* <Button>New</Button> */}
                        </Col>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Card.Body>
        </Card>
      </Row>
    </React.Fragment>
  );
};

export default ProductPrices;