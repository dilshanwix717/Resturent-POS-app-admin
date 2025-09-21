import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Button } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import newRequest from '../../../utils/newRequest';
import './index.scss';

const Printers = () => {
  const [showPanelCreateDevice, setShowPanelCreateDevice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deviceData, setDeviceData] = useState({
    companyId: '',
    shopId: '',
    deviceType: '',
    name: '',
    deviceLocation: '',
    ipaddress: '',
    PORT: '',
    deviceId: ''
  });

  const panelCreateDeviceRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userShop = currentUser.shopId;

  const handleCreateDeviceClick = () => {
    setIsEditMode(false);
    setDeviceData({
      shopId: '',
      deviceType: '',
      name: '',
      deviceLocation: '',
      ipaddress: '',
      PORT: '',
      deviceId: ''
    });
    setShowPanelCreateDevice(true);
  };

  const handleClose = () => {
    setShowPanelCreateDevice(false);
    setIsEditMode(false);
    setDeviceData({
      shopId: '',
      deviceType: '',
      name: '',
      deviceLocation: '',
      ipaddress: '',
      PORT: '',
      deviceId: ''
    });
    window.location.reload();
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setDeviceData({ ...deviceData, [name]: selectedOption.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeviceData({ ...deviceData, [name]: value });
  };

  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const userRole = storedUser.role;
  const userCompanyId = storedUser.companyId;
  const userShopId = storedUser.shopId;

  const handleEdit = (device) => {
    setIsEditMode(true);
    setDeviceData({
      companyId: device.companyId,
      shopId: device.shopId,
      deviceType: device.deviceType,
      name: device.deviceName,
      deviceLocation: device.deviceLocation,
      ipaddress: device.deviceIPaddress,
      PORT: device.PORT,
      deviceId: device.deviceId
    });
    setShowPanelCreateDevice(true);
  };

  const handleSubmit = async () => {
    // const allFieldsFilled = Object.values(deviceData).every((value) => value);

    // if (!allFieldsFilled) {
    //   console.log(deviceData);
    //   alert('Please fill in all the fields.');
    //   return;
    // }

    const payload = {
      companyId: userRole === 'admin' ? userCompanyId : deviceData.companyId,
      shopId: userRole === 'admin' ? userShopId : deviceData.shopId,
      deviceType: deviceData.deviceType,
      deviceName: deviceData.name,
      deviceLocation: deviceData.deviceLocation,
      deviceIPaddress: deviceData.ipaddress,
      PORT: deviceData.PORT
    };

    try {
      console.log(payload);
      if (isEditMode) {
        // Update device
        await newRequest.put(`devices/update-device/${deviceData.deviceId}`, payload);
        // alert('Device updated successfully:', response.data);
      } else {
        // Add new device
        await newRequest.post('devices/add-device', payload);
        // alert('Device added successfully:', response.data);
      }
      handleClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} device:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'add'} device. Please try again.`);
    }
  };

  const [companyOptions, setCompanyOptions] = useState([]);
  const [shopOptions, setShopOptions] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await newRequest.get('/companies');
        const companyData = response.data;
  
        const enabledCompanies = companyData.filter(company => company.toggle === 'enable');
  
        const formattedOptions = enabledCompanies.map(company => ({
          value: company.companyId,
          label: company.companyName.trim(),
        }));
  
        setCompanyOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
  
    fetchCompany();
  }, []);
  
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        const shopData = response.data;
  
        setShops(shopData);
  
        let filteredShops = shopData.filter(shop => shop.toggle === 'enable');
  
        if (selectedCompany) {
          filteredShops = filteredShops.filter(shop => shop.companyId === selectedCompany.value);
        }
  
        const formattedOptions = filteredShops.map(shop => ({
          value: shop.shopId,
          label: shop.shopName.trim(),
        }));
  
        setShopOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };
  
    fetchShops();
  }, [selectedCompany]);
  

  const handleCompanyChange = (selectedOption) => {
    setSelectedCompany(selectedOption);
    setDeviceData(prevData => ({
      ...prevData,
      companyId: selectedOption ? selectedOption.value : '',
      shopId: '',
    }));
  };

  const handleShopChange = (selectedOption) => {
    setDeviceData(prevData => ({
      ...prevData,
      shopId: selectedOption ? selectedOption.value : '',
    }));
  };


  const devicetypeOptions = [
    { value: 'Printer', label: 'Printer' },
    { value: 'POS', label: 'POS' }
  ];

  const deviceLocationOptions = [
    { value: 'Cold Kitchen', label: 'Cold Kitchen' },
    { value: 'Hot Kitchen', label: 'Hot Kitchen' },
    { value: 'Bar', label: 'Bar' },
    { value: 'Cashier', label: 'Cashier' },
  ];

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = storedUser.role;
    const userCompanyId = storedUser.companyId;
    const userShopId = storedUser.shopId;

    newRequest.get('/devices')
    .then(response => {
      let filteredDevices = response.data;
      // console.error('Error fetching GRNs data:', filteredDevices);
      
      if (userRole === 'admin') {
        filteredDevices = filteredDevices.filter(devices => devices.companyId === userCompanyId && devices.shopId === userShopId);
      }

      setDevices(filteredDevices);
    })
    .catch(error => {
      console.error('Error fetching GRNs data:', error);
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Handle search input change and reset pagination
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  // Filter devices based on the search query
  const filteredDevices = devices.filter(device =>
    (device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.deviceLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.deviceIPaddress.toLowerCase().includes(searchQuery.toLowerCase())) &&
    device.shopId === userShop
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

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

  const getShopName = (shopId) => {
    const shop = shops.find((s) => s.shopId === shopId);
    return shop ? shop.shopName : '-';
  };

  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Printers Details</Card.Title>

            <Row>
              <Col>
                <Button className="btn-create-product shadow-1 mb-4" variant="primary" onClick={handleCreateDeviceClick}>
                  Create Device
                </Button>
              </Col>
            
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Search Device by name"
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
                  <th>Device Id</th>
                  <th>Device Name</th>
                  <th>Device Type</th>
                  <th>Shop</th>
                  <th>Location</th>
                  <th>IP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentDevices.map((device, index) => (
                  <tr key={device.deviceId}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{device.deviceId || '-'}</td>
                    <td>{device.deviceName || '-'}</td>
                    <td>{device.deviceType || '-'}</td>
                    <td>{getShopName(device.shopId)}</td>
                    <td>{device.deviceLocation || '-'}</td>
                    <td>{device.deviceIPaddress || '-'}</td>
                    <td>
                      <EditIcon className='edit-icon' onClick={() => handleEdit(device)} />
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
            {/* <Row>
              <Col>
                <span>{glowButtons}</span>
              </Col>
            </Row> */}
          </Card.Body>
        </Card>
      </Row>
      {showPanelCreateDevice && (
        <div className="panel-create-product-popup position-absolute">
          <Card className="panel-create-product" ref={panelCreateDeviceRef}>
            <Card.Header className="popup-header">
              <Card.Title as="h5">Device Details</Card.Title>
              <CloseIcon onClick={handleClose} className="close-icon" />
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalCompany">
                  <Form.Label column sm={3}>Company ID</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="companyId"
                      value={userRole === 'admin' 
                        ? companyOptions.find(option => option.value === userCompanyId)
                        : companyOptions.find(option => option.value === deviceData.companyId)
                      }
                      onChange={handleCompanyChange}
                      options={companyOptions}
                      isSearchable
                      isDisabled={userRole === 'admin'}
                    />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalShop">
                  <Form.Label column sm={3}>Shop ID</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="shopId"
                      value={userRole === 'admin' 
                        ? shopOptions.find(option => option.value === userShopId)
                        : shopOptions.find(option => option.value === deviceData.shopId)
                      }
                      onChange={handleShopChange}
                      options={shopOptions}
                      isSearchable
                      isDisabled={userRole === 'admin'}
                    />
                  </Col>
                </Form.Group>
    
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalSupplier">
                  <Form.Label column sm={3}>Device Type</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="deviceType"
                      value={devicetypeOptions.find(option => option.value === deviceData.deviceType)}
                      onChange={handleSelectChange}
                      options={devicetypeOptions}
                      placeholder="Select a Device Type"
                      isSearchable
                    />
                  </Col>
                </Form.Group>
    
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalRemarks">
                  <Form.Label column sm={3}>Device Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      name="name"
                      type="text"
                      value={deviceData.name}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>
    
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalSupplier">
                  <Form.Label column sm={3}>Device Location</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="deviceLocation"
                      value={deviceLocationOptions.find(option => option.value === deviceData.deviceLocation)}
                      onChange={handleSelectChange}
                      options={deviceLocationOptions}
                      placeholder="Select a Device Location"
                      isSearchable
                    />
                  </Col>
                </Form.Group>
    
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalRemarks">
                  <Form.Label column sm={3}>IP Address</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      name="ipaddress"
                      type="text"
                      value={deviceData.ipaddress}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>
    
                <Form.Group className="mb-3 w-75" as={Row} controlId="formHorizontalRemarks">
                  <Form.Label column sm={3}>Port</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      name="PORT"
                      type="text"
                      value={deviceData.PORT}
                      onChange={handleChange}
                    />
                  </Col>
                </Form.Group>
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

export default Printers;
