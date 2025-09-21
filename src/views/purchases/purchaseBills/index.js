import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Modal, Button } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import './index.scss';
import newRequest from '../../../utils/newRequest';
import { BsFillPrinterFill } from "react-icons/bs";
import { IoMdReturnLeft } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import Select from 'react-select';
import GRNPrintForm from '../GRNPrintForm';
import ReactToPrint from 'react-to-print';

const PurchaseBills = () => {
  const [showPanelCreateGRN, setShowPanelCreateGRN] = useState(false);
  const [showPanelEditGRN, setShowPanelEditGRN] = useState(false);
  const [showReturnConfirmation, setShowReturnConfirmation] = useState(false);
  const [grn, setGrn] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const userRole = storedUser.role;
  const userShopId = storedUser.shopId;
  const panelCreateGRNRef = useRef(null);
  const printRef = useRef();

  // function to format prices
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];
  // const glowButtons = buttonGlowVariants.map((variant, idx) => (
  //   <OverlayTrigger key={idx} placement="top" overlay={<Tooltip className="mb-2">{variant}</Tooltip>}>
  //     <Button className={'text-capitalize my-2 btn' + variant} variant={'light'}>
  //       {variant}
  //     </Button>
  //   </OverlayTrigger>
  // ));

  const handleCreateGRNClick = () => {
    setShowPanelCreateGRN(true);
  };

  const handleClose = () => {
    setShowPanelCreateGRN(false);
    window.location.reload();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelCreateGRNRef.current && !panelCreateGRNRef.current.contains(event.target)) {
        setShowPanelCreateGRN(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelCreateGRNRef]);




  const [shopOptions, setShopOptions] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = storedUser.role;
    const userCompanyId = storedUser.companyId;

    console.log('Role:', userRole);
    console.log('Company ID:', userCompanyId);

    const fetchShops = async () => {
      try {
        const response = await newRequest.get('/shops');
        let shopData = response.data;

        shopData = shopData.filter(shop => shop.companyId === userCompanyId && shop.toggle === 'enable');

        const formattedOptions = shopData.map(shop => ({
          value: shop.shopId,
          label: shop.shopName.trim(),
        }));

        setShopOptions(formattedOptions);

      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);


  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    const companyId = localStorage.getItem('Stored user');
    console.log(companyId);
    const fetchSuppliers = async () => {
      try {
        const response = await newRequest.get('/suppliers');
        const formattedOptions = response.data.map(supplier => ({
          value: supplier.supplierId,
          label: supplier.supplierName.trim(),
        }));
        setSupplierOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const [formData, setFormData] = useState({
    date: '',
    supplier: '',
    remarks: '',
    shopId: ''
  });

  const [rowsData, setRows] = useState([
    {
      rawMaterial: '',
      quantity: 0,
      uom: '',
      unitCost: 0,
      total: 0,
      isEditable: true,
      isSaved: false,
    },
  ]);

  const [products, setProducts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({ ...formData, [name]: selectedOption.value });
  };

  useEffect(() => {
    newRequest.get('/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  const [uomOptions, setUomOptions] = useState([]);

  useEffect(() => {
    newRequest.get('uoms')
      .then(response => {
        setUomOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching UOM data:', error);
      });
  }, []);

  const handleRowChange = (index, eventOrOption, actionMeta) => {
    let name, value;
    if (actionMeta) {
      name = actionMeta.name;
      value = eventOrOption.value;
    } else {
      const { name: inputName, value: inputValue } = eventOrOption.target;
      name = inputName;
      value = name === 'quantity' || name === 'unitCost' ? parseFloat(inputValue) : inputValue;
    }

    const updatedRows = rowsData.map((row, i) => {
      if (i === index) {
        if (name === 'rawMaterial') {
          // Find UOM for the selected raw material
          const selectedProduct = products.find(p => p.productId === value);
          const uomName = selectedProduct ? uomOptions.find(u => u.uomId === selectedProduct.uomId)?.name : 'N/A';
          return { ...row, [name]: value, uom: uomName };
        }
        return { ...row, [name]: value };
      }
      return row;
    });

    setRows(updatedRows);
  };



  const productOptions = products
    .filter(product => ["Raw Material", "WIP", "Finished Good"].includes(product.productType))
    .map(product => ({
      value: product.productId,
      label: product.name,
    }));


  const productMap = products.reduce((map, product) => {
    map[product.productId] = product.name;
    return map;
  }, {});

  const handleAdd = () => {
  };

  const handleSave = (index) => {
    const row = rowsData[index];
    const quantity = parseFloat(row.quantity) || 0;
    const unitCost = parseFloat(row.unitCost) || 0;
    const total = quantity * unitCost;

    if (row.rawMaterial && quantity && unitCost) {
      const updatedRows = rowsData.map((row, i) =>
        i === index ? { ...row, total, isEditable: false, isSaved: true } : row
      );
      updatedRows.push({
        rawMaterial: '',
        quantity: 0,
        uom: '',
        unitCost: 0,
        total: 0,
        isEditable: true,
        isSaved: false,
      });
      setRows(updatedRows);
    } else {
      alert("All row fields are required.");
    }
  };

  const handleDelete = (index) => {
    const updatedRows = rowsData.filter((row, i) => i !== index);
    setRows(updatedRows);
  };

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalUnitCost = 0;
    let totalAmount = 0;

    rowsData.forEach(row => {
      totalQuantity += parseFloat(row.quantity) || 0;
      totalUnitCost += parseFloat(row.unitCost) || 0;
      totalAmount += row.quantity * row.unitCost || 0;
    });

    return { totalQuantity, totalUnitCost, totalAmount };
  };

  const totals = calculateTotals();
  const [grnData, setGrnData] = useState(null);

  const handleSubmit = async () => {
    console.log('formData:', formData);
    console.log('rowsData:', rowsData);

    const formattedDate = new Date(formData.date).toISOString();

    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const createdBy = storedUser.userId;
    const companyId = storedUser.companyId;

    const payload = {
      companyId: companyId,
      shopId: userRole === 'admin' ? userShopId : formData.shopId,
      supplierId: formData.supplier,
      transactionDateTime: formattedDate,
      createdBy: createdBy,
      transactions: rowsData.map(row => {
        const product = products.find(p => p.productId === row.rawMaterial);
        if (product) {
          return {
            categoryId: product.categoryId,
            productId: product.productId,
            //finishedGoodId: "ProductId-6",
            unitCost: row.unitCost,
            quantity: row.quantity,
            remarks: formData.remarks,
          };
        } else {
          console.error('Product not found:', row.rawMaterial);
          return null;
        }
      }).filter(Boolean),
    };

    console.log('Payload:', payload);

    try {
      const response = await newRequest.post('grns/new-grn', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const grnData = response.data;
      console.log('GRN Created:', grnData);
      setGrnData(grnData);
      setShowPanelCreateGRN(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating GRN:', error);
      alert('Failed to create GRN');
    }

  };

  const handleUpdate = async () => {
    try {
      // Prepare data for the update request
      const updatedData = {
        transactionDateTime: formData.date,
        supplierId: formData.supplier,
        transactions: rowsData.map(row => {
          const product = products.find(p => p.productId === row.rawMaterial);
          if (product) {
            return {
              categoryId: product.categoryId,
              productId: row.rawMaterial,
              unitCost: row.unitCost,
              quantity: row.quantity,
              remarks: formData.remarks,
            };
          } else {
            console.error('Product not found:', row.rawMaterial);
            return null;
          }
        }).filter(Boolean),
      };

      // Construct the API endpoint dynamically based on the data
      const endpoint = `/grns/update-grn/${grnData.grnHeader.transactionCode}/${grnData.grnHeader.companyId}/${grnData.grnHeader.shopId}`;
      console.log('Endpoint:', endpoint);
      console.log('Updated Data:', updatedData);

      // Send the update request
      const response = await newRequest.put(endpoint, updatedData);

      // Handle the response (success message or other actions)
      if (response.status === 200) {
        // Successfully updated
        console.log('GRN updated successfully:', response.data);
        setGrnData(grnData);
        setShowPanelEditGRN(false);
        window.location.reload();
        // Optionally, you might want to show a success message or redirect
      } else {
        // Handle response status other than 200
        console.error('Failed to update GRN:', response.data);
      }

    } catch (error) {
      // Handle errors
      console.error('Error updating GRN:', error);
    }
  };



  const [grns, setGrns] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = storedUser.role;
    const userCompanyId = storedUser.companyId;
    const userShopId = storedUser.shopId;

    newRequest.get('/grns')
      .then(response => {
        let filteredGrns = response.data.grns;
        filteredGrns = filteredGrns.slice().reverse();

        if (userRole === 'admin' || userRole === 'stockManager'
        ) {
          filteredGrns = filteredGrns.filter(grn =>
            grn.companyId === userCompanyId && grn.shopId === userShopId
          );
        }

        setGrns(filteredGrns);
      })
      .catch(error => {
        console.error('Error fetching GRNs data:', error);
      });
  }, []);


  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const [shops, setShops] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    newRequest.get('/shops').then(response => setShops(response.data));
    newRequest.get('/suppliers').then(response => setSuppliers(response.data));
    newRequest.get('/companies').then(response => setCompanies(response.data));
    newRequest.get('/users').then(response => setUsers(response.data));
  }, []);

  const getShopName = (shopId) => {
    const shop = shops.find(shop => shop.shopId === shopId);
    return shop ? shop.shopName : 'Unknown Shop';
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(supplier => supplier.supplierId === supplierId);
    return supplier ? supplier.supplierName : 'Unknown Supplier';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(company => company.companyId === companyId);
    return company ? company.companyName : 'Unknown Company';
  };

  const getUserName = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? user.name : 'Unknown User';
  };

  const filteredGRNs = grns.filter(grn =>
    grn.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCompanyName(grn.companyId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getShopName(grn.shopId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSupplierName(grn.supplierId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserName(grn.createdBy).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingGRNs = filteredGRNs.filter(grn => grn.transactionStatus === 'Pending');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGRNs = pendingGRNs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(pendingGRNs.length / itemsPerPage);

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

  const [showPrint, setShowPrint] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);

  const handleItemClick = (grn) => {
    setSelectedGRN(grn);
    setShowPrint(true);
  };

  const handlePrintClose = () => {
    setShowPrint(false);
  }

  const handleSettle = async (grn) => {
    try {
      const response = await newRequest.post(`/grns/settle-grn/${grn.transactionCode}/${grn.companyId}/${grn.shopId}`);
      if (response.status === 200) {
        console.log("GRN settled successfully!");
        window.location.reload();
      } else {
        console.error("Failed to settle GRN:", response);
      }
    } catch (error) {
      console.error("An error occurred while settling GRN:", error);
    }
  };

  const handleReturn = async () => {
    try {
      const response = await newRequest.post(`/grns/cancel-grn/${grn.transactionCode}/${grn.companyId}/${grn.shopId}`);
      if (response.status === 200) {
        setShowReturnConfirmation(false);
        console.log("GRN Return successfully!");
        window.location.reload();
      } else {
        console.error("Failed to Return GRN:", response);
      }
    } catch (error) {
      console.error("An error occurred while Return GRN:", error);
    }
  };

  // Fetch UOM details by ID
  const fetchUOMDetails = async (uomId) => {
    try {
      const response = await newRequest.get(`/uoms/${uomId}`);
      return response.data.name; // Assuming the response has 'name'
    } catch (error) {
      console.error('Error fetching UOM details:', error);
      return null;
    }
  };

  // Fetch product details and UOM ID
  const fetchProductDetails = async (productId) => {
    try {
      const response = await newRequest.get(`/products/${productId}`);
      return response.data.uomId; // Return UOM ID
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  };

  const handleEdit = async (grn) => {
    try {
      const response = await newRequest.get(`grns/grn-details/${grn.companyId}/${grn.shopId}/${grn.transactionCode}/transactions/`);
      setGrnData(response.data);

      // Initialize formData and rows after data is fetched
      setFormData({
        date: new Date(response.data.grnHeader.transactionDateTime).toISOString().split('T')[0], // Format date to 'YYYY-MM-DD'
        shopId: response.data.grnHeader.shopId,
        supplier: response.data.grnHeader.supplierId,
        remarks: response.data.grnTransactions.length > 0 ? response.data.grnTransactions[0].remarks : ''
      });

      // Fetch UOM details for each transaction
      const transactionsWithUOM = await Promise.all(response.data.grnTransactions.map(async (transaction) => {
        const uomId = await fetchProductDetails(transaction.productId);
        const uomName = uomId ? await fetchUOMDetails(uomId) : '';
        return {
          rawMaterial: transaction.productId, // Update with correct value if needed
          quantity: transaction.quantity,
          unitCost: transaction.unitCost,
          uom: uomName || '', // Provide a default empty string if uomName is undefined
          isEditable: true // Assuming rows should be editable during edit
        };
      }));

      setRows(transactionsWithUOM);

      // Show the panel for editing
      setShowPanelEditGRN(true);

    } catch (error) {
      console.error('Error fetching GRN data:', error);
    }
  };

  // Call handleEdit whenever grnData changes
  useEffect(() => {
    if (grnData) {
      handleEdit(grnData);
    }
  }, [grnData]);





  const createAutomatedGRN = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      const createdBy = storedUser.userId;
      const companyId = storedUser.companyId;

      // Prepare the payload for the automated GRN
      const payload = {
        companyId: companyId,
        shopId: "ShopID-1",
        supplierId: "SupplierID-1",
        transactionDateTime: new Date().toISOString(),
        createdBy: createdBy,
        transactions: [
          {
            categoryId: "CategoryID-1",
            productId: "ProductID-211",
            unitCost: 10, // Rate
            quantity: 100000, // Quantity
            remarks: "Automated GRN creation for monthly purchase",
          },
        ],
      };

      console.log('Automated GRN Payload:', payload);

      // Make the API request to create the GRN
      const response = await newRequest.post('grns/new-grn', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Automated GRN Created:', response.data);
      alert('Automated GRN successfully created!');
    } catch (error) {
      console.error('Error creating automated GRN:', error);
      alert('Failed to create automated GRN.');
    }
  };


  useEffect(() => {
    // Function to check if it's the start of the month
    const scheduleGRNCreation = () => {
      const today = new Date();
      const isFirstOfMonth = today.getDate() === 1;

      if (isFirstOfMonth) {
        createAutomatedGRN();
      }
    };

    // Check daily if it's the start of a new month
    const intervalId = setInterval(scheduleGRNCreation, 24 * 60 * 60 * 1000); // Run daily

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


  return (
    <React.Fragment>
      <Row>
        <Card>
          <Card.Header>
            <Card.Title className="mb-3" as="h5">Purchase Details</Card.Title>

            <Row>
              <Col>
                <Button className="btn-create-product shadow-1 mb-4" variant="primary" onClick={handleCreateGRNClick}>
                  Create GRN
                </Button>
                <Button className="btn-create-product shadow-1 mb-4" variant="primary" onClick={createAutomatedGRN}>Create Automated GRN</Button>

              </Col>

              <Col>
                <Form.Control
                  type="text"
                  placeholder="Search GRN by name"
                  className="mb-3"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Shop</th>
                  <th>GRN Code</th>
                  <th>Company</th>
                  <th>Supplier</th>
                  <th>Created by</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentGRNs.map((grn, index) => (
                  <tr key={grn.transactionCode}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{getShopName(grn.shopId)}</td>
                    <td>{grn.transactionCode}</td>
                    <td>{getCompanyName(grn.companyId)}</td>
                    <td>{getSupplierName(grn.supplierId)}</td>
                    <td>{getUserName(grn.createdBy)}</td>
                    <td>{new Date(grn.transactionDateTime).toLocaleDateString()}</td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => handleItemClick(grn)}>
                        <BsFillPrinterFill />
                      </Button>
                      <Button variant="warning" size="sm" onClick={() => handleSettle(grn)}>
                        Settle
                      </Button>
                      <Button variant="dark" size="sm" onClick={() => handleEdit(grn)}>
                        <CiEdit />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => {
                        setGrn(grn);
                        setShowReturnConfirmation(true);
                      }}
                      >
                        <IoMdReturnLeft />
                      </Button>
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

      {(showPanelCreateGRN || showPanelEditGRN) && (
        <div className="panel-create-product-popup position-absolute">
          <Card className='panel-create-product' ref={panelCreateGRNRef}>
            <Card.Header className='popup-header'>
              <Card.Title as="h5">{showPanelEditGRN ? 'Edit Purchase Bill (GRN)' : 'Purchase Bill (GRN)'}</Card.Title>
              <CloseIcon onClick={handleClose} className='close-icon' />
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAdd}>
                <Form.Group className="mb-3 w-50" as={Row} controlId="formHorizontalDate">
                  <Form.Label column sm={3}>Date</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3 w-50" as={Row} controlId="formHorizontalSupplier">
                  <Form.Label column sm={3}>Supplier</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="supplier"
                      value={supplierOptions.find(option => option.value === formData.supplier)}
                      onChange={handleSelectChange}
                      options={supplierOptions}
                      placeholder="Select a supplier"
                      isSearchable
                      required
                    />
                  </Col>
                </Form.Group>


                <Form.Group className="mb-3 w-50" as={Row} controlId="formHorizontalRemarks">
                  <Form.Label column sm={3}>Remarks</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      name="remarks"
                      type="text"
                      value={formData.remarks}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Form.Group>

                <Form.Group className="mb-3 w-50" as={Row} controlId="formHorizontalGRN">
                  <Form.Label column sm={3}>Shop ID</Form.Label>
                  <Col sm={9}>
                    <Select
                      name="shopId"
                      value={userRole === 'admin'
                        ? shopOptions.find(option => option.value === userShopId)
                        : shopOptions.find(option => option.value === formData.shopId)
                      }
                      onChange={handleSelectChange}
                      options={shopOptions}
                      isSearchable
                      isDisabled={userRole === 'admin'}
                    />
                  </Col>
                </Form.Group>
              </Form>

              <Table className="purchase-bill-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Raw Material</th>
                    <th>quantity</th>
                    <th>UOM</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rowsData.map((row, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>
                        {row.isEditable ? (
                          <Select
                            name="rawMaterial"
                            value={productOptions.find(option => option.value === row.rawMaterial)}
                            onChange={(option, actionMeta) => handleRowChange(index, option, actionMeta)}
                            options={productOptions}
                            placeholder="Select Raw Material"
                            isSearchable
                            required
                          />
                        ) : productMap[row.rawMaterial] || 'N/A'}
                      </td>
                      <td>
                        {row.isEditable ? (
                          <Form.Control
                            type="number"
                            name="quantity"
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, e)}
                            required
                          />
                        ) : row.quantity}
                      </td>
                      <td>
                        {row.uom}
                      </td>

                      <td>
                        {row.isEditable ? (
                          <Form.Control
                            type="number"
                            name="unitCost"
                            value={row.unitCost}
                            onChange={(e) => handleRowChange(index, e)}
                            required
                          />
                        ) : formatPrice(row.unitCost)}
                      </td>
                      <td>{formatPrice(row.quantity * row.unitCost)}</td>
                      <td>
                        {row.isEditable ? (
                          <SaveIcon className='cursor-pointer' onClick={() => handleSave(index)} />
                        ) : (
                          <DeleteIcon className='cursor-pointer' onClick={() => handleDelete(index)} />
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="2" style={{ fontWeight: 'bold' }}>Total</td>
                    <td style={{ fontWeight: 'bold' }}>{totals.totalQuantity}</td>
                    <td></td>
                    <td></td>
                    <td style={{ fontWeight: 'bold' }}>{formatPrice(totals.totalAmount)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>

              <Form.Group className="mb-3" as={Row}>
                <Col sm={{ span: 10, offset: 0 }}>
                  <Button onClick={showPanelEditGRN ? handleUpdate : handleSubmit}>
                    {showPanelEditGRN ? 'Update' : 'Submit'}
                  </Button>
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>
        </div>
      )}

      {showReturnConfirmation && (
        <div className="panel-create-product-popup position-absolute">
          <div className="position-absolute bg-white top-50 start-50 translate-middle shadow p-5">
            <p className='h6 text-black mb-5'>Are you sure to return the GRN?</p>

            <div className='d-flex justify-content-center'>
              <button className='btn btn-primary me-4' onClick={() => handleReturn()}>Confirm</button>

              <button className='btn btn-danger' onClick={() => setShowReturnConfirmation(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      <Modal show={showPrint} onHide={handlePrintClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>GRN Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <GRNPrintForm ref={printRef} grn={selectedGRN} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrintClose}>
            Close
          </Button>
          <ReactToPrint
            trigger={() => <Button variant="primary">Print</Button>}
            content={() => printRef.current}
          />
        </Modal.Footer>
      </Modal>
    </React.Fragment >
  );
};

export default PurchaseBills;
