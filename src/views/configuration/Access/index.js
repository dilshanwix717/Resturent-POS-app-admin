import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Button } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import newRequest from '../../../utils/newRequest';
import './index.scss';

const UserAccess = () => {
  const [showPanelCreateUser, setShowPanelCreateUser] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState({
    userId: '',
    username: '',
    password: '',
    currentPassword: '',
    newPassword: ''
  });

  const panelCreateUserRef = useRef(null);

  const handleCreateUserClick = () => {
    setIsEditMode(false);
    setUserData({
      userId: '',
      username: '',
      password: '',
      currentPassword: '',
      newPassword: ''
    });
    setShowPanelCreateUser(true);
  };

  const handleClose = () => {
    setShowPanelCreateUser(false);
    setIsEditMode(false);
    setUserData({
      userId: '',
      username: '',
      password: '',
      currentPassword: '',
      newPassword: ''
    });
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setUserData({
      userId: user.userId,
      username: user.username,
      currentPassword: '',
      newPassword: ''
    });
    setShowPanelCreateUser(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        // Update user password
        if (!userData.currentPassword || !userData.newPassword) {
          alert('Please provide both current and new password.');
          return;
        }

        const payload = {
          userId: userData.userId,
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword
        };
        console.log(payload);
        await newRequest.put('/discount/pwd', payload);
        alert('Password updated successfully!');
      } else {
        // Create new user
        if (!userData.username || !userData.password) {
          alert('Please provide both username and password.');
          return;
        }

        const payload = {
          username: userData.username,
          password: userData.password
        };

        await newRequest.post('/discount/createUser', payload);
        alert('User created successfully!');
      }
      handleClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`);
    }
  };

  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch discount users
    const fetchUsers = async () => {
      try {
        const response = await newRequest.get('/discount/getUsers');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching discount users:', error);
      }
    };

    fetchUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Handle search input change and reset pagination
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  // Filter users based on the search query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Pagination handlers
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
            <Card.Title className="mb-3" as="h5">Users with discount authorization</Card.Title>

            <Row>
              <Col>
                <Button className="btn-create-product shadow-1 mb-4" variant="primary" onClick={handleCreateUserClick}>
                  Create Discount User
                </Button>
              </Col>

              <Col>
                <Form.Control
                  type="text"
                  placeholder="Search by username or name"
                  className="mb-3"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>No</th>
                  <th>User ID</th>
                  <th>Username</th>
                  {/* <th>Name</th>
                  <th>Email</th> */}
                  <th>Company ID</th>
                  {/* <th>Status</th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{user.userId || '-'}</td>
                    <td>{user.username || '-'}</td>
                    {/* <td>{user.name || '-'}</td>
                    <td>{user.email || '-'}</td> */}
                    <td>{user.companyId || '-'}</td>
                    {/* <td>{user.toggle || '-'}</td> */}
                    <td>
                      <EditIcon className='edit-icon' onClick={() => handleEdit(user)} />
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
          </Card.Body>
        </Card>
      </Row>
      {showPanelCreateUser && (
        <div className="panel-create-product-popup position-absolute">
          <Card className="panel-create-product" ref={panelCreateUserRef}>
            <Card.Header className="popup-header">
              <Card.Title as="h5">{isEditMode ? 'Update Password' : 'Create New Discount User'}</Card.Title>
              <CloseIcon onClick={handleClose} className="close-icon" />
            </Card.Header>
            <Card.Body>
              <Form>
                {isEditMode ? (
                  <>
                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalUserId">
                      <Form.Label column sm={3}>User ID</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          type="text"
                          value={userData.userId}
                          disabled
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalUsername">
                      <Form.Label column sm={3}>Username</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          type="text"
                          value={userData.username}
                          disabled
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalCurrentPassword">
                      <Form.Label column sm={3}>Current Password</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          name="currentPassword"
                          type="password"
                          value={userData.currentPassword}
                          onChange={handleChange}
                          placeholder="Enter current password"
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalNewPassword">
                      <Form.Label column sm={3}>New Password</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          name="newPassword"
                          type="password"
                          value={userData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                      </Col>
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalUsername">
                      <Form.Label column sm={3}>Username</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          name="username"
                          type="text"
                          value={userData.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalPassword">
                      <Form.Label column sm={3}>Password</Form.Label>
                      <Col sm={9}>
                        <Form.Control
                          name="password"
                          type="password"
                          value={userData.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                        />
                      </Col>
                    </Form.Group>
                  </>
                )}
              </Form>

              <Form.Group className="mb-3" as={Row}>
                <Col sm={{ span: 10, offset: 0 }}>
                  <Button onClick={handleSubmit}>Submit</Button>
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>
        </div>
      )}
    </React.Fragment>
  );
};

export default UserAccess;