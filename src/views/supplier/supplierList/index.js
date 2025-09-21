import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Table, Card, Badge, Button } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Select from 'react-select';
import './index.scss';
import newRequest from '../../../utils/newRequest';

const SupplierList = () => {
  const [showPanelCreateSupplier, setShowPanelCreateSupplier] = useState(false);
  const [showPanelEditSupplier, setShowPanelEditSupplier] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchSupplierQuery, setSearchSupplierQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [users, setUsers] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [shops, setShops] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);

  const panelCreateSupplierRef = useRef(null);
  const panelEditSupplierRef = useRef(null);

  const [supplier, setSupplier] = useState({
      supplierName: '',
      address: '',
      tinNo: '',
      vatNo: '',
      contactNo: '',
      email: '',
      outstanding: '',
      creditPeriod: '',
      details: '',
      toggle: 'disable',
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const userRole = currentUser.role;
  const userCompany = currentUser.companyId;

  const navigate = useNavigate();
  // const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

  // const glowButtons = buttonGlowVariants.map((variant, idx) => (
  //   <OverlayTrigger key={idx} placement="top" overlay={<Tooltip className="mb-2">{variant}</Tooltip>}>
  //     <Button className={'text-capitalize my-2 btn' + variant} variant={'light'}>
  //       {variant}
  //     </Button>
  //   </OverlayTrigger>
  // ));

  const getBadgeVariantAndText = (toggle) => {
    return toggle === 'enable' ? { variant: 'success', text: 'Active' } : { variant: 'danger', text: 'Inactive' };
  };    

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
          const response = await newRequest.get('/suppliers');
          const allSuppliers = response.data;

          // Filter suppliers if user is a superAdmin
          if (userRole === 'superAdmin') {
              const filteredForSuperAdmin = allSuppliers.filter(
                  supplier => supplier.companyId === userCompany
              );
              setFilteredSuppliers(filteredForSuperAdmin);
          } else {
              setFilteredSuppliers(allSuppliers);
          }

          setSuppliers(allSuppliers); // Store all themes regardless of role
      } catch (error) {
          console.error('Error fetching suppliers:', error);
      }
    };

    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchSuppliers();
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

  useEffect(() => {
    const fetchUsers = async () => { // Fetch users data
      try {
        const response = await newRequest.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  })

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

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

  //validate email
  const validateEmail = (email) => {
    const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
      const { value } = e.target;
      setSupplier((prev) => ({ ...prev, email: value }));

      if (validateEmail(value)) {
          setEmailError('');
      } else {
          setEmailError('Please enter a valid email address.');
      }
  };

  const handleClose = () => {
    setShowPanelCreateSupplier(false);
    setShowPanelEditSupplier(false);
  }

  const handleSupplierSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchSupplierQuery(query);
    setFilteredSuppliers(
        suppliers.filter(supplier => supplier.supplierName.toLowerCase().includes(query) && supplier.companyId === userCompany)
    );
  };

  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption.value);
    setSelectedCompany(selectedOption);
  };

  const handleShopSelect = (selectedOption) => {
    if (selectedOption) {
      const newSelectedShops = selectedOption.map(option => ({
        value: option.value,
        label: option.label
      }));
      setSelectedShops(newSelectedShops);
    } else {
      setSelectedShops([]); // Ensure to handle case where no option is selected
    }
  }; 

  const handleChange = (e) => {
    setSupplier((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVisibility = async (supplier) => {
    try {
      // Pass the entire grn object using the state parameter
      navigate(`/pendingTransactions`, { state: { supplier } });
    } catch (error) {
      console.error("An error occurred while showing", error);
    }
  }

  const togglePanelCreateSupplier = () => {
    setShowPanelCreateSupplier(!showPanelCreateSupplier);
    if (!showPanelCreateSupplier) {
      setSupplier({
        ...supplier,
        supplierName: '',
        creditPeriod: '',
        details: '',
      });
      setSelectedCompanyId('');
      setSearchSupplierQuery('');
      setSelectedShops([]);
    }
  };

  //set selected supplier id and set current values of the supplier to the edit form
  const togglePanelEditSupplier = (supplier) => {
    const company = companies.find(comp => comp.companyId === supplier.companyId);
    const selectedCompanyOption = company ? { value: company.companyId, label: company.companyName } : null;

    const shopOptions = supplier.shopIds.map(shopId => {
      const shop = shops.find(shop => shop.shopId === shopId);
      return shop ? { value: shop.shopId, label: shop.shopName } : null;
    }).filter(option => option !== null);

    setSelectedCompany(selectedCompanyOption);
    setSelectedCompanyId(selectedCompanyOption.value);
    setSelectedSupplier(supplier);
    setSelectedShops(shopOptions);
    setSupplier({
      supplierName: supplier.supplierName,
      address: supplier.address,
      tinNo: supplier.tinNo,
      vatNo: supplier.vatNo,
      contactNo: supplier.contactNo,
      email: supplier.email,
      outstanding: supplier.outstanding,
      creditPeriod: supplier.creditPeriod,
      details: supplier.details,
      toggle: supplier.toggle,
    });
    setShowPanelEditSupplier(true);
};

  const handleCreateSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
        await newRequest.post("/suppliers/create", {
            ...supplier,
            companyId: selectedCompanyId,
            createdBy: currentUser.userId,
            shopIds: selectedShops.map(shop => shop.value),
        });
        setSelectedShops([]);
        setShowPanelCreateSupplier(false);
        console.log("Supplier created successfully!");
        window.location.reload(); // Reload the browser
    } catch (err) {
        console.log(err);
    }
  };

  //update supplier details
  const handleEditSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await newRequest.put(`/suppliers/update/${selectedSupplier.supplierId}`, {
          ...supplier,
          companyId: selectedCompanyId, // Ensure companyId is included
          shopIds: selectedShops.map(shop => shop.value),
        });
        setSuppliers(prevSuppliers =>
            prevSuppliers.map(comp =>
                comp._id === response.data._id ? response.data : comp
            )
        );
        setFilteredSuppliers(prevFilteredSuppliers =>
            prevFilteredSuppliers.map(comp =>
                comp._id === response.data._id ? response.data : comp
            )
        );
        setShowPanelEditSupplier(false);
        console.log("Supplier updated successfully!");
        window.location.reload(); // Reload the browser
    } catch (err) {
        console.log(err);
    }
  };

  //get the username using userId
  const getCreatedByUserName = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? user.name : '-'; // Return user name if found, otherwise '-'
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
            <Card.Header>
              <Card.Title className="mb-3" as="h5">Supplier Details</Card.Title>
              <Row>
                  <Col>
                      <Button onClick={togglePanelCreateSupplier} className="btn-create-supplier shadow-1 mb-4" variant="primary">
                          Create Supplier
                      </Button>
                  </Col>
                  <Col>
                    <Form.Control type="text" placeholder="Search Suppliers by name" className="mb-3" onChange={handleSupplierSearch} value={searchSupplierQuery}/>
                  </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Supplier</th>
                    <th>Address</th>
                    <th>Contact No</th>
                    <th>Email</th>
                    <th>Details</th>
                    <th>Outstanding</th>
                    <th>Credit Period</th>
                    <th>Created At</th>
                    <th>Created By</th>
                    <th>States</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSuppliers.map((supplier, index) => {
                    const { variant, text } = getBadgeVariantAndText(supplier.toggle);
                    return (
                        <tr key={supplier._id}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{supplier.supplierName}</td>
                            <td>{supplier.address}</td>
                            <td>{supplier.contactNo}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.details}</td>
                            <td></td>
                            <td>{supplier.creditPeriod}</td>
                            <td>{new Date(supplier.createdAt).toLocaleDateString()}</td>
                            <td>{getCreatedByUserName(supplier.createdBy)}</td>
                            <td>
                              <Badge bg={variant} className={`badge ${variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}`}>
                                {text}
                              </Badge>
                              <EditIcon className='edit-icon' onClick={() => togglePanelEditSupplier(supplier)} style={{ marginRight: '10px' }} /> 
                              <VisibilityIcon className='visibility-icon' onClick={() => handleVisibility(supplier)}/>
                              {/* <Button variant="primary" size="sm">
                                Bill Settle
                              </Button> */}
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
            </Card.Body>
          </Card>
      </Row>

      {showPanelCreateSupplier && (
          <div className="panel-create-supplier-popup">
              <Card className='panel-create-supplier' ref={panelCreateSupplierRef}>
                  <Card.Header className='popup-header'>
                      <Card.Title as="h5">Create Supplier</Card.Title>
                      <CloseIcon onClick={handleClose} className='close-icon'/>
                  </Card.Header>
                  <Card.Body> 
                  <Form onSubmit={handleCreateSupplierSubmit}>
                    <Form.Control name="supplierName" type="text" placeholder='Supplier Name' className='mb-4' onChange={handleChange} required/>

                    <Form.Control name="address" type="text" placeholder='Address' className='mb-4' onChange={handleChange} required/>

                    <Form.Control name="contactNo" type="text" placeholder='Contact No' className='mb-4' onChange={handleChange} required/>

                    <Form.Control
                        className='mb-4'
                        type="email"
                        name="email"
                        placeholder='Email'
                        onChange={handleEmailChange}
                        isInvalid={!!emailError}
                        required
                    />
                    <Form.Control.Feedback type="invalid" className='mb-4'>
                        {emailError}
                    </Form.Control.Feedback>

                    <Select
                        options={companies.map(company => ({ value: company.companyId, label: company.companyName }))}
                        onChange={handleCompanySelect}
                        value={selectedCompany}
                        className='mb-4'
                        placeholder="Select company"
                        isClearable
                        required
                    /> 

                    <Select
                      options={shops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                      onChange={handleShopSelect}
                      value={selectedShops}
                      placeholder="Select shops"
                      className='mb-4'
                      isMulti
                      required
                    />
                      
                    <Form.Control name="creditPeriod" type="text" placeholder='Credit Period (Number of Days)' className='mb-4' onChange={handleChange} required/>
                    
                    <Form.Control name="details" as="textarea" placeholder='Details' onChange={handleChange} />

                    <Form.Group className="mt-3" as={Row}>
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

      {showPanelEditSupplier && (
        <div className="panel-edit-supplier-popup">
            <Card className='panel-edit-supplier' ref={panelEditSupplierRef}>
                <Card.Header className='popup-header'>
                    <Card.Title as="h5">Edit Supplier</Card.Title>
                    <CloseIcon onClick={handleClose} className='close-icon'/>
                </Card.Header>
                <Card.Body> 
                    <Form onSubmit={handleEditSupplierSubmit}>
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Supplier Name
                            </Form.Label>
                            <Col>
                                <Form.Control type="text" name="supplierName" value={supplier.supplierName} onChange={handleChange} required/>
                            </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" as={Row}>
                            <Form.Label column sm={3}>Email</Form.Label>
                            <Col>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={supplier.email}
                                    onChange={handleEmailChange}
                                    isInvalid={!!emailError}
                                    required
                                />
                            </Col>
                            <Form.Control.Feedback type="invalid">
                                {emailError}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalPassword">
                            <Form.Label column sm={3}>
                                Company
                            </Form.Label>
                            <Col >
                              <Select
                                options={companies.map(company => ({ value: company.companyId, label: company.companyName }))}
                                onChange={handleCompanySelect}
                                value={selectedCompany}
                                className='mb-4'
                                placeholder="Select company"
                                isClearable
                                required
                              /> 
                            </Col>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                          <Col lg={3} md={3} sm={3} col={3}>
                            <Form.Label>Shops</Form.Label>
                          </Col>
                          <Col lg={9} md={9} sm={9} col={9}>
                              <Select
                                options={shops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                                onChange={handleShopSelect}
                                value={selectedShops}
                                placeholder="Select shops"
                                isMulti
                                required
                              />
                          </Col>
                        </Form.Group>

                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Contact Number
                            </Form.Label>
                            <Col>
                                <Form.Control type="text" name="contactNo" value={supplier.contactNo} onChange={handleChange} required/>
                            </Col>
                        </Form.Group> 
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Address
                            </Form.Label>
                            <Col>
                                <Form.Control type="text" name="address" value={supplier.address} onChange={handleChange} required/>
                            </Col>
                        </Form.Group>  
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Credit Period
                            </Form.Label>
                            <Col>
                                <Form.Control type="text" name="creditPeriod" value={supplier.creditPeriod} onChange={handleChange} required/>
                            </Col>
                        </Form.Group> 
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Details
                            </Form.Label>
                            <Col>
                                <Form.Control as="textarea" rows="3" name="details" value={supplier.details} onChange={handleChange} />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3 status" as={Row}>
                            <Col sm={9} name="toggle">
                              <Form.Check
                                label="Active/Inactive"
                                name="toggle"
                                checked={supplier.toggle === 'enable'} // Adjust checked state based on toggle value
                                onChange={(e) => setSupplier((prev) => ({ 
                                  ...prev, 
                                  toggle: e.target.checked ? 'enable' : 'disable' 
                                }))}
                              />
                            </Col>
                        </Form.Group> 
                        <button className="btn btn-primary mb-4" type='submit'>Save</button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
      )} 
    </React.Fragment>
  );
};

export default SupplierList;
