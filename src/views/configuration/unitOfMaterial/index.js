import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button, Table, Badge } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import newRequest from '../../../utils/newRequest';
import './index.scss';

const UnitOfMaterial = () => {
  const [showPanelCreateUom, setShowPanelCreateUom] = useState(false);
  const [showPanelEditUom, setShowPanelEditUom] = useState(false);
  const [filteredUoms, setFilteredUoms] = useState([]);
  const [searchUomQuery, setSearchUomQuery] = useState('');
  const [selectedUom, setSelectedUom] = useState(null);
  const [uoms, setUoms] = useState([]);

  const [uom, setUom] = useState({
    name: '',
    description: '',
    toggle: 'disable',
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const getBadgeVariantAndText = (toggle) => {
    return toggle === 'enable' ? { variant: 'success', text: 'Active' } : { variant: 'danger', text: 'Inactive' };
  };

  useEffect(() => {
    const fetchUoms = async () => {
        try {
            const response = await newRequest.get('/uoms');
            setUoms(response.data);
            setFilteredUoms(response.data);
        } catch (error) {
            console.error('Error fetching uoms:', error);
        }
    };

    fetchUoms();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUoms = filteredUoms.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredUoms.length / itemsPerPage);

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
    setShowPanelCreateUom(false);
    setShowPanelEditUom(false);
  }

  const handleChange = (e) => {
    setUom((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUomSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchUomQuery(query);
    setFilteredUoms(
        uoms.filter(uom => uom.name.toLowerCase().includes(query))
    );
  };

  const togglePanelCreateUom = () => {
    setShowPanelCreateUom(!showPanelCreateUom);
    if (!showPanelCreateUom) {
      setUom({
        name: '',
        description: '',
      });
      setSearchUomQuery('');
    }
  };

  // Toggle panel Edit UoM
  const togglePanelEditUom = (uom) => {
    setUom(uom);
    setShowPanelEditUom(true);
    
    setSelectedUom(uom);
    setUom({
        name: uom.name,
        description: uom.description,
        toggle: uom.toggle,
    });
    setShowPanelEditUom(true);
  }

  // Create unit of material
  const handleCreateUomSubmit = async (e) => {
    e.preventDefault();
    try {
        await newRequest.post("/uoms/create-new", {
            ...uom,
            userId: currentUser.userId,
            toggle: 'enable',
        });
        setShowPanelCreateUom(false);
        console.log("UoM created successfully!");
        window.location.reload(); // Reload the browser
    } catch (err) {
        console.log(err);
    }
  };

  // Update UoM details
  const handleEditUomSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await newRequest.put(`/uoms/update-uom/${selectedUom.uomId}`, {
            name: uom.name,
            description: uom.description,
            toggle: uom.toggle
        });
        const updatedUom = response.data;
        setUoms(prevUoms =>
            prevUoms.map(comp =>
                comp._id === updatedUom._id ? updatedUom : comp
            )
        );
        setFilteredUoms(prevFilteredUoms =>
            prevFilteredUoms.map(comp =>
                comp._id === updatedUom._id ? updatedUom : comp
            )
        );
        setShowPanelEditUom(false);
        console.log("UoM updated successfully!");
        window.location.reload(); // Reload the browser
    } catch (err) {
        console.log(err);
    }
  };

  return (
    <React.Fragment>
        {/* Unit of material form */}
        <Card>
            <Card.Header>
                <Card.Title as="h5">Unit of Material</Card.Title>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col>
                        <Button onClick={togglePanelCreateUom} className="btn-create-uom shadow-1 mb-4" variant="primary">
                            Create Unit of Material
                        </Button>
                    </Col>
                  <Col>
                    <Form.Control type="text" placeholder="Search UoMs by name" className="mb-3" onChange={handleUomSearch} value={searchUomQuery}/>
                  </Col>
              </Row>
                <Table responsive className='uom-table'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>UoM Name</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUoms.map((uom, index) => {
                            const { variant, text } = getBadgeVariantAndText(uom.toggle);
                            return (
                                <tr key={uom.uomId} className='uom-table-row'>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{uom.name}</td>
                                <td>{uom.description}</td>
                                <td>
                                    <Badge bg={variant} className={`badge ${variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}`}>
                                        {text}
                                    </Badge>
                                    <EditIcon className='edit-icon' onClick={() => togglePanelEditUom(uom)} style={{ marginRight: '10px' }} />
                                </td>
                            </tr>
                            )
                        })}
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

                {showPanelCreateUom && (
                    <div className='panel-create-uom-popup'>
                        <Card className='panel-create-uom'>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Create UoM</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <Form onSubmit={handleCreateUomSubmit}>
                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Unit of Material Name
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="name" value={uom.name}/>
                                    </Col>
                                </Form.Group>

                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalPassword">
                                    <Form.Label column sm={3}>
                                        Description
                                    </Form.Label>
                                    <Col >
                                        <Form.Control type="text" name="description" value={uom.description}/>
                                    </Col>
                                </Form.Group>  

                                <Form.Group className="mt-3" as={Row}>
                                    <Col sm={{ span: 10, offset: 0 }}>
                                        <Button type='submit'>Save</Button>
                                        {/* <Button onClick={() => setUom({ name: '', description: '', toggle: 'disable' })}>New</Button> */}
                                    </Col>
                                </Form.Group>
                            </Form> 
                        </Card.Body>
                    </Card>
                    </div>
                )}

                {showPanelEditUom && (
                    <div className='panel-edit-uom-popup'>
                        <Card className='panel-edit-uom'>
                            <Card.Header className='popup-header'>
                                <Card.Title as="h5">Edit UoM</Card.Title>
                                <CloseIcon onClick={handleClose} className='close-icon'/>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleEditUomSubmit}>
                                    <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                                        <Form.Label column sm={3}>
                                            Unit of Material Name
                                        </Form.Label>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={uom.name} // Use state value here
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group className="mb-3" as={Row} controlId="formHorizontalPassword">
                                        <Form.Label column sm={3}>
                                            Description
                                        </Form.Label>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="description"
                                                value={uom.description} // Use state value here
                                                onChange={handleChange}
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group className="mb-3 status" as={Row}>
                                        <Col sm={9} name="toggle">
                                            <Form.Check
                                                label="Active/Inactive"
                                                name="toggle"
                                                checked={uom.toggle === 'enable'} // Adjust checked state based on toggle value
                                                onChange={(e) => setUom((prev) => ({ 
                                                ...prev, 
                                                toggle: e.target.checked ? 'enable' : 'disable' 
                                                }))}
                                            />
                                        </Col>
                                    </Form.Group> 

                                    <Form.Group className="mt-3" as={Row}>
                                        <Col sm={{ span: 10, offset: 0 }}>
                                            <Button type='submit'>Update</Button>
                                            {/* <Button onClick={togglePanelCreateUom}>New</Button> */}
                                        </Col>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                )}
            </Card.Body>
        </Card>
    </React.Fragment>
  );
};

export default UnitOfMaterial;
