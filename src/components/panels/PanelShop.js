import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table } from 'react-bootstrap';
import '../../assets/scss/components/PanelShop.scss';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import newRequest from '../../utils/newRequest';
import PropTypes from 'prop-types';

const PanelShop = ({ selectedCompanyId }) => {
    const [showPanelShop, setShowPanelShop] = useState(false);
    const [showPanelEditShop, setShowPanelEditShop] = useState(false);
    const [showPanelCreateShop, setShowPanelCreateShop] = useState(false);
    const [showPanelAssignUsers, setShowPanelAssignUsers] = useState(false);
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedShop, setSelectedShop] = useState([]);
    const [emailError, setEmailError] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // const [selectedShop, setSelectedShop] = useState(null);

    const panelCreateShopRef = useRef(null);
    const panelEditShopRef = useRef(null);
    const panelShopRef = useRef(null);
    const panelAssignUsersRef = useRef(null);

    const [shop, setShop] = useState({
        shopName: '',
        contactNo: '',
        address: '',
        location: '',
        companyId: '',
        toggle: 'disable',
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser")); 

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await newRequest.get('/shops');
                setShops(response.data);
                setFilteredShops(response.data.filter(shop => shop.companyId === selectedCompanyId));
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };  
        
        const fetchUsers = async () => {
            try {
                const response = await newRequest.get('/users');
                setUsers(response.data);
            } catch {
                console.error('Error fetching users', error);
            }
        }

        fetchShops();
        fetchUsers();
    }, [selectedCompanyId]);       

    //validate email
    const validateEmail = (email) => {
        const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailPattern.test(email);
    };
    
    const handleEmailChange = (e) => {
        const { value } = e.target;
        setShop((prev) => ({ ...prev, email: value }));
    
        if (validateEmail(value)) {
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address.');
        }
    };
    
    const handleClose = () => {
        setShowPanelShop(false);
        setShowPanelCreateShop(false);
        setShowPanelAssignUsers(false);
        setShowPanelEditShop(false);
    }

    const handleToggleChange = (e) => {
        setShop((prev) => ({
            ...prev,
            toggle: e.target.checked ? 'enable' : 'disable',
        }));
    };    

    const togglePanelCreateShop = () => {
        setShowPanelCreateShop(!showPanelCreateShop);
    };   

    const togglePanelShop = (shop) => {
        setSelectedShop(shop);
        setShowPanelShop(true);
    }
    
    const togglePanelEditShop = () => {
        setShowPanelShop(false);
        setShop({
            shopName: selectedShop.shopName,
            email: selectedShop.email,
            contactNo: selectedShop.contactNo,
            address: selectedShop.address,
            location: selectedShop.location,
            toggle: selectedShop.toggle,
        });
        setShowPanelEditShop(true);
    };    
    
    const togglePanelAssignUsers = async (shop) => {
        if (shop && shop.shopId) {
            setSelectedShop(shop);
            setShowPanelAssignUsers(true);
            setShowPanelShop(false);
    
            try {
                const response = await newRequest.get(`/shops/${shop.shopId}`);
                const assignedUserIds = response.data.userId || [];
                const assignedUsers = users.filter(user => assignedUserIds.includes(user.userId));
                setSelectedUsers(assignedUsers.map(user => ({ value: user.userId, label: user.username })));
            } catch (error) {
                console.error('Error fetching shop details:', error);
            }
        } else {
            console.error('Invalid shop object:', shop);
        }
    };     

    const handleUserSelect = (selectedOption) => {
        if (selectedOption) {
        const newSelectedUsers = selectedOption.map(option => ({
            value: option.value,
            label: option.label
        }));
        setSelectedUsers(newSelectedUsers);
        } else {
        setSelectedUsers([]); // Ensure to handle case where no option is selected
        }
    };

    const handleChange = (e) => {
        setShop((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };    

    const handleCreateShopSubmit = async (e) => {
        e.preventDefault();
        try {
            await newRequest.post("/shops/create", {
                ...shop,
                companyId: selectedCompanyId,
                userId: currentUser.userId,
            });
            setShowPanelCreateShop(false);
            console.log("Shop created successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };              

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredShops(
            shops.filter(shop => shop.shopName.toLowerCase().includes(query) && shop.companyId === selectedCompanyId)
        );
    };

    //update shop details
    const handleEditShopSubmit = async (e) => {
        e.preventDefault();
        console.log('Updated shop data:', shop); // Log the data being sent
        try {
            const response = await newRequest.put(`/shops/update/${selectedShop.shopId}`, shop);
            console.log('API response:', response.data); // Log the response data
            setShops(prevShops =>
                prevShops.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setFilteredShops(prevFilteredShops =>
                prevFilteredShops.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setShowPanelEditShop(false);
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };    

    const handleAssignUsersSubmit = async () => {
        try {
            const userIds = selectedUsers.map(user => user.value);
            await newRequest.put(`/shops/assign-users/${selectedCompanyId}/${selectedShop.shopId}`, {
                userIds
            });
            console.log("Users assigned successfully!");
            setShowPanelAssignUsers(false);
            // Optionally, you can fetch the updated shops data here
        } catch (err) {
            console.error('Error assigning users:', err);
        }
    };

    const handleUnassignUsers = async (userId) => {
        try {
            await newRequest.put(`/shops/unassign-users/${selectedCompanyId}/${selectedShop.shopId}`, {
                userIds: [userId]
            });
            console.log("User unassigned successfully!");
            // Optionally, you can fetch the updated shops data here
        } catch (err) {
            console.error('Error unassigning user:', err);
        }
    };    

    //get the name of user using userId
    const getCreatedByUserName = (userId) => {
        const user = users.find(user => user.userId === userId);
        return user ? user.name : '-'; // Return user name if found, otherwise '-'
    };

    return (
        <React.Fragment>
            <Card>
                <Card.Header>
                    <Card.Title as="h4">Shops</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Button onClick={togglePanelCreateShop} className="btn-create-shop shadow-1 mb-4" variant="primary">
                                Create Shop
                            </Button>
                        </Col>
                    </Row>
                    <Form.Group className='mb-4'>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search Shops by name"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Table responsive variant="info">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Shop Name</th>
                                <th>Email</th>
                                <th>Contact No</th>
                                <th>Address</th>
                                <th>Created By</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShops.map((shop, index) => (
                                <tr key={shop._id}>
                                    <td>{index + 1}</td>
                                    <td>{shop.shopName}</td>
                                    <td>{shop.email}</td>
                                    <td>{shop.contactNo}</td>
                                    <td>{shop.address}</td>
                                    <td>{getCreatedByUserName(shop.createdBy)}</td>
                                    <td>{new Date(shop.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <MoreHorizIcon onClick={() => togglePanelShop(shop)} className='show-popup-icon' />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {showPanelCreateShop && (
                <div className="panel-create-shop-popup">
                    <Card className='panel-create-shop' ref={panelCreateShopRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Create Shop</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <form onSubmit={handleCreateShopSubmit}>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Shop Name" name="shopName" onChange={handleChange} required/>
                                </div>
                                {emailError && <div className="text-danger">{emailError}</div>}
                                <div className="input-group mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Email"
                                        name="email"
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

                                <button className="btn btn-primary mb-4" type='submit'>Create</button>
                            </form>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {showPanelShop && (
                <div className="panel-shop-popup">
                    <Card className='panel-shop' ref={panelShopRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Manage Shop</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <Row>
                                <Button className="shadow-1" variant="success" onClick={() => togglePanelAssignUsers(selectedShop)}>Assign Users</Button>
                                <Button className="shadow-1" variant="primary" onClick={togglePanelEditShop}>Edit</Button>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {showPanelAssignUsers && (
                <div className="panel-assign-users-popup">
                    <Card className='panel-assign-users' ref={panelAssignUsersRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Assign Users to {selectedShop?.shopName}</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                <Col>
                                    <Select
                                        options={users.map(user => ({ value: user.userId, label: user.username }))}
                                        onChange={handleUserSelect}
                                        value={selectedUsers}
                                        placeholder="Select users"
                                        isMulti
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Table responsive variant="info" className="mt-4">
                                <thead>
                                    <tr>
                                        <th>User Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUsers.map(user => (
                                        <tr key={user.value}>
                                            <td>{user.label}</td>
                                            <td>
                                                <Button variant="danger" className='btn-unassign' onClick={() => handleUnassignUsers(user.value)}>Unassign</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Button variant="primary" onClick={handleAssignUsersSubmit}>
                                Save Changes
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            )}  

            {showPanelEditShop && (
                <div className="panel-edit-shop-popup">
                    <Card className='panel-edit-shop' ref={panelEditShopRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Edit Shop</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <Form onSubmit={handleEditShopSubmit}>
                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Shop Name
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="shopName" value={shop.shopName} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Email</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={shop.email}
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
                                        <Form.Control type="text" name="contactNo" value={shop.contactNo} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group> 

                                <Form.Group xd={12} md={12} sm={12} col={12} className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Address
                                    </Form.Label>
                                    <Col>
                                        <Form.Control type="text" name="address" value={shop.address} onChange={handleChange} required/>
                                    </Col>
                                </Form.Group> 

                                <Form.Group className="mb-3 status" as={Row}>
                                    <Col sm={9} name="toggle">
                                        <Form.Check
                                            label="Active/Inactive"
                                            name="toggle"
                                            checked={shop.toggle === 'enable'} // Adjust checked state based on toggle value
                                            onChange={handleToggleChange}
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

PanelShop.propTypes = {
    selectedCompanyId: PropTypes.string.isRequired,
};

export default PanelShop;
