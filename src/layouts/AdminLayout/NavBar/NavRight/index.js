import React, { useState, useEffect } from 'react';
import { ListGroup, Dropdown, Modal, Button, Table } from 'react-bootstrap';
import { Link, } from 'react-router-dom';
import newRequest from '../../../../utils/newRequest';
import ChatList from './ChatList';
import avatar2 from '../../../../assets/images/user/avatar-2.jpg';
import './index.scss';

const NavRight = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [shops, setShops] = useState([]);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      if (storedUser && storedUser.sessionToken) {
        setCurrentUser(storedUser);
      }
    };

    fetchUserData();
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

    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchCompanies();
    fetchShops();
  }, []);

  const handleLogout = async () => {
    try {
      await newRequest.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      window.location.href = "/auth/signin"; // Redirect to login page
    }
  };

  // const handleSessionExpired = () => {
  //   setShowModal(true);
  // };

  const handleCloseModal = async () => {
    setShowModal(false);
    await handleLogout();
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.companyId === companyId);
    return company ? company.companyName : '-';
  };

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.shopId === shopId);
    return shop ? shop.shopName : '-';
  };

  return (
    <>
      <ListGroup as="ul" className="navbar-nav ml-auto">
        <ListGroup.Item as="li">
          <Dropdown align="start" className="drp-user">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="icon feather icon-settings" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head">
                <img src={avatar2} className="img-radius" alt="User Profile" />
                <span>{currentUser.username}</span>
              </div>
              <Table>
                <tbody>
                  <tr>
                    <td>Company</td>
                    <td>{getCompanyName(currentUser.companyId)}</td>
                  </tr>
                  <tr>
                    <td>Shop</td>
                    <td>{getShopName(currentUser.shopId)}</td>
                  </tr>
                </tbody>
              </Table>
              <ListGroup.Item as="li">
                <Link to="#" className="dropdown-item" onClick={handleLogout}>
                  <i className="feather icon-log-out" /> Logout
                </Link>
              </ListGroup.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>
      <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Session Expired</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your session has expired. You will be logged out.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavRight;
