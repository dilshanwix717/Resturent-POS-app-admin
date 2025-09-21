import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Col, Row } from 'react-bootstrap';
// import { NavLink, Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import newRequest from "../../../utils/newRequest";
import Select from 'react-select';
import './SignIn1.scss';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

// import { CopyToClipboard } from 'react-copy-to-clipboard';

const Signin1 = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [error, setError] = useState(null);
  // const [companies, setCompanies] = useState([]);
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeShops, setActiveShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompaniesAndShops = async () => {
      try {
        const companiesResponse = await newRequest.get('/companies');
        const shopsResponse = await newRequest.get('/shops');

        // Filter active companies and shops
        const activeCompanies = companiesResponse.data.filter(company => company.toggle === 'enable');
        const activeShops = shopsResponse.data.filter(shop => shop.toggle === 'enable');

        setActiveCompanies(activeCompanies);
        setActiveShops(activeShops);
      } catch (error) {
        console.error('Error fetching companies or shops:', error);
      }
    };

    fetchCompaniesAndShops();
  }, []);

  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption.value);
    setFilteredShops(activeShops.filter(shop => shop.companyId === selectedOption.value));
    setSelectedShop(null); // Reset the selected shop
    setSelectedShopId(''); // Clear the previously selected shopId
  };

  const handleShopSelect = (selectedOption) => {
    setSelectedShop(selectedOption);
    setSelectedShopId(selectedOption ? selectedOption.value : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessageClass(""); // Reset message class

    try {
      const payload = { username, password, shopId: selectedShopId };
      const res = await newRequest.post("/auth/login", payload);

      // Check if the user's role is cashier and prevent login
      if (res.data.role === "cashier") {
        setError("Cashiers are not allowed to log in.");
        setMessageClass("error-message");
        return; // Prevent further execution
      }

      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(res.data));
      console.log('Stored user data:', res.data);

      // Set success message class
      setMessageClass("success-message");

      // Navigate to the dashboard after a delay
      navigate("/dashboard");
      window.location.reload(); // Reload the browser
    } catch (err) {
      // Check if the error is due to user not found
      const errorMessage = err.response?.data?.message || "An error occurred";

      if (err.response?.status === 404 && errorMessage === "User not found") {
        setError("No user found with the provided credentials.");
      } else {
        setError(errorMessage);
      }

      setMessageClass("error-message");
    }
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless">
            <Card.Body>
              <div className="mb-4 text-center">
                <img src='/logo.png' style={{width: "100px"}} alt='logo'/>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formHorizontalEmail">
                  <Col>
                    <Form.Control name="username" type="text" onChange={e => setUsername(e.target.value)} placeholder='Username' required />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formHorizontalPassword">
                  <Col>
                    <Form.Control
                      name="password"
                      type={showPassword ? "text" : "password"} // Toggle type
                      onChange={e => setPassword(e.target.value)}
                      placeholder='Password'
                      required
                    />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formHorizontalShowPassword">
                  <Col>
                    <Form.Check
                      type="checkbox"
                      label="Show Password"
                      onChange={() => setShowPassword(prevShowPassword => !prevShowPassword)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formHorizontalCompany" as={Row}>
                  <Col>
                    <Select
                      options={activeCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                      onChange={handleCompanySelect}
                      placeholder="Select Company"
                      isClearable
                      required
                    />
                  </Col>
                </Form.Group>

                {selectedCompanyId && (
                  <Form.Group className="mb-3" controlId="formHorizontalShop" as={Row}>
                    <Col>
                      <Select
                        value={selectedShop} // Controlled value for react-select
                        options={filteredShops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                        onChange={handleShopSelect}
                        placeholder="Select Shop"
                        isClearable
                        required
                      />
                    </Col>
                  </Form.Group>
                )}

                {error && (
                  <Form.Group className="mb-3 text-center">
                    <Col>
                      <p className={`error-message ${messageClass}`}>{error}</p>
                    </Col>
                  </Form.Group>
                )}

                {/* <Form.Group className="mb-3" controlId="formHorizontalCheck">
                  <Col>
                    <Form.Check label="Remember me" />
                  </Col>
                </Form.Group> */}

                <Form.Group className="mb-3 text-center" as={Row}>
                  <Col>
                    <Button type="submit">Sign In</Button>
                  </Col>
                </Form.Group>
              </Form>

              {/* <p className="mb-2 text-muted">
                Forgot password?{' '}
                <NavLink to="/auth/reset-password-1" className="f-w-400">
                  Reset
                </NavLink>
              </p>
              <p className="mb-0 text-muted">
                Don’t have an account?{' '}
                <NavLink to="/auth/signup-1" className="f-w-400">
                  Signup
                </NavLink>
              </p>
              <Alert variant="primary" className="text-start mt-3">
                User:
                <CopyToClipboard text="info@codedthemes.com">
                  <Button variant="outline-primary" as={Link} to="#" className="badge mx-2 mb-2" size="sm">
                    <i className="fa fa-user" /> info@codedthemes.com
                  </Button>
                </CopyToClipboard>
                <br />
                Password:
                <CopyToClipboard text="123456">
                  <Button variant="outline-primary" as={Link} to="#" className="badge mx-2" size="sm">
                    <i className="fa fa-lock" /> 123456
                  </Button>
                </CopyToClipboard>
              </Alert> */}
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
