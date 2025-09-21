import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import '../../assets/scss/components/TopPanel.scss';

const TopPanel = () => {
    return (
        <React.Fragment>
            <Row>
                <h2 className='mb-4'>Super Admin Panel</h2>

                <Col xl={6} md={6} sm={12} col={12}>
                    <Card className='top-panel'>
                        <Card.Header>
                        <Card.Title as="h5">Super Admin Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                        <Row>
                            <Col>
                                <h6>Name</h6>
                                <h6>Company Registration</h6>
                                <h6>Address</h6>
                                <h6>Telephone</h6>
                            </Col>
                            <Col>
                                <h6>- Lorem Ipsum</h6>
                                <h6>- Lorem Ipsum</h6>
                                <h6>- Lorem Ipsum</h6>
                                <h6>- 123456789</h6>
                            </Col>
                        </Row>
                        </Card.Body>
                    </Card>
                    </Col>

                    <Col xl={6} md={6} sm={12} col={12}>
                    <Card className='top-panel'>
                        <Card.Header>
                        <Card.Title as="h5">Activity History</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ul>
                            <li>Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo.</li>
                            <li>Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo.</li>
                            <li>Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo.</li>
                            <li>Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo.</li>
                            <li>Donec ultricies, lacus id tempor condimentum, orci leo faucibus sem, a molestie libero lectus ac justo.</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
}

export default TopPanel;