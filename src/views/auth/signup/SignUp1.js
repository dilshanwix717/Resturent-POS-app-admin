import React, { useState } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import newRequest from "../../../utils/newRequest";
import { useNavigate } from "react-router-dom";

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

const SignUp1 = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
      username: "",
      name: "",
      password: "",
      role: "cashier",
      companyName: "Ceylon X",
  });

  const handleChange = (e) => {
      setUser((prev) => {
          return { ...prev, [e.target.name]: e.target.value };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await newRequest.post("/auth/register", {
            ...user,
        });

        console.log("Registration successful!"); // Add this line

        navigate("/auth/signin");
    } catch (err) {
        console.log(err);
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
            <Row className="align-items-center">
              <Col>
                <Card.Body className="text-center">
                  <div className="mb-4">
                    <i className="feather icon-user-plus auth-icon" />
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <h3 className="mb-4">Sign up</h3>
                    <div className="input-group mb-3">
                      <input type="text" className="form-control" placeholder="Username" name="username" onChange={handleChange} required/>
                    </div>

                    <div className="input-group mb-3">
                      <input type="text" className="form-control" placeholder="Name" name="name" onChange={handleChange} required/>
                    </div>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
                    <Form.Label>Select role</Form.Label>
                      <Form.Control as="select" name="role" onChange={handleChange} required>
                        <option>Select</option>
                        <option value="superAdmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="cashier">Cashier</option>
                      </Form.Control>
                    </Form.Group>

                    <div className="input-group mb-4">
                      <input type="password" className="form-control" placeholder="Password" name="password" onChange={handleChange} required/>
                    </div>

                    <button className="btn btn-primary mb-4" type='submit'>Sign up</button>
                  </form>

                  <p className="mb-2">
                    Already have an account?{' '}
                    <NavLink to="/auth/signin" className="f-w-400">
                      Login
                    </NavLink>
                  </p>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignUp1;
