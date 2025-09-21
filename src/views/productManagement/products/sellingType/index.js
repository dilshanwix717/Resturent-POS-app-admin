import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import Select from 'react-select';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import newRequest from '../../../../utils/newRequest';
import './index.scss';

const SellingType = () => {
  const [showPanelCreateSellingType, setShowPanelCreateSellingType] = useState(false);
  const [showPanelEditSellingType, setShowPanelEditSellingType] = useState(false);
  const [selectedSellingType, setSelectedSellingType] = useState('');
  const [selectedCompany, setSelectedCompany] = useState([]);
  const [searchSellingTypeQuery, setSearchSellingTypeQuery] = useState('');
  const [filteredSellingTypes, setFilteredSellingTypes] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredActiveShops, setFilteredActiveShops] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [companies, setCompanies] = useState([]);
  const [sellingTypes, setSellingTypes] = useState([]);
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [ServiceDelivery, setServiceDelivery] = useState(null);
  const [filteredShops, setFilteredShops] = useState([]);

  const panelCreateSellingTypeRef = useRef(null);
  const panelEditSellingTypeRef = useRef(null);

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

  const [sellingType, setSellingType] = useState({
    category: '',
    shop: '',
    sellingType: '',
    sellingTypeAmount: '',
    additionDeduction: '',
  });

  const getBadgeVariantAndText = (toggle) => {
    return toggle === 'enable' ? { variant: 'success', text: 'Active' } : { variant: 'danger', text: 'Inactive' };
  }; 

  useEffect(() => {

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
          const allSellingTypes = response.data;

          // Filter sellingTypes if user is a superAdmin
          if (userRole === 'superAdmin') {
              const filteredForSuperAdmin = allSellingTypes.filter(
                  sellingType => sellingType.companyId === userCompany
              );
              setFilteredSellingTypes(filteredForSuperAdmin);
          } else if (userRole === 'admin') {
            const filteredForAdmin = allSellingTypes.filter(
                sellingType => sellingType.shopId === userShop // Assuming shopID is the identifier for sellingTypes related to the shop
            );
            setFilteredSellingTypes(filteredForAdmin);
          } else if (userRole === 'stockManager') {
            const filteredForAdmin = allSellingTypes.filter(
                sellingType => sellingType.shopId === userShop // Assuming shopID is the identifier for sellingTypes related to the shop
            );
            setFilteredSellingTypes(filteredForAdmin);
          } else {
              setFilteredSellingTypes(allSellingTypes);
          }

          setSellingTypes(allSellingTypes); // Store all sellingTypes regardless of role
      } catch (error) {
          console.error('Error fetching sellingTypes:', error);
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

    fetchShops();
    fetchCompanies();
    fetchUsers();
    fetchSellingTypes();
  }, [currentUser.id]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellingTypes = filteredSellingTypes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredSellingTypes.length / itemsPerPage);

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

  //Close popups
  const handleClose = () => {
    setShowPanelCreateSellingType(false);
    setShowPanelEditSellingType(false);
  }

  const handleSellingTypeSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchSellingTypeQuery(query);
    setFilteredSellingTypes(
      sellingTypes.filter(sellingType => sellingType.sellingType.toLowerCase().includes(query) && sellingType.shopId === userShop)
    );
  };  

  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption ? selectedOption.value : null);
    setSelectedCompany(selectedOption);
    
    // Filter shops based on the selected company
    if (selectedOption) {
      const filtered = filteredActiveShops.filter(shop => shop.companyId === selectedOption.value);
      setFilteredShops(filtered);
    } else {
      setFilteredShops([]); // Clear shops when no company is selected
    }
  }; 

  const handleShopSelect = (selectedOption) => {
    setSelectedShopId(selectedOption.value);
    setSelectedShop(selectedOption);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'additionDeduction') {
      // Set the value regardless of validity
      setSellingType(prevSellingType => ({
        ...prevSellingType,
        [name]: value,
      }));
  
      // Optionally, validate and show a message if invalid
      if (!validateAdditionDeduction(value)) {
        // Handle invalid value (e.g., show a message or set an error state)
      }
    } else {
      setSellingType(prevSellingType => ({
        ...prevSellingType,
        [name]: value,
      }));
    }
  };
  
  const validateAdditionDeduction = (value) => {
    // Regular expression to match numbers with a leading + or - and exactly 2 decimal places
    const regex = /^[+-]\d+\.\d{2}$/;
    return regex.test(value) || value === ''; // Allow empty value for valid input
  };      

  const handleServiceDeliveryChange = (selectedOption) => {
    setServiceDelivery(selectedOption ? selectedOption : null);
  };

  const togglePanelCreateSellingType = () => {
    setShowPanelCreateSellingType(!showPanelCreateSellingType);
    if (!showPanelCreateSellingType) {
      setSellingType({
        category: '',
        shop: '',
        sellingType: '',
        sellingTypeAmount: '',
        additionDeduction: '',
        });

      setSelectedShopId(currentUser.shopId);
    }

    if (userRole === 'admin' || userRole === 'stockManager') {
      const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
      setSelectedCompanyId(currentUser.companyId);
      
      const selectedShop = shops.find(shop => shop.shopId === currentUser.shopId);
      setSelectedShop(selectedShop ? { value: currentUser.shopId, label: selectedShop.shopName } : null);
      setSelectedShopId(currentUser.shopId);

    } else if (userRole === 'superAdmin') {
      const selectedCompany = companies.find(company => company.companyId === sellingType.companyId);
      setSelectedCompany(selectedCompany ? { value: sellingType.companyId, label: selectedCompany.companyName } : null);
      setSelectedCompanyId(sellingType.companyId);
      
      const selectedShop = shops.find(shop => shop.shopId === sellingType.shopId);
      setSelectedShop(selectedShop ? { value: sellingType.shopId, label: selectedShop.shopName } : null);
      setSelectedShopId(sellingType.shopId);
    }
  };

  const togglePanelEditSellingType = (sellingType) => {
    setSelectedSellingType(sellingType);
    setSelectedCompanyId(currentUser.companyId);
    setSelectedShopId(currentUser.shopId);

    if (userRole === 'admin' || userRole === 'stockManager') {
      const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
      
      const selectedShop = shops.find(shop => shop.shopId === currentUser.shopId);
      setSelectedShop(selectedShop ? { value: currentUser.shopId, label: selectedShop.shopName } : null);
    } else if (userRole === 'superAdmin') {
      const selectedCompany = companies.find(company => company.companyId === sellingType.companyId);
      setSelectedCompany(selectedCompany ? { value: sellingType.companyId, label: selectedCompany.companyName } : null);
      
      const selectedShop = shops.find(shop => shop.shopId === sellingType.shopId);
      setSelectedShop(selectedShop ? { value: sellingType.shopId, label: selectedShop.shopName } : null);
    }

    const filtered = filteredActiveShops.filter(shop => shop.companyId === sellingType.companyId);
    setFilteredShops(filtered);

    setSellingType({
      sellingType: sellingType.sellingType,
      sellingTypeAmount: sellingType.sellingTypeAmount,
      additionDeduction: sellingType.additionDeduction,
      toggle: sellingType.toggle,
    });
  
    setShowPanelEditSellingType(true);
    setServiceDelivery(sellingType.ServiceDelivery ? { value: sellingType.ServiceDelivery, label: sellingType.ServiceDelivery } : null);
  };  

  const handleCreateSellingTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate additionDeduction field
      if (!validateAdditionDeduction(sellingType.additionDeduction)) {
        console.error('Invalid Addition Deduction value.');
        return;
      }

      if (!selectedCompanyId || !selectedShopId || !currentUser.userId) {
        console.error('Required fields are missing.');
        console.log(selectedCompanyId, selectedShopId, currentUser.userId);
        return;
      }

      await newRequest.post("/sellingTypes/create", {
        ...sellingType,
        companyId: selectedCompanyId,
        shopId: selectedShopId,
        userId: currentUser.userId,
        ServiceDelivery: ServiceDelivery.value,
      });
  
      console.log("Selling type created successfully!");
      window.location.reload(); // Reload the browser
  
      // Clear form inputs and state
      setSellingType({
        productName: '',
        categoryId: '',
        shopId: [],
        companyId: '',
      });
      setSelectedCompanyId('');
      setSelectedShop('');
    } catch (err) {
      console.error('Error creating selling type:', err);
    }
  };

  const handleEditSellingTypeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate additionDeduction field
      if (!validateAdditionDeduction(sellingType.additionDeduction)) {
        console.error('Invalid Addition Deduction value.');
        return;
      }

      if (!selectedCompanyId || !selectedShopId || !currentUser.userId) {
        console.error('Required fields are missing.');
        return;
      }
  
      const response = await newRequest.put(`/sellingTypes/update/${selectedSellingType.sellingTypeId}`, {
        ...sellingType,
        companyId: selectedCompanyId,
        shopId: selectedShopId,
        ServiceDelivery: ServiceDelivery.value,
      });
  
      if (response.status === 200) {
        console.log("Product price updated successfully!");
        // Handle success (e.g., refresh data, show success message)
      } else {
        console.error('Failed to update product price:', response.data.message);
      }

      window.location.reload(); // Reload the browser
  
      // Clear form inputs and state
      setSellingType({
        productName: '',
        categoryId: '',
        shopId: [],
        companyId: '',
      });
      setSelectedCompanyId('');
      setSelectedShopId('');
      setSelectedShop('');

      setShowPanelEditSellingType(false);
    } catch (err) {
      console.error('Error updating selling type:', err);
    }
  };     

  const getCreatedByUserName = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? user.name : '-'; // Return user name if found, otherwise '-'
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(company => company.companyId === companyId);
    return company ? company.companyName : '-'; // Return user name if found, otherwise '-'
  };

  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.shopId === shopId);
    return shop ? shop.shopName : '-'; // Return user name if found, otherwise '-'
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Product Prices</Card.Title>
              <Row>
                <Col>
                  <Button onClick={togglePanelCreateSellingType} className="btn-create-product shadow-1 mb-4" variant="primary">
                    Create Selling Type
                  </Button>
                </Col>
                  <Col>
                    <Form.Control type="text" placeholder="Search Selling Type by name" className="mb-3" onChange={handleSellingTypeSearch} value={searchSellingTypeQuery}/>
                  </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Selling Type</th>
                    <th>Company</th>
                    <th>Shop</th>
                    <th>Amount</th>
                    <th>Aditional Deduction</th>
                    <th>Service/Delivery</th>
                    <th>Updated At</th>
                    <th>Created By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                {currentSellingTypes && filteredSellingTypes.map((sellingType, index) => {
                  const { variant, text } = getBadgeVariantAndText(sellingType.toggle);
                  return (
                    <tr key={sellingType.sellingTypeId}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{sellingType.sellingType}</td>
                      <td>{getCompanyName(sellingType.companyId)}</td>
                      <td>{getShopName(sellingType.shopId)}</td>
                      <td>{sellingType.sellingTypeAmount}</td>
                      <td>{sellingType.additionDeduction}</td>
                      <td>{sellingType.ServiceDelivery}</td>
                      <td>{new Date(sellingType.updatedAt).toLocaleDateString()}</td>
                      <td>{getCreatedByUserName(sellingType.createdBy)}</td>
                      <td>
                        <Badge bg={variant} className={`badge ${variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}`}>
                          {text}
                        </Badge>
                        <EditIcon className='edit-icon' onClick={() => togglePanelEditSellingType(sellingType)}/>
                      </td>
                    </tr>
                  )})}
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

              {/* <Row>
                <Col>
                  <span>{glowButtons}</span>
                </Col>
              </Row> */}

              {showPanelCreateSellingType && (
                <div className="panel-create-selling-type-popup">
                  <Card className='panel-create-selling-type' ref={panelCreateSellingTypeRef}>
                    <Card.Header className='popup-header'>
                      <Card.Title as="h5">Create Selling Type</Card.Title>
                      <CloseIcon onClick={handleClose} className='close-icon'/>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleCreateSellingTypeSubmit}>

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

                        <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                          <Form.Label column sm={3}>
                            Selling Type
                          </Form.Label>
                          <Col sm={9}>
                            <Form.Control name="sellingType" type="text" onChange={handleChange} required />
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formGridState">
                          <Col lg={3} md={3} sm={3} col={3}>
                            <Form.Label >Serivice/Delivery</Form.Label>
                          </Col>
                          <Col lg={9} md={9} sm={9} col={9}>
                            <Select
                              name="ServiceDelivery"
                              options={[
                                { value: 'Service', label: 'Service' },
                                { value: 'Delivery', label: 'Delivery' },
                              ]}
                              placeholder="Select service/delivery"
                              isClearable
                              required
                              onChange={handleServiceDeliveryChange}
                              value={ServiceDelivery}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                          <Form.Label column sm={3}>
                            Selling Type Amount
                          </Form.Label>
                          <Col sm={9}>
                            <Form.Control name="sellingTypeAmount" type="number" onChange={handleChange} required />
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                          <Form.Label column sm={3}>
                            Addition Deduction
                          </Form.Label>
                          <Col sm={9}>
                            <Form.Control 
                              name="additionDeduction" 
                              type="text" 
                              value={sellingType.additionDeduction} 
                              onChange={handleChange} 
                              isInvalid={!validateAdditionDeduction(sellingType.additionDeduction) && sellingType.additionDeduction !== ''}
                              placeholder='+0.00'
                              required 
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter a valid number with up to 2 decimal places and a leading `+` or `-` symbol.
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

              {showPanelEditSellingType && (
                <div className="panel-edit-selling-type-popup">
                  <Card className='panel-edit-selling-type' ref={panelEditSellingTypeRef}>
                    <Card.Header className='popup-header'>
                      <Card.Title as="h5">Edit Selling Type</Card.Title>
                      <CloseIcon onClick={handleClose} className='close-icon'/>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleEditSellingTypeSubmit}>
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
                          <Form.Control name="sellingType" type="text" value={sellingType.sellingType} onChange={handleChange} required /> 
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formGridState">
                          <Col lg={3} md={3} sm={3} col={3}>
                            <Form.Label >Service/Delivery</Form.Label>
                          </Col>
                          <Col lg={9} md={9} sm={9} col={9}>
                            <Select
                              name="ServiceDelivery"
                              options={[
                                { value: 'Service', label: 'Service' },
                                { value: 'Delivery', label: 'Delivery' },
                              ]}
                              placeholder="Select service/delivery"
                              isClearable
                              required
                              onChange={handleServiceDeliveryChange}
                              value={ServiceDelivery}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                          <Form.Label column sm={3}>
                            Selling Type Amount
                          </Form.Label>
                          <Col sm={9}>
                            <Form.Control name="sellingTypeAmount" type="number" value={sellingType.sellingTypeAmount} onChange={handleChange} required />
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                          <Form.Label column sm={3}>
                            Addition Deduction
                          </Form.Label>
                          <Col sm={9}>
                            <Form.Control 
                              name="additionDeduction" 
                              type="text" 
                              value={sellingType.additionDeduction} 
                              onChange={handleChange} 
                              isInvalid={!validateAdditionDeduction(sellingType.additionDeduction) && sellingType.additionDeduction !== ''}
                              required 
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter a valid number with up to 2 decimal places and a leading `+` or `-` symbol.
                            </Form.Control.Feedback>
                          </Col>
                        </Form.Group>

                        <Form.Group className="mb-3 status" as={Row}>
                          <Col sm={9} name="toggle">
                            <Form.Check
                              label="Active/Inactive"
                              name="toggle"
                              checked={sellingType.toggle === 'enable'} // Adjust checked state based on toggle value
                              onChange={(e) => setSellingType((prev) => ({ 
                                ...prev, 
                                toggle: e.target.checked ? 'enable' : 'disable' 
                              }))}
                            />
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

export default SellingType;