import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import newRequest from '../../utils/newRequest';
import PropTypes from 'prop-types';
import '../../assets/scss/components/PanelUser.scss';

const PanelUser = ({ selectedCompanyId }) => {
    const [showPanelUser, setShowPanelUser] = useState(false);
    const [showPanelCreateUser, setShowPanelCreateUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const panelCreateUserRef = useRef(null);
    const panelUserRef = useRef(null);

    const [user, setUser] = useState({
        username: '',
        name: '',
        password: '',
        role: '',
        email: '',
        companyId: '',
        tel: '',
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await newRequest.get('/auth', {
                    params: {
                        companyId: selectedCompanyId
                    }
                });
                setUsers(response.data);
                setFilteredUsers(response.data.filter(user => user.companyId === selectedCompanyId)); // Filter users by selected company
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [selectedCompanyId]);

    //validate email
    const validateEmail = (email) => {
        const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return emailPattern.test(email);
    };
    
    const handleEmailChange = (e) => {
        const { value } = e.target;
        setUser((prev) => ({ ...prev, email: value }));
    
        if (validateEmail(value)) {
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address.');
        }
    };

    //close popups
    const handleClose = () => {
        setShowPanelCreateUser(false);
        setShowPanelUser(false);
        setShowPanelUser(false);
      }

    const togglePanelCreateUser = () => {
        setShowPanelCreateUser(!showPanelCreateUser);
    };

    const togglePanelUser = (user) => {
        setSelectedUser({
            username: user.username,
            name: user.name,
            email: user.email,
            tel: user.tel,
            address: user.address,
            location: user.location,
            role: user.role,
            toggle: user.toggle,
            userId: user.userId,  // Include userId for updating purposes
            // Don't include the password field here
        });
    
        setShowPanelUser(true);
    };

    const handleChange = (e) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleToggleChange = (e) => {
        setSelectedUser((prev) => ({
            ...prev,
            toggle: e.target.checked ? 'enable' : 'disable',
        }));
    };    

    const handleCreateUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await newRequest.post("/auth/registerUser", {
                ...user,
                companyId: selectedCompanyId,
                createdBy: currentUser.userId,
            });
            setShowPanelCreateUser(false);
            console.log("User created successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);
        }
    };

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        
        // Create a copy of selectedUser to avoid mutating state directly
        const userPayload = { ...selectedUser };
        
        // If the password field is empty, delete it from the payload
        if (!userPayload.password) {
            delete userPayload.password;
        }
    
        try {
            const updatedUser = await newRequest.put(`/users/${selectedUser.userId}`, userPayload);
            
            // Update the state with the updated user data from the server
            setSelectedUser(updatedUser.data);
    
            // Update users state to reflect the changes
            setUsers(prevUsers =>
                prevUsers.map(u => (u.userId === selectedUser.userId ? updatedUser.data : u))
            );
    
            setShowPanelUser(false);
            console.log('User updated successfully');
            window.location.reload(); // Reload the browser
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };         
    
    // const handleEditUserSubmit = async (e) => {
    //     e.preventDefault();
    
    //     // Log the payload before sending the request
    //     console.log('Payload being sent:', selectedUser);
    
    //     try {
    //         const updatedUser = await newRequest.put(`/users/${selectedUser.userId}`, selectedUser);
            
    //         // Update selectedUser state with the updated user data
    //         setSelectedUser(updatedUser.data);
            
    //         // Update users state to reflect the changes
    //         setUsers(prevUsers =>
    //             prevUsers.map(u => (u.userId === selectedUser.userId ? updatedUser.data : u))
    //         );
    
    //         setShowPanelUser(false);
    //         console.log('User updated successfully');
    //         // window.location.reload(); // Reload the browser
    //     } catch (error) {
    //         console.error('Error updating user:', error);
    //     }
    // };     

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(
            users.filter(user => user.name.toLowerCase().includes(query) && user.companyId === selectedCompanyId)
        );
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
                    <Card.Title as="h4">Users</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Button onClick={togglePanelCreateUser} className="btn-create-user shadow-1 mb-4" variant="primary">
                                Create User
                            </Button>
                        </Col>
                    </Row>
                    <Form.Group className='mb-4'>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search Users by name"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Table responsive variant="info">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Contact No</th>
                                <th>Address</th>
                                <th>Role</th>
                                <th>Created By</th>
                                <th>Created At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.userId}>
                                    <td>{index + 1}</td>
                                    <td>{user.username}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.tel}</td>
                                    <td>{user.address}</td>
                                    <td>{user.role}</td>
                                    <td>{getCreatedByUserName(user.createdBy)}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td><MoreHorizIcon onClick={() => togglePanelUser(user)} className='show-popup-icon'/></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {showPanelCreateUser && (
                <div className="panel-create-user-popup">
                    <Card className='panel-create-user' ref={panelCreateUserRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Create User</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <form onSubmit={handleCreateUserSubmit}>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Username" name="username" onChange={handleChange} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Name" name="name" onChange={handleChange} required/>
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
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password"
                                        name="password"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="showPasswordCheckbox"
                                        onChange={() => setShowPassword(prevShowPassword => !prevShowPassword)}
                                    />
                                    <label className="form-check-label mb-3" htmlFor="showPasswordCheckbox">
                                        Show Password
                                    </label>
                                </div>
                                <Form.Control className='mb-3' as="select" name="role" onChange={handleChange} required>
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="stockManager">Stock Manager</option>
                                    <option value="cashier">Cashier</option>
                                </Form.Control>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Contact No" name="tel" onChange={handleChange} required/>
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

            {showPanelUser && (
                <div className="panel-edit-user-popup">
                    <Card className='panel-edit-user' ref={panelUserRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Edit User</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon'/>
                        </Card.Header>
                        <Card.Body> 
                            <Form onSubmit={handleEditUserSubmit}>
                                <Form.Group controlId="formUsername" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Username</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter username"
                                            value={selectedUser.username}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group controlId="formName" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Name</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter name"
                                            value={selectedUser.name}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group controlId="formPassword" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Password</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"} // Toggle type
                                            placeholder="Enter new password"
                                            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formHorizontalShowPassword" xd={12} md={12} sm={12} col={12} as={Row}>
                                    <Form.Label column sm={3}></Form.Label>
                                    <Col>
                                        <Form.Check
                                        type="checkbox"
                                        label="Show Password"
                                        onChange={() => setShowPassword(prevShowPassword => !prevShowPassword)}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Email</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={selectedUser.email}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                            isInvalid={emailError !== ''}
                                        />
                                    </Col>
                                    <Form.Control.Feedback type="invalid">
                                        {emailError}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="formRole" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Role</Form.Label>
                                    <Col>
                                        <Form.Control
                                            as="select"
                                            value={selectedUser.role}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="stockManager">Stock Manager</option>
                                            <option value="cashier">Cashier</option>
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                <Form.Group controlId="formTel" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Telephone</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter telephone number"
                                            value={selectedUser.tel}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, tel: e.target.value })}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group controlId="formAddress" xd={12} md={12} sm={12} col={12} className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Address</Form.Label>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter address"
                                            value={selectedUser.address}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3 status" as={Row}>
                                    <Col sm={9} name="toggle">
                                        <Form.Check
                                            label="Active/Inactive"
                                            name="toggle"
                                            checked={selectedUser.toggle === 'enable'} // Adjust checked state based on toggle value
                                            onChange={handleToggleChange}
                                        />
                                    </Col>
                                </Form.Group>
                                
                                <Button variant="primary" type="submit">Update</Button>
                                
                            </Form>

                        </Card.Body>
                    </Card>
                </div>
            )} 
        </React.Fragment>
    );
};

PanelUser.propTypes = {
    selectedCompanyId: PropTypes.string.isRequired,
};

export default PanelUser;
