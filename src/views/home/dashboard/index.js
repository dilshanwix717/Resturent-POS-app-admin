import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { format } from 'date-fns';
import newRequest from '../../../utils/newRequest.js';
import Chart from './Chart.js';

const Dashboard = () => {
  const [totalPurchase, setTotalPurchase] = useState('Rs. 0');
  const [totalSales, setTotalSales] = useState('Rs. 0');
  const [totalProducts, setTotalProducts] = useState('0');
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    navigate('/login', { replace: true });
  }
  const userCompany = currentUser.companyId;
  const userShop = currentUser.shopId;

  useEffect(() => {
    const fetchCompanyDate = async () => {
      try {
        const response = await newRequest.get(`/companies/${userCompany}`);
        const createdDate = new Date(response.data.createdAt);

        const formattedFromDate = format(createdDate, 'yyyy-MM-dd');
        const formattedToDate = format(new Date(), 'yyyy-MM-dd');

        const salesResponse = await newRequest.get(`/orders/Sales/${formattedFromDate}/${formattedToDate}`);
        setTotalSales(`Rs. ${salesResponse.data.totalSales}`);

        // Calculate total products sold
        const totalSold = salesResponse.data.salesDetails.reduce((acc, item) => acc + item.finishedgoodQty, 0);
        setTotalProductsSold(totalSold);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    const fetchOrders = async () => {
      try {
        //Calculate order coxunt
        const orders = await newRequest.get('/orders');
        const allOrders = orders.data

        // Filter products by userCompany
        const filteredOrders = allOrders.filter(order => order.shopId === userShop);
        setTotalOrders(filteredOrders.length); // Update total products
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await newRequest.get('/products');
        const allProducts = response.data;

        // Filter products by userCompany
        const filteredProducts = allProducts.filter(product => product.companyId === userCompany);
        setTotalProducts(filteredProducts.length); // Update total products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await newRequest.get('/customers');
        const allCustomers = response.data;

        // Filter products by userShop
        const filteredCustomers = allCustomers.filter(customer => customer.shopId === userShop);
        setTotalCustomers(filteredCustomers.length); // Update total products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    // const fetchTotalPurchase = async () => {
    //   try {
    //     const response = await newRequest.get('/grns'); // Endpoint to get all GRNs
    //     const grns = response.data.grns;

    //     // Filter GRNs by userCompany
    //     const filteredGrns = grns.filter(grn => grn.companyId === userCompany); // Adjust 'companyId' if needed

    //     // Calculate total purchase cost from filtered GRNs
    //     const totalCost = filteredGrns.reduce((acc, grn) => acc + grn.totalCost, 0); // Adjust 'totalCost' if needed
    //     setTotalPurchase(`Rs. ${totalCost}`);
    //   } catch (error) {
    //     console.error('Error fetching GRNs:', error);
    //   }
    // }; 

    const fetchTotalPurchase = async () => {
      try {
        const response = await newRequest.get('/grns'); // Endpoint to get all GRNs
        const grns = response.data.grns;

        // Filter GRNs by userShop
        const filteredGrns = grns.filter(grn => grn.shopId === userShop); // Adjust 'shopId' if needed

        // Calculate total purchase cost from filtered GRNs
        const totalCost = filteredGrns.reduce((acc, grn) => acc + grn.totalCost, 0); // Adjust 'totalCost' if needed
        setTotalPurchase(`Rs. ${totalCost}`);
      } catch (error) {
        console.error('Error fetching GRNs:', error);
      }
    };

    fetchCompanyDate();
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchTotalPurchase();
  }, []);

  const dashSalesData = [
    { title: 'Product Sales', amount: totalSales, icon: 'icon-arrow-up text-c-green', value: 0, class: 'progress-c-theme' },
    { title: 'Total Purchase', amount: totalPurchase, icon: 'icon-arrow-down text-c-red', value: 0, class: 'progress-c-theme2' },
    { title: 'Sales Return', amount: 'Rs. 0', icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' },
    // { title: 'Gross Profit', amount: 'Rs. 0', icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' },
    { title: 'Total Products (Company Wise)', amount: totalProducts, icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' },
    { title: 'Total Products Sold', amount: totalProductsSold, icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' },
    { title: 'Total Receipts', amount: totalOrders, icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' },
    { title: 'Total Customers', amount: totalCustomers, icon: 'icon-arrow-up text-c-green', value: 0, color: 'progress-c-theme' }
  ];

  return (
    <React.Fragment>
      <Row>
        {dashSalesData.map((data, index) => (
          <Col key={index} xl={6} xxl={3}>
            <Card>
              <Card.Body>
                <h6 className="mb-4">{data.title}</h6>
                <div className="row d-flex align-items-center">
                  <div className="col-9">
                    <h3 className="f-w-300 d-flex align-items-center m-b-0">
                      {/* <i className={`feather ${data.icon} f-30 m-r-5`} /> */}
                      {data.amount}

                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {/* Line chart component */}
        <Col md={12} xl={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Sales Over Time</Card.Title>
            </Card.Header>
            <Card.Body>
              <Chart />  {/* Render the chart here */}
            </Card.Body>
          </Card>
        </Col>


      </Row>
    </React.Fragment>
  );
};

export default Dashboard;
