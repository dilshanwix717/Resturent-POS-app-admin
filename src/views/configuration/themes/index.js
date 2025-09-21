import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button, Table } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import { SketchPicker } from 'react-color';
import './index.scss';

const Themes = () => {
    const [companies, setCompanies] = useState([]);
    const [showPanelCreateTheme, setShowPanelCreateTheme] = useState(false);
    const [showPanelEditTheme, setShowPanelEditTheme] = useState(false);
    const [themes, setThemes] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [filteredThemes, setFilteredThemes] = useState([]);
    const [searchThemeQuery, setSearchThemeQuery] = useState('');

    const [theme, setTheme] = useState({
        primaryColor: '',
        secondaryColor: '',
        toggle: 'disable',
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userRole = currentUser.role;
    const userCompany = currentUser.companyId;

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
        const fetchThemes = async () => {
            try {
                const response = await newRequest.get('/themes');
                const allThemes = response.data;
    
                // Filter themes if user is a superAdmin
                if (userRole === 'superAdmin') {
                    const filteredForSuperAdmin = allThemes.filter(
                        theme => theme.companyID === userCompany
                    );
                    setFilteredThemes(filteredForSuperAdmin);
                } else {
                    setFilteredThemes(allThemes);
                }
    
                setThemes(allThemes); // Store all themes regardless of role
            } catch (error) {
                console.error('Error fetching themes:', error);
            }
        };
    
        fetchThemes();
    }, [userRole, userCompany]);    

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20); 

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentThemes = filteredThemes.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredThemes.length / itemsPerPage);

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
        setShowPanelCreateTheme(false);
        setShowPanelEditTheme(false);
    }

    const handleChange = (e) => {
        setTheme((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleColorChange = (color, field) => {
        setTheme((prev) => ({ ...prev, [field]: color.hex }));
    };

    const handleCompanySelect = (selectedOption) => {
        setSelectedCompanyId(selectedOption.value);
        setSelectedCompany(selectedOption);
    };

    const handleThemeSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchThemeQuery(query);
        setFilteredThemes(
            themes.filter(theme => theme.name.toLowerCase().includes(query) && theme.companyID === userCompany)
        );
      };

    const togglePanelCreateTheme = () => {
        setShowPanelCreateTheme(!showPanelCreateTheme);
        if (!showPanelCreateTheme) {
          setTheme({
            ...theme,
          });
          setSelectedCompanyId('');
          setSearchThemeQuery('');
        }
    };

    //toggle panel theme
    const togglePanelEditTheme = (theme) => {
        const company = companies.find(comp => comp.companyId === theme.companyID);
        const selectedCompanyOption = company ? { value: company.companyId, label: company.companyName } : null;

        setTheme(theme);
        setSelectedCompany(selectedCompanyOption);
        setShowPanelEditTheme(true);
    }

    //create unit of material
    const handleCreateThemeSubmit = async (e) => {
        e.preventDefault();
        try {
            await newRequest.post("/themes/create", {
                ...theme,
                companyId: selectedCompanyId,
                userId: currentUser.userId,
            });
            setShowPanelCreateTheme(false);
            console.log("Theme created successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };

    //edit theme
    const handleEditThemeSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(selectedCompanyId);
            await newRequest.put(`/themes/update/${theme.themeId}`, {
                ...theme,
                companyID: selectedCompanyId,
                userId: currentUser.userId,
            });
            setShowPanelEditTheme(false);
            console.log("Theme updated successfully!");
            window.location.reload(); // Reload the browser to fetch updated themes
        } catch (err) {
            console.log(err);
        }
    };
    
    const getCompanyName = (companyId) => {
        const company = companies.find(company => company.companyId === companyId);
        return company ? company.companyName : '-'; // Return user name if found, otherwise '-'
      };

    return (
        <React.Fragment>
            {/*unit of material form*/}
            <Card>
                <Card.Header>
                    <Card.Title as="h5">Themes</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Button onClick={togglePanelCreateTheme} className="btn-create-uom shadow-1 mb-4" variant="primary">
                                Create Theme
                            </Button>
                        </Col>
                        <Col>
                            <Form.Control type="text" placeholder="Search Themes" className="mb-3" onChange={handleThemeSearch} value={searchThemeQuery}/>
                        </Col>
                    </Row>

                    <Table responsive className='uom-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Company</th>
                                <th>Primary Colour</th>
                                <th>Secondary Colour</th>
                                <th>Font Colour</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentThemes.map((theme, index) => (
                                <tr key={theme._id} className='uom-table-row'>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td><td>{getCompanyName(theme.companyID)}</td></td>
                                    <td>
                                        <div style={{ backgroundColor: theme.primaryColor, width: '50px', height: '20px' }}></div>
                                    </td>
                                    <td>
                                        <div style={{ backgroundColor: theme.secondaryColor, width: '50px', height: '20px' }}></div>
                                    </td>
                                    <td>
                                        <div style={{ backgroundColor: theme.fontColor, width: '50px', height: '20px' }}></div>
                                    </td>
                                    <td>
                                        <EditIcon className='edit-icon' onClick={() => togglePanelEditTheme(theme)} style={{ marginRight: '10px' }} />  
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

                    {showPanelCreateTheme && (
                        <div className='panel-create-theme-popup'>
                            <Card className='panel-create-theme'>
                            <Card.Header className='popup-header'>
                                <Card.Title as="h5">Create Theme</Card.Title>
                                <CloseIcon onClick={handleClose} className='close-icon'/>
                            </Card.Header>
                            <Card.Body> 
                                <Form onSubmit={handleCreateThemeSubmit}>
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

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalEmail">
                                        <Form.Label column sm={3}>
                                            Primary Colour
                                        </Form.Label>
                                        <Col>
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.primaryColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'primaryColor')}
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalPassword">
                                        <Form.Label column sm={3}>
                                            Secondary Colour
                                        </Form.Label>
                                        <Col >
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.secondaryColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'secondaryColor')}
                                            />
                                        </Col>
                                    </Form.Group>  

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalPassword">
                                        <Form.Label column sm={3}>
                                            Font Colour
                                        </Form.Label>
                                        <Col >
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.fontColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'fontColor')}
                                            />
                                        </Col>
                                    </Form.Group> 

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

                    {showPanelEditTheme && (
                        <div className='panel-edit-theme-popup'>
                            <Card className='panel-edit-theme'>
                            <Card.Header className='popup-header'>
                                <Card.Title as="h5">Edit Theme</Card.Title>
                                <CloseIcon onClick={handleClose} className='close-icon'/>
                            </Card.Header>
                            <Card.Body> 
                                <Form onSubmit={handleEditThemeSubmit}>
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

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalEmail">
                                        <Form.Label column sm={3}>
                                            Primary Colour
                                        </Form.Label>
                                        <Col>
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.primaryColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'primaryColor')}
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} onChange={handleChange} controlId="formHorizontalPassword">
                                        <Form.Label column sm={3}>
                                            Secondary Colour
                                        </Form.Label>
                                        <Col >
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.secondaryColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'secondaryColor')}
                                            />
                                        </Col>
                                    </Form.Group>  

                                    <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalPassword">
                                        <Form.Label column sm={3}>
                                            Font Colour
                                        </Form.Label>
                                        <Col >
                                            {/*color-picker*/}
                                            <SketchPicker
                                                color={theme.fontColor}
                                                onChangeComplete={(color) => handleColorChange(color, 'fontColor')}
                                            />
                                        </Col>
                                    </Form.Group> 

                                    <Form.Group className="mt-3" as={Row}>
                                        <Col sm={{ span: 10, offset: 0 }}>
                                            <Button type='submit'>Update</Button>
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
        </React.Fragment>
    );
};

export default Themes;