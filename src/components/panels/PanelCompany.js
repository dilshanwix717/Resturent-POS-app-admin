import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import newRequest from '../../utils/newRequest';
import PanelShop from './PanelShop';
import PanelUser from './PanelUser';
import '../../assets/scss/components/PanelCompany.scss';

const PanelCompany = () => {
    const [showPanelCompany, setShowPanelCompany] = useState(false);
    const [showPanelCreateCompany, setShowPanelCreateCompany] = useState(false);
    const [showPanelEditCompany, setShowPanelEditCompany] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [emailError, setEmailError] = useState('');

    const panelCreateCompanyRef = useRef(null);
    const panelEditCompanyRef = useRef(null);

    const [company, setCompany] = useState({
        companyName: '',
        email: '',
        contactNo: '',
        address: '',
        vatNo: '', 
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser")); 

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await newRequest.get('/companies');
                setCompanies(response.data);
                setFilteredCompanies(response.data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();
    }, []);

    //validate email
    const validateEmail = (email) => {
        const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailPattern.test(email);
    };
    
    const handleEmailChange = (e) => {
        const { value } = e.target;
        setCompany((prev) => ({ ...prev, email: value }));
    
        if (validateEmail(value)) {
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address.');
        }
    };    

    const handleClose = () => {
        setShowPanelCreateCompany(false);
        setShowPanelEditCompany(false);
    }

    const togglePanelCreateCompany = () => {
        setShowPanelCreateCompany(!showPanelCreateCompany);
    };

    const togglePanelEditCompany = () => {
        if (selectedCompany) {
            setCompany({
                companyName: selectedCompany.companyName,
                email: selectedCompany.email,
                contactNo: selectedCompany.contactNo,
                address: selectedCompany.address,
                longtitude: selectedCompany.longtitude,
                latitude: selectedCompany.latitude,
                vatNo: selectedCompany.vatNo,
                toggle: selectedCompany.toggle,
            });
        }
        setShowPanelEditCompany(!showPanelEditCompany);
    };

    const handleChange = (e) => {
        setCompany((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };    

    const handleCreateCompanySubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(company.email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setEmailError('');

        try {
            await newRequest.post("/companies/create", {
                ...company,
                createdBy: currentUser.userId,
            });
            setShowPanelCreateCompany(false);
            console.log("Company created successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };

    //update company details
    const handleEditCompanySubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(company.email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setEmailError('');

        try {
            const response = await newRequest.put(`/companies/update/${selectedCompany.companyId}`, company);
            setCompanies(prevCompanies =>
                prevCompanies.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setFilteredCompanies(prevFilteredCompanies =>
                prevFilteredCompanies.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setShowPanelEditCompany(false);
            console.log("Company updated successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredCompanies(
            companies.filter(company => company.companyName.toLowerCase().includes(query))
        );
    };

    const handleSelectCompany = (company) => {
        setSelectedCompany(company);
        setShowPanelCompany(true); 
    };

    return (
        <React.Fragment>
            <Card>
                <Card.Header>
                    <Card.Title as="h4">Company</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Button onClick={togglePanelCreateCompany} className="btn-create-company shadow-1 mb-4" variant="primary">
                                Create Company
                            </Button>
                        </Col>
                    </Row>
                    <Form.Group className='mb-4'>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search Companies by name"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Table responsive variant="info" className='company-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Company Name</th>
                                <th>Email</th>
                                <th>Contact No</th>
                                <th>Address</th>
                                <th>VAT No</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company, index) => (
                                <tr key={company._id} onClick={() => handleSelectCompany(company)} className='company-table-row'>
                                    <td>{index + 1}</td>
                                    <td>{company.companyName}</td>
                                    <td>{company.email}</td>
                                    <td>{company.contactNo}</td>
                                    <td>{company.address}</td>
                                    <td>{company.vatNo}</td>
                                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {selectedCompany && (
                        <Row>
                            <Col xl={12} md={12} sm={12}>
                                <Card className='panel-company'>
                                    <Card.Header>
                                        <Card.Title as="h5">{selectedCompany.companyName}</Card.Title>
                                        <button onClick={togglePanelEditCompany}>
                                            <MoreHorizIcon />
                                        </button>
                                    </Card.Header>
                                    <Card.Body>

                                        {showPanelCompany && ( // Conditionally render panels
                                            <Row>
                                                <Col>
                                                    <PanelShop selectedCompanyId={selectedCompany.companyId} />
                                                    <PanelUser selectedCompanyId={selectedCompany.companyId} />
                                                </Col>
                                            </Row>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {showPanelCreateCompany && (
                <div className="panel-create-company-popup">
                    <Card className='panel-create-company' ref={panelCreateCompanyRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Create Company</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <form onSubmit={handleCreateCompanySubmit}>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Company Name" name="companyName" onChange={handleChange} required/>
                                </div>
                                {emailError && <div className="text-danger">{emailError}</div>}
                                <div className="input-group mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Email"
                                        name="email"
                                        value={company.email}
                                        onChange={handleEmailChange}
                                        required
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Contact No" name="contactNo" onChange={handleChange} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Address" name="address" onChange={handleChange} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="VAT Number" name="vatNo" onChange={handleChange} required/>
                                </div>
                                <button className="btn btn-primary mb-4" type='submit'>Create</button>
                            </form>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {showPanelEditCompany && (
                <div className="panel-edit-company-popup">
                    <Card className='panel-edit-company' ref={panelEditCompanyRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Edit Company</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleEditCompanySubmit}>
                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Company Name
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="companyName" value={company.companyName} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Email</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={company.email}
                                            onChange={handleEmailChange}
                                            isInvalid={!!emailError}
                                            required
                                        />
                                    </Col>
                                    <Form.Control.Feedback type="invalid">
                                        {emailError}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Contact Number
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="contactNo" value={company.contactNo} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group> 

                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Address
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="address" value={company.address} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group> 

                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        VAT No
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="vatNo" value={company.vatNo} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group> 

                                <Form.Group className="mb-3 status" as={Row}>
                                    <Col sm={9} name="toggle">
                                        <Form.Check
                                            label="Active/Inactive"
                                            name="toggle"
                                            checked={company.toggle === 'enable'} // Adjust checked state based on toggle value
                                            onChange={(e) => setCompany((prev) => ({ 
                                            ...prev, 
                                            toggle: e.target.checked ? 'enable' : 'disable' 
                                            }))}
                                        />
                                    </Col>
                                </Form.Group> 

                                <button className="btn btn-primary mb-4" type='submit'>Update</button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </React.Fragment>
    );
};

export default PanelCompany;
