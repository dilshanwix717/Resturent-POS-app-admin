import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Badge, Button } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import newRequest from '../../../../utils/newRequest';
import './index.scss';

const CategoryList = () => {
  const [showPanelCreateCategory, setShowPanelCreateCategory] = useState(false);
  const [showPanelEditCategory, setShowPanelEditCategory] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]);

  const panelCreateCategoryRef = useRef(null);
  const panelEditCategoryRef = useRef(null);

  const [category, setCategory] = useState({
    categoryName: '',
    details: '',
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userRole = currentUser.role;
  const userCompany = currentUser.companyId;

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
    const fetchCategories = async () => {
      try {
          const response = await newRequest.get('/categories');
          const allCategories = response.data;

          // Filter categories if user is a superAdmin
          if (userRole === 'superAdmin' || userRole === 'admin' || userRole === 'stockManager') {
              const filteredForSuperAdmin = allCategories.filter(
                  category => category.companyId === userCompany
              );
              setFilteredCategories(filteredForSuperAdmin);
          } else {
              setFilteredCategories(allCategories);
          }

          setCategories(allCategories); // Store all themes regardless of role
      } catch (error) {
          console.error('Error fetching categories:', error);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await newRequest.get('/companies'); // Fixed missing backticks
        setCompanies(response.data);
        setFilteredCompanies(response.data.filter(company => company.toggle === 'enable'));
      } catch (error) {
        console.error('Error fetching company id:', error);
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

    fetchCategories();
    fetchCompanies();
    fetchUsers(); // Call fetchUsers in useEffect
  }, [currentUser.userId]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (panelCreateCategoryRef.current && !panelCreateCategoryRef.current.contains(event.target)) {
  //       setShowPanelCreateCategory(false);
  //     }
  //   };

  //   if (showPanelCreateCategory) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   } else {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [showPanelCreateCategory]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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

  const handleClose = () => {
    setShowPanelCreateCategory(false);
    setShowPanelEditCategory(false);
  }

  const handleCategorySearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCategories(
      categories.filter(category => category.categoryName.toLowerCase().includes(query) && category.companyId === userCompany)
    );
  };

  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption.value);
    setSelectedCompany(selectedOption);
  };

  const handleChange = (e) => {
    setCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePanelCreateCategory = () => {
    setShowPanelCreateCategory(!showPanelCreateCategory);
    if (!showPanelCreateCategory) {
      setCategory({
        ...category,
        createdBy: currentUser.userId,
      });
      setSearchQuery('');
    }

    if (userRole === 'admin' || userRole === 'stockManager') {
      const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
      setSelectedCompanyId(currentUser.companyId);
    } else if (userRole === 'superAdmin') {
      const selectedCompany = companies.find(company => company.companyId === category.companyId);
      setSelectedCompany(selectedCompany ? { value: category.companyId, label: selectedCompany.companyName } : null);
      setSelectedCompanyId(currentUser.companyId);
    }
  };

  //set selected category id and set current values of the category to the edit form
  const togglePanelEditCategory = (category) => {
    // const company = companies.find(comp => comp.companyId === category.companyId);
    // const selectedCompanyOption = company ? { value: company.companyId, label: company.companyName } : null;
    
    if (userRole === 'admin') {
      const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
    } else if (userRole === 'superAdmin') {
      const selectedCompany = companies.find(company => company.companyId === category.companyId);
      setSelectedCompany(selectedCompany ? { value: category.companyId, label: selectedCompany.companyName } : null);
    }

    setSelectedCategory(category);
    // setSelectedCompany(selectedCompanyOption);
    setSelectedCompanyId(category.companyId);
    setCategory({
      categoryName: category.categoryName,
      details: category.details,
      toggle: category.toggle,
    });
    setShowPanelEditCategory(true);
  };  

  //update category details
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(selectedCompanyId);
        const response = await newRequest.put(`/categories/update/${selectedCategory.categoryId}`,{
          ...category,
          companyId: selectedCompanyId,
        });
        setCategories(prevCategories =>
            prevCategories.map(comp =>
                comp._id === response.data._id ? response.data : comp
            )
        );
        setFilteredCategories(prevFilteredCategories =>
            prevFilteredCategories.map(comp =>
                comp._id === response.data._id ? response.data : comp
            )
        );
        setShowPanelEditCategory(false);
        console.log("Category updated successfully!");
        window.location.reload(); // Reload the browser
    } catch (err) {
        console.log(err);
    }
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await newRequest.post("/categories/create", {
        ...category,
        companyId: selectedCompanyId,
        createdBy: currentUser.userId,
      });
      setShowPanelCreateCategory(false);
      console.log("Category created successfully!");
      window.location.reload(); // Reload the browser
    } catch (err) {
      console.log(err);
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

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Available Products Categories</Card.Title>
            <Row>
              <Col>
                <Button onClick={togglePanelCreateCategory} className="btn-create-category shadow-1 mb-4" variant="primary">
                  Create Category
                </Button>
              </Col>
              <Col>
                <Form.Control type="text" placeholder="Search Categories by name" className="mb-3" onChange={handleCategorySearch} value={searchQuery} />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Company</th>
                  <th>Created Date</th>
                  <th>Created By</th> {/* Added Created By column */}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => {
                  const { variant, text } = getBadgeVariantAndText(category.toggle);
                  return (
                    <tr key={category._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{category.categoryName}</td>
                      <td>{category.details}</td>
                      <td>{getCompanyName(category.companyId)}</td>
                      <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                      <td>{getCreatedByUserName(category.createdBy)}</td> {/* Display user name */}
                      <td>
                        <Badge bg={variant} className={`badge ${variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}`}>
                          {text}
                        </Badge>
                        <EditIcon className='edit-icon' onClick={() => togglePanelEditCategory(category)} />
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
      
      {showPanelCreateCategory && (
        <div className="panel-create-category-popup">
          <Card className='panel-create-category' ref={panelCreateCategoryRef}>
            <Card.Header className='popup-header'>
              <Card.Title as="h5">Create Category</Card.Title>
              <CloseIcon onClick={handleClose} className='close-icon'/>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateCategorySubmit}>
                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Col>
                    <Form.Control name="categoryName" type="text" placeholder='Category Name' onChange={handleChange} required />
                  </Col>
                </Form.Group>

                <Form.Group className='mb-4'>
                  <Col>
                    <Select
                        options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                        onChange={handleCompanySelect}
                        value={selectedCompany}
                        className='mb-4'
                        placeholder="Select company"
                        isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                        isClearable
                        required
                    /> 
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                  <Col>
                    <Form.Control name="details" as="textarea" rows="3" placeholder='Details' onChange={handleChange} />
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

      {showPanelEditCategory && (
        <div className="panel-edit-category-popup">
            <Card className='panel-edit-category' ref={panelEditCategoryRef}>
                <Card.Header className='popup-header'>
                    <Card.Title as="h5">Edit Category</Card.Title>
                    <CloseIcon onClick={handleClose} className='close-icon'/>
                </Card.Header>
                <Card.Body> 
                    <Form onSubmit={handleEditCategorySubmit}>
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Category Name
                            </Form.Label>
                            <Col>
                                <Form.Control type="text" name="categoryName" value={category.categoryName} onChange={handleChange} required/>
                            </Col>
                        </Form.Group>
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalPassword">
                            <Form.Label column sm={3}>
                                Company
                            </Form.Label>
                            <Col >
                              <Select
                                options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                                onChange={handleCompanySelect}
                                value={selectedCompany}
                                className='mb-4'
                                placeholder="Select company"
                                isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                                isClearable
                                required
                              />
                            </Col>
                        </Form.Group> 
                        <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                            <Form.Label column sm={3}>
                                Details
                            </Form.Label>
                            <Col>
                                <Form.Control as="textarea" rows="3" name="details" value={category.details} onChange={handleChange} />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3 status" as={Row}>
                            <Col sm={9} name="toggle">
                              <Form.Check
                                label="Active/Inactive"
                                name="toggle"
                                checked={category.toggle === 'enable'} // Adjust checked state based on toggle value
                                onChange={(e) => setCategory((prev) => ({ 
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

export default CategoryList;
