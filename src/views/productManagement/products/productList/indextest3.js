import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Table, Card, Badge, Button, Modal } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import newRequest from '../../../../utils/newRequest';
import './index.scss';

const ProductList = () => {

    const [showPanelCreateProduct, setShowPanelCreateProduct] = useState(false);
    const [showPanelEditProduct, setShowPanelEditProduct] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [filteredActiveShops, setFilteredActiveShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [filteredUoms, setFilteredUoms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [shops, setShops] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [searchProductQuery, setSearchProductQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedUomId, setSelectedUomId] = useState('');
    const [selectedShops, setSelectedShops] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedTypes, setSelectedTypes] = useState('');
    const [addedItems, setAddedItems] = useState([]);
    const [qty, setQty] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredRawProducts, setFilteredRawProducts] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedUom, setSelectedUom] = useState('');
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [productName, setProductName] = useState(null);
    const [deviceLocation, setDeviceLocation] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    const panelCreateProductRef = useRef(null);

    const [product, setProduct] = useState({
        productName: '',
        barcode: '',
        category: '',
        shop: [],
        plu: '',
        emptyBottleDeposit: '',
        minQty: '',
        types: [],
        items: [],
    });

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userRole = currentUser.role;
    const userCompany = currentUser.companyId;
    const userShop = currentUser.shopId;

    // const buttonGlowVariants = ['Export CSV', 'Export SQL', 'Export TXT', 'Export JSON'];

    // const glowButtons = buttonGlowVariants.map((variant, idx) => (
    //   <OverlayTrigger key={idx} placement="top" overlay={<Tooltip className="mb-2">{variant}</Tooltip>}>
    //     <Button className={'text-capitalize my-2 btn' + variant} variant={'light'}>
    //       {variant}
    //     </Button>
    //   </OverlayTrigger>
    // ));  

    const getBadgeVariantAndText = (toggle) => {
        return toggle === 'enable' ? { variant: 'success', text: 'Active' } : { variant: 'danger', text: 'Inactive' };
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await newRequest.get('/products');
                const allProducts = response.data;

                // Filter products if user is a superAdmin
                if (userRole === 'superAdmin') {
                    const filteredForSuperAdmin = allProducts.filter(
                        product => product.companyId === userCompany
                    );
                    setFilteredProducts(filteredForSuperAdmin);
                } else if (userRole === 'admin') {
                    const filteredForAdmin = allProducts.filter(
                        product => product.activeShopIds.includes(userShop)
                    );
                    setFilteredProducts(filteredForAdmin);
                } else if (userRole === 'stockManager') {
                    const filteredForAdmin = allProducts.filter(
                        product => product.activeShopIds.includes(userShop)
                    );
                    setFilteredProducts(filteredForAdmin);
                } else {
                    setFilteredProducts(allProducts);
                }

                setProducts(allProducts); // Store all themes regardless of role
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchRawProducts = async () => {
            try {
                const response = await newRequest.get('/products');
                const rawMaterials = response.data
                    .filter(product =>
                        (['raw material', 'wip'].some(type => product.productType.toLowerCase().includes(type)) && product.toggle === 'enable'))
                    .map(product => ({
                        value: product.productId,
                        label: product.name,
                        uomId: product.uomId,
                    }));
                setFilteredRawProducts(rawMaterials);
                console.log(rawMaterials)
            } catch (error) {
                console.error('Error fetching raw products:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await newRequest.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchShops = async () => {
            try {
                const response = await newRequest.get('/shops');
                setShops(response.data);
                setFilteredActiveShops(response.data.filter(shop => shop.toggle === 'enable'));
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        const fetchCompanies = async () => {
            try {
                const response = await newRequest.get('/companies');
                setCompanies(response.data);
                setFilteredCompanies(response.data.filter(company => company.toggle === 'enable'));
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        const fetchUsers = async () => { // Fetch users data
            try {
                const response = await newRequest.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchUoms = async () => {
            try {
                const response = await newRequest.get('/uoms');
                setUoms(response.data);
                setFilteredUoms(response.data.filter(uom => uom.toggle === 'enable'));
            } catch (error) {
                console.error('Error fetching uoms:', error);
            }
        };

        fetchProducts();
        fetchRawProducts();
        fetchCategories();
        fetchShops();
        fetchCompanies();
        fetchUsers();
        fetchUoms();
    }, [currentUser.id]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    //user stays in the same pagination page, although page is refreshed
    useEffect(() => {
        const savedPage = localStorage.getItem("currentPage");
        setCurrentPage(savedPage ? parseInt(savedPage, 10) : 1);

        // existing fetch functions
    }, [currentUser.userId]);

    useEffect(() => {
        localStorage.setItem("currentPage", currentPage);
    }, [currentPage]);

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

    //Close popups
    const handleClose = () => {
        setShowPanelCreateProduct(false);
        setShowPanelEditProduct(false);
    }

    const handleItemSelect = (selectedOption) => {
        // Check if the selected option is null (i.e., the user cleared the selection)
        if (!selectedOption) {
            // Handle the case where selection is cleared
            setSelectedItem(null); // Reset the selected item state
            console.log("Selection cleared");
            return;
        }

        // Log selected option to verify its structure
        console.log("Selected Option:", selectedOption);

        // Find the selected product from filteredRawProducts
        const selectedProduct = filteredRawProducts.find(product => product.value === selectedOption.value);

        // Log the selected product to check its properties
        console.log("Selected Product:", selectedProduct);

        if (!selectedProduct) {
            console.error("Selected product not found in filteredRawProducts.");
            return;
        }

        // Find the relevant product in the products collection
        const relevantProduct = products.find(product => product.productId === selectedProduct.value);

        // Log the relevant product to check its properties
        console.log("Relevant Product:", relevantProduct);

        if (!relevantProduct) {
            console.error("Relevant product not found in products collection.");
            return;
        }

        // Access uomId from relevantProduct
        const uomId = relevantProduct.uomId;

        // Log uomId to verify it's being accessed correctly
        console.log("UOM ID from relevant product:", uomId);

        // Find the UOM using uomId
        const uom = uoms.find(uom => uom.uomId === uomId);

        // Log the found UOM
        console.log("Found UOM:", uom);

        // Update state with selected item and UOM name
        setSelectedItem({
            ...selectedOption,
            uomName: uom?.name || 'Unknown UOM'
        });
    };

    const handleAddItem = () => {
        if (selectedItem && qty !== '') {
            const newItem = {
                itemName: selectedItem.label,
                qty: Number(qty),
                productId: selectedItem.value,
                uomName: selectedItem.uomName
            };

            setAddedItems([...addedItems, newItem]);

            setQty('');
            setSelectedItem(null);
        }
    };

    const handleEditItem = (index, selectedOption) => {
        const updatedItems = [...addedItems];
        updatedItems[index].productId = selectedOption ? selectedOption.value : '';
        setAddedItems(updatedItems);
    };

    const handleEditQuantity = (index, quantity) => {
        const updatedItems = [...addedItems];
        updatedItems[index].qty = Number(quantity);
        setAddedItems(updatedItems);
    };


    const handleRemoveItem = (index) => {
        setAddedItems(addedItems.filter((_, i) => i !== index));
    };

    const handleProductSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchProductQuery(query);
        setFilteredProducts(
            products.filter(product => product.name.toLowerCase().includes(query) && product.activeShopIds.includes(userShop))
        );
    };

    const handleCategorySelect = (selectedOption) => {
        setSelectedCategoryId(selectedOption.value);
        setSelectedCategory(selectedOption);
    };

    const handleCompanySelect = (selectedOption) => {
        setSelectedCompanyId(selectedOption ? selectedOption.value : null);
        setSelectedCompany(selectedOption);

        // Filter shops based on the selected company
        if (selectedOption) {
            const filteredShops = filteredActiveShops.filter(shop => shop.companyId === selectedOption.value);
            setFilteredShops(filteredShops);
        } else {
            setFilteredShops([]); // Clear shops when no company is selected
        }

        // Filter categories based on the selected company's ID
        const filteredCategories = categories.filter(
            (category) => category.companyId === selectedOption.value
        );
        setFilteredCategories(filteredCategories);
    };

    const handleShopSelect = (selectedOption) => {
        if (selectedOption) {
            const newSelectedShops = selectedOption.map(option => ({
                value: option.value,
                label: option.label
            }));
            setSelectedShops(newSelectedShops);
        } else {
            setSelectedShops([]); // Ensure to handle case where no option is selected
        }
    };

    const handleUomSelect = (selectedOption) => {
        setSelectedUomId(selectedOption.value);
        setSelectedUom(selectedOption);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleProductNameChange = (selectedOption) => {
        if (selectedOption) {
            // Extract the product name from the label by removing the size part
            const nameWithoutSize = selectedOption.label.split(' - ')[0];
            setProductName(nameWithoutSize); // Set the productName to the extracted name
        } else {
            setProductName(''); // Clear the productName if no option is selected
        }
    };

    // Update selected types based on checkbox changes
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;

        setSelectedTypes((prevSelectedTypes) => {
            const updatedTypes = checked
                ? [...prevSelectedTypes, value]
                : prevSelectedTypes.filter((type) => type !== value);

            // Reset form values when checkboxes are changed
            if (!updatedTypes.includes('WIP') && !updatedTypes.includes('Finished Good') && updatedTypes.includes('Raw Material')) {
                setProduct(prevProduct => ({
                    ...prevProduct,
                    size: '',
                    deviceLocation: ''
                }));
                setDeviceLocation('');
                setQty('');
                setSelectedItem(null);
            } else if ((updatedTypes.includes('WIP') || updatedTypes.includes('Finished Good')) && !updatedTypes.includes('Raw Material')) {
                setProduct(prevProduct => ({
                    ...prevProduct,
                    size: '',
                    deviceLocation: ''
                }));
                setDeviceLocation('');
                setQty('');
                setSelectedItem(null);
            } else if (updatedTypes.includes('WIP') || updatedTypes.includes('Finished Good')) {
                // Optionally handle other cases if needed
                setProduct(prevProduct => ({
                    ...prevProduct,
                    size: '',
                    deviceLocation: ''
                }));
                setDeviceLocation('');
                setQty('');
                setSelectedItem(null);
            }

            return updatedTypes;
        });
    };

    // Convert selected types array to a string before submission
    const formatProductType = (types) => {
        if (!Array.isArray(types)) {
            console.error('Expected an array for types but got', typeof types);
            return ''; // Return an empty string if types is not an array
        }
        return types.join(','); // Join array elements with a comma
    };

    const togglePanelCreateProduct = () => {
        setShowPanelCreateProduct(!showPanelCreateProduct);

        if (!showPanelCreateProduct) {
            setProduct({
                productName: '',
                pluCode: '',
                // barcode: '',
                shopId: [],
                types: '',
                emptyBottleDeposit: '',
                minQty: '',
            });

            setProductName('');
            setSelectedCategoryId('');
            setSelectedCategory('');
            setSelectedCompanyId('');
            setSelectedShops([]);
            setSelectedUomId('');
            setSelectedUom('');
            setSelectedTypes('');
        }

        if (userRole === 'admin' || userRole === 'stockManager') {
            const selectedCompany = companies.find(company => company.companyId === currentUser.companyId);
            setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null);
            setSelectedCompanyId(currentUser.companyId);

            // Filter selling types based on the selected shop's ID
            const filteredCategories = categories.filter(
                category => category.companyId === currentUser.companyId
            );
            setFilteredCategories(filteredCategories);

            const filteredShops = filteredActiveShops.filter(shop => shop.companyId === currentUser.companyId);
            setFilteredShops(filteredShops);
        }
    };

    const togglePanelEditProduct = async (product) => {
        try {
            // Fetch product details with BOM
            const response = await newRequest.get(`/products/${product.productId}`);
            const productWithBom = response.data; // Access data directly from Axios response

            // Set the product and BOM details
            setSelectedProduct(productWithBom);

            // Extract and set BOM items
            const bomItems = productWithBom.bomDetails ? productWithBom.bomDetails.items : [];
            const formattedBOMItems = bomItems.map(item => ({
                productId: item.productId,
                qty: item.qty,
            }));

            // Log each item's uomName
            formattedBOMItems.forEach(item => {
                console.log("UOM Name for item:", item.uomId);
            });

            setAddedItems(formattedBOMItems);

            // Continue setting other states
            const company = companies.find(comp => comp.companyId === product.companyId);
            const selectedCompanyOption = company ? { value: company.companyId, label: company.companyName } : null;

            const category = categories.find(cat => cat.categoryId === product.categoryId);
            const selectedCategoryOption = category ? { value: category.categoryId, label: category.categoryName } : null;

            const uom = uoms.find(uom => uom.uomId === product.uomId);
            const selectedUomOption = uom ? { value: uom.uomId, label: uom.name } : null;

            const activeShopOptions = product.activeShopIds.map(shopId => {
                const shop = shops.find(shop => shop.shopId === shopId);
                return shop ? { value: shop.shopId, label: shop.shopName } : null;
            }).filter(option => option !== null);

            const selectedTypes = product.productType.split(',').map(type => type.trim());

            setSelectedCompany(selectedCompanyOption);
            setSelectedCompanyId(product.companyId); // Update company ID
            setSelectedCategory(selectedCategoryOption);
            setSelectedCategoryId(product.categoryId); // Update category ID
            setSelectedUom(selectedUomOption);
            setSelectedUomId(product.uomId); // Update UOM ID
            setSelectedShops(activeShopOptions);
            setSelectedTypes(selectedTypes);

            console.log(selectedCompanyId);

            const filteredShops = filteredActiveShops.filter(shop => shop.companyId === product.companyId);
            setFilteredShops(filteredShops);

            const filteredCategories = categories.filter(category => category.companyId === product.companyId);
            setFilteredCategories(filteredCategories);

            setProduct({
                pluCode: product.pluCode,
                name: product.name,
                productType: selectedTypes,
                size: product.size,
                toggle: product.toggle,
                minQty: product.minQty,
                deviceLocation: product.deviceLocation,
            });
            setDeviceLocation(product.deviceLocation || '');
            setShowPanelEditProduct(true);
        } catch (error) {
            console.error('Error loading product details:', error);
        }
    };

    const handleCreateProductSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!productName || !selectedCategoryId || !selectedCompanyId || !selectedUomId || !selectedTypes || !currentUser.userId) {
                console.log('Required fields are missing.', productName, selectedCategoryId, selectedCompanyId, selectedUomId, selectedTypes, currentUser.userId);
                return;
            }

            await newRequest.post("/products/new-product", {
                ...product,
                deviceLocation: deviceLocation,
                productName: productName,
                uomId: selectedUomId,
                categoryId: selectedCategoryId,
                companyId: selectedCompanyId,
                activeShopIds: selectedShops.map(shop => shop.value),
                productType: formatProductType(selectedTypes), // Convert to string
                items: addedItems,
                userId: currentUser.userId,
            });

            // Handle successful product creation
            console.log("Product created successfully!");
            window.location.reload(); // Reload the browser

            // Clear form inputs and state
            setProduct({
                productName: '',
                pluCode: '',
                categoryId: '',
                uomId: '',
                shopId: [],
                types: '',
                emptyBottleDeposit: '',
                minQty: '',
                companyId: '',
                items: [],
                size: '',
            });
            setSelectedCategoryId('');
            setSelectedUomId('');
            setSelectedCompanyId('');
            setSelectedShops([]);
            setAddedItems([]);
            setQty('');
            setShowPanelCreateProduct(false);
        } catch (err) {
            console.error('Error creating product:', err);

            // Handle PLU code error
            if (err.response && err.response.status === 400 && err.response.data.message === 'PLU Code already exists') {
                setErrorMessage('PLU Code already exists');
                setShowErrorModal(true);
            } else if (err.response && err.response.status === 400 && err.response.data.message === 'Product Name, Size combination already exists') {
                setErrorMessage('Product Name, Size combination already exists');
                setShowErrorModal(true);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
                setShowErrorModal(true);
            }
        }
    };

    // const handleCreateProductSubmit = async (e) => {
    //   e.preventDefault();

    //   try {
    //     if (!productName || !selectedCategoryId || !selectedCompanyId || !selectedUomId || !currentUser.userId) {
    //       console.log('Required fields are missing.', productName, selectedCategoryId, selectedCompanyId, selectedUomId, selectedTypes, currentUser.userId);
    //       return;
    //     }

    //     // Automatically set default raw material for finished goods
    //     const defaultRawMaterial = {
    //       productId: 'ProductID-211', // grn ID
    //       qty: 1, // Default quantity (adjust as needed)
    //       uomName: 'UOMId-8', // grn's UOM ID
    //     };
    //     const finalItems = [...addedItems, defaultRawMaterial];


    //     const productType = selectedTypes.length === 0 ? ['Finished Good'] : selectedTypes;

    //     await newRequest.post("/products/new-product", {
    //       ...product,
    //       deviceLocation: deviceLocation,
    //       productName: productName,
    //       uomId: selectedUomId,
    //       categoryId: selectedCategoryId,
    //       companyId: selectedCompanyId,
    //       activeShopIds: selectedShops.map(shop => shop.value),
    //       productType: formatProductType(productType), // Convert to string
    //       items: finalItems, // Include default raw material if applicable
    //       userId: currentUser.userId,
    //     });

    //     // Handle successful product creation
    //     console.log("Product created successfully!");
    //     window.location.reload();

    //     // Clear form inputs and state
    //     setProduct({
    //       productName: '',
    //       pluCode: '',
    //       categoryId: '',
    //       uomId: '',
    //       shopId: [],
    //       types: '',
    //       emptyBottleDeposit: '',
    //       minQty: '',
    //       companyId: '',
    //       items: [],
    //       size: '',
    //     });
    //     setSelectedCategoryId('');
    //     setSelectedUomId('');
    //     setSelectedCompanyId('');
    //     setSelectedShops([]);
    //     setAddedItems([]);
    //     setQty('');
    //     setShowPanelCreateProduct(false);
    //   } catch (err) {
    //     console.error('Error creating product:', err);

    //     if (err.response && err.response.status === 400) {
    //       setErrorMessage(err.response.data.message || 'An unexpected error occurred.');
    //     } else {
    //       setErrorMessage('An unexpected error occurred. Please try again.');
    //     }
    //     setShowErrorModal(true);
    //   }
    // };

    //update product details
    const handleEditProductSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(deviceLocation);

            const response = await newRequest.put(`/products/update-product/${selectedProduct.productId}`, {
                ...product,
                deviceLocation: deviceLocation,
                productName: productName,
                uomId: selectedUomId,
                categoryId: selectedCategoryId,
                companyId: selectedCompanyId,
                activeShopIds: selectedShops.map(shop => shop.value),
                productType: formatProductType(selectedTypes), // Convert to string
                items: addedItems,
                userId: currentUser.userId,
            });
            setProducts(prevProducts =>
                prevProducts.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setFilteredProducts(prevFilteredProducts =>
                prevFilteredProducts.map(comp =>
                    comp._id === response.data._id ? response.data : comp
                )
            );
            setShowPanelEditProduct(false);
            console.log("Product updated successfully!");
            window.location.reload(); // Reload the browser
        } catch (err) {
            console.log(err);

            // Handle PLU code error
            if (err.response && err.response.status === 400 && err.response.data.message === 'PLU Code already exists') {
                setErrorMessage('PLU Code already exists');
                setShowErrorModal(true);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
                setShowErrorModal(true);
            }
        }
    };

    const getCreatedByUserName = (userId) => {
        const user = users.find(user => user.userId === userId);
        return user ? user.name : '-'; // Return user name if found, otherwise '-'
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(category => category.categoryId === categoryId);
        return category ? category.categoryName : '-'; // Return user name if found, otherwise '-'
    };

    const getUomName = (uomId) => {
        const uom = uoms.find(uom => uom.uomId === uomId);
        return uom ? uom.name : ''; // Return user name if found, otherwise '-'
    };

    const getCompanyName = (companyId) => {
        const company = companies.find(company => company.companyId === companyId);
        return company ? company.companyName : '-'; // Return user name if found, otherwise '-'
    };

    return (
        <React.Fragment>
            <Row>
                <Card>
                    <Card.Header>
                        <Card.Title className="mb-3" as="h5">Products</Card.Title>
                        <Row>
                            <Col>
                                <Button onClick={togglePanelCreateProduct} className="btn-create-product shadow-1 mb-4" variant="primary">
                                    Create Product
                                </Button>
                            </Col>
                            <Col>
                                <Form.Control type="text" placeholder="Search Products by name" className="mb-3" onChange={handleProductSearch} value={searchProductQuery} />
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive size="sm">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Product</th>
                                    <th>Size</th>
                                    <th>PLU</th>
                                    <th>Category</th>
                                    <th>Types</th>
                                    {/* <th>Empty Bottle Deposit</th> */}
                                    <th>Min Qty</th>
                                    <th>Company</th>
                                    <th>Created Date</th>
                                    <th>Created By</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product, index) => {
                                    const { variant, text } = getBadgeVariantAndText(product.toggle);
                                    return (
                                        <tr key={product.productId}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td>{product.name}</td>
                                            <td>{product.size}</td>
                                            <td>{product.pluCode}</td>
                                            <td>{getCategoryName(product.categoryId)}</td>
                                            <td>{product.productType}</td>
                                            <td>{product.minQty} {getUomName(product.uomId)}</td>
                                            <td>{getCompanyName(product.companyId)}</td>
                                            <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                            <td>{getCreatedByUserName(product.createdBy)}</td>
                                            <td>
                                                <Badge bg={variant} className={`badge ${variant === 'light' ? 'mx-2 text-dark' : 'mx-2'}`}>
                                                    {text}
                                                </Badge>
                                                <EditIcon className='edit-icon' onClick={() => togglePanelEditProduct(product)} />
                                            </td>
                                        </tr>
                                    )
                                })}
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

            {showPanelCreateProduct && (
                <div className="panel-create-product-popup">
                    <Card className='panel-create-product' ref={panelCreateProductRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Create Product</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon' />
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateProductSubmit}>
                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Product Name
                                    </Form.Label>
                                    <Col sm={9}>
                                        <CreatableSelect
                                            isClearable
                                            onChange={handleProductNameChange}
                                            options={filteredProducts.map(product => ({
                                                value: product.productId,
                                                label: product.size ? `${product.name} - ${product.size}` : product.name
                                            }))}
                                            placeholder="Select or create a product"
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.value}
                                            value={productName
                                                ? { label: products.find(product => product.productId === productName)?.name || productName, value: productName }
                                                : null}
                                        />
                                    </Col>
                                </Form.Group>

                                {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                  <Col lg={3} md={3} sm={3} col={3}>
                    <Form.Label>Barcode</Form.Label>
                  </Col>
                  <Col lg={9} md={9} sm={9} col={9}>
                    <Form.Control name="barcode" type="text" rows="3" onChange={handleChange} required />
                  </Col>
                </Form.Group> */}
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>PLU (Price Look Up Code)</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Form.Control name="pluCode" type="text" rows="3" onChange={handleChange} required />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>Company</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                                            onChange={handleCompanySelect}
                                            value={selectedCompany}
                                            placeholder="Select company"
                                            isDisabled={userRole === 'admin' || userRole === 'stockManager'}
                                            isClearable
                                            required
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label >Category</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredCategories.map(category => ({
                                                value: category.categoryId,
                                                label: category.categoryName,
                                            }))}
                                            onChange={handleCategorySelect}
                                            value={selectedCategory}
                                            placeholder="Select category"
                                            isClearable
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                {/* <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Empty Bottle Deposit
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control name="emptyBottleDeposit" type="text" onChange={handleChange} required />
                  </Col>
                </Form.Group> */}

                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Minimum Quantity
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control name="minQty" type="number" onChange={handleChange} required />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>Active Shops</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredShops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                                            onChange={handleShopSelect}
                                            value={selectedShops}
                                            placeholder="Select shops"
                                            isMulti
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label >Unit of Material</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredUoms.map(uom => ({ value: uom.uomId, label: uom.name }))}
                                            onChange={handleUomSelect}
                                            value={selectedUom}
                                            placeholder="Select UoM"
                                            isClearable
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <div className='type-wrapper mb-4'>
                                    <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                        <Col lg={3} md={3} sm={3} col={3}>
                                            <Form.Label>Type</Form.Label>
                                        </Col>
                                        <Col lg={9} md={9} sm={9} col={9}>
                                            <div className='checkbox-wrapper'>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Raw Material"
                                                    value="Raw Material"
                                                    checked={selectedTypes.includes('Raw Material')}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="wip-checkbox"
                                                    name="type"
                                                    value="WIP"
                                                    label="WIP"
                                                    checked={selectedTypes.includes('WIP')}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="finished-good-checkbox"
                                                    name="type"
                                                    value="Finished Good"
                                                    label="Finished Good"
                                                    checked={selectedTypes.includes('Finished Good')}
                                                    onChange={handleCheckboxChange}
                                                />
                                            </div>

                                            {/* Render BOM based on the conditions */}
                                            {!selectedTypes.includes('WIP') && !selectedTypes.includes('Finished Good') && selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalNoBOM">
                                                    <h6>No BOM (Bill of Materiel)</h6>
                                                </Form.Group>
                                            )}

                                            {(selectedTypes.includes('WIP') || selectedTypes.includes('Finished Good')) && !selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalBOMManual">
                                                    <h6>BOM (Bill of Materiel) Manual</h6>

                                                    <div className="size-select-wrapper mb-4">
                                                        <Form.Control
                                                            as="select"
                                                            value={product.size || ''}
                                                            onChange={(e) => setProduct(prevProduct => ({ ...prevProduct, size: e.target.value }))}
                                                        >
                                                            <option value="">Select Size</option>
                                                            {/* Add your size options here */}
                                                            <option value="Small">Small</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Regular">Regular</option>
                                                            <option value="Large">Large</option>
                                                        </Form.Control>
                                                    </div>

                                                    <div className="size-select-wrapper mb-4">
                                                        <Form.Control
                                                            as="select"
                                                            value={product.deviceLocation || ''}
                                                            onChange={(e) => {
                                                                const selectedValue = e.target.value; // Get the selected value
                                                                setProduct(prevProduct => ({ ...prevProduct, deviceLocation: selectedValue }));
                                                                setDeviceLocation(selectedValue); // Send only the value
                                                            }}
                                                        >
                                                            <option value="">Select Kitchen Location</option>
                                                            {/* Add your kitchen location options here */}
                                                            <option value="Hot Kitchen">Hot Kitchen</option>
                                                            <option value="Cold Kitchen">Cold Kitchen</option>
                                                            <option value="Restaurant">Restaurant</option>

                                                        </Form.Control>
                                                    </div>

                                                    <Col>
                                                        <Row className='add-items-area'>
                                                            {addedItems.length > 0 && (
                                                                <div className="mb-3">
                                                                    <h5>Added Items:</h5>
                                                                    {addedItems.map((item, index) => (
                                                                        <Row key={index} className="added-item-row mb-2">
                                                                            <Col lg={6} md={6} sm={6} xs={6}>
                                                                                <Select
                                                                                    options={filteredRawProducts.map(product => ({
                                                                                        value: product.value,
                                                                                        label: product.label,
                                                                                    }))}
                                                                                    value={filteredRawProducts.find(product => product.value === item.productId)}
                                                                                    onChange={(selectedOption) => handleEditItem(index, selectedOption)}
                                                                                    placeholder="Select an item"
                                                                                    isClearable
                                                                                />
                                                                            </Col>
                                                                            <Col lg={3} md={3} sm={3} xs={3}>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    value={item.qty}
                                                                                    onChange={(e) => handleEditQuantity(index, e.target.value)}
                                                                                    placeholder="Quantity"
                                                                                />
                                                                            </Col>
                                                                            <Col lg={2} md={2} sm={2} xs={2}>

                                                                                <div>{item.uomName}</div>
                                                                            </Col>
                                                                            <Col lg={1} md={1} sm={1} xs={1} className="remove-item-col" onClick={() => handleRemoveItem(index)}>
                                                                                x
                                                                            </Col>
                                                                        </Row>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div>
                                                                <Row className='add-item-row mb-4'>
                                                                    <Col lg={6} md={6} sm={6} col={6} className="add-item">
                                                                        <Select
                                                                            options={filteredRawProducts.map(product => ({
                                                                                value: product.value,
                                                                                label: product.label,
                                                                            }))}
                                                                            onChange={handleItemSelect}
                                                                            placeholder="Select an item"
                                                                            isClearable
                                                                            value={selectedItem ? { value: selectedItem.value, label: selectedItem.label } : null}
                                                                        />
                                                                    </Col>
                                                                    <Col lg={3} md={3} sm={3} col={3}>
                                                                        <Form.Control
                                                                            name="qty"
                                                                            type="number"
                                                                            placeholder="Quantity"
                                                                            value={qty}
                                                                            onChange={(e) => setQty(e.target.value)}
                                                                        />
                                                                    </Col>
                                                                    <Col lg={2} md={2} sm={2} xs={2}>

                                                                        <div>{selectedItem?.uomName}</div>
                                                                    </Col>
                                                                    <Col lg={1} md={1} sm={1} xs={1}></Col>
                                                                </Row>
                                                                <Col className="mb-3">
                                                                    <Button variant="primary" onClick={handleAddItem}>Add Item</Button>
                                                                </Col>
                                                            </div>

                                                            {/* <div>
                                <h6>Default Raw Material: grn</h6>
                                <p>Raw material is automatically added.</p>
                              </div> */}

                                                        </Row>
                                                    </Col>

                                                </Form.Group>
                                            )}

                                            {(selectedTypes.includes('WIP') || selectedTypes.includes('Finished Good')) && selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalBOMAuto">
                                                    <h6>BOM (Bill of Materiel) Auto</h6>
                                                </Form.Group>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <Form.Group className="mb-3" as={Row}>
                                    <Col sm={{ span: 10, offset: 0 }}>
                                        <Button type='submit'>Save</Button>
                                        {/* <Button>New</Button> */}
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            )
            }

            {showPanelEditProduct && (
                <div className="panel-edit-product-popup">
                    <Card className='panel-edit-product' ref={panelCreateProductRef}>
                        <Card.Header className='popup-header'>
                            <Card.Title as="h5">Edit Product</Card.Title>
                            <CloseIcon onClick={handleClose} className='close-icon' />
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleEditProductSubmit}>
                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Product Name
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control name="name" type="text" value={product.name} onChange={handleChange} required />
                                    </Col>
                                </Form.Group>

                                {/* <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                  <Col lg={3} md={3} sm={3} col={3}>
                    <Form.Label>Barcode</Form.Label>
                  </Col>
                  <Col lg={9} md={9} sm={9} col={9}>
                    <Form.Control name="barcode" type="text" rows="3" onChange={handleChange} required />
                  </Col>
                </Form.Group> */}
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>PLU (Price Look Up Code)</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Form.Control name="pluCode" type="text" rows="3" value={product.pluCode} onChange={handleChange} required />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>Company</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredCompanies.map(company => ({ value: company.companyId, label: company.companyName }))}
                                            onChange={handleCompanySelect}
                                            value={selectedCompany}  // Ensure this is correctly set
                                            placeholder="Select company"
                                            isClearable
                                            required
                                            isDisabled={true}
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label >Category</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredCategories.map(category => ({
                                                value: category.categoryId,
                                                label: category.categoryName,
                                            }))}
                                            onChange={handleCategorySelect}
                                            value={selectedCategory}
                                            placeholder="Select category"
                                            isClearable
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                {/* <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                  <Form.Label column sm={3}>
                    Empty Bottle Deposit
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control name="emptyBottleDeposit" type="text" onChange={handleChange} required />
                  </Col>
                </Form.Group> */}

                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalEmail">
                                    <Form.Label column sm={3}>
                                        Minimum Quantity
                                    </Form.Label>
                                    <Col sm={9}>
                                        <Form.Control name="minQty" type="number" value={product.minQty} onChange={handleChange} required />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" as={Row}>
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label>Active Shops</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredShops.map(shop => ({ value: shop.shopId, label: shop.shopName }))}
                                            onChange={handleShopSelect}
                                            value={selectedShops}
                                            placeholder="Select shops"
                                            isMulti
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                    <Col lg={3} md={3} sm={3} col={3}>
                                        <Form.Label >UoM</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9} col={9}>
                                        <Select
                                            options={filteredUoms.map(uom => ({ value: uom.uomId, label: uom.name }))}
                                            onChange={handleUomSelect}
                                            value={selectedUom}
                                            placeholder="Select uom"
                                            isClearable
                                            required
                                        />
                                    </Col>
                                </Form.Group>

                                <div className='type-wrapper mb-4'>
                                    <Form.Group className="mb-3" as={Row} controlId="formGridState">
                                        <Col lg={3} md={3} sm={3} col={3}>
                                            <Form.Label>Type</Form.Label>
                                        </Col>
                                        <Col lg={9} md={9} sm={9} col={9}>
                                            <div className='checkbox-wrapper'>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Raw Material"
                                                    value="Raw Material"
                                                    checked={selectedTypes.includes('Raw Material')}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="wip-checkbox"
                                                    name="type"
                                                    value="WIP"
                                                    label="WIP"
                                                    checked={selectedTypes.includes('WIP')}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="finished-good-checkbox"
                                                    name="type"
                                                    value="Finished Good"
                                                    label="Finished Good"
                                                    checked={selectedTypes.includes('Finished Good')}
                                                    onChange={handleCheckboxChange}
                                                />
                                            </div>

                                            {/* Render BOM based on the conditions */}
                                            {!selectedTypes.includes('WIP') && !selectedTypes.includes('Finished Good') && selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalNoBOM">
                                                    <h6>No BOM (Bill of Materiel)</h6>
                                                </Form.Group>
                                            )}

                                            {(selectedTypes.includes('WIP') || selectedTypes.includes('Finished Good')) && !selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalBOMManual">
                                                    <h6>BOM (Bill of Materiel) Manual</h6>

                                                    <div className="size-select-wrapper mb-4">
                                                        <Form.Control
                                                            as="select"
                                                            value={product.size || ''}
                                                            onChange={(e) => setProduct(prevProduct => ({ ...prevProduct, size: e.target.value }))}
                                                        >
                                                            <option value="">Select Size</option>
                                                            {/* Add your size options here */}
                                                            <option value="Small">Small</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Regular">Regular</option>
                                                            <option value="Large">Large</option>
                                                        </Form.Control>
                                                    </div>

                                                    <div className="size-select-wrapper mb-4">
                                                        <Form.Control
                                                            as="select"
                                                            value={product.deviceLocation || ''}
                                                            onChange={(e) => {
                                                                const selectedValue = e.target.value; // Get the selected value
                                                                setProduct(prevProduct => ({ ...prevProduct, deviceLocation: selectedValue }));
                                                                setDeviceLocation(selectedValue); // Send only the value
                                                            }}
                                                        >
                                                            <option value="">Select Kitchen Location</option>
                                                            {/* Add your kitchen location options here */}
                                                            <option value="Hot Kitchen">Hot Kitchen</option>
                                                            <option value="Cold Kitchen">Cold Kitchen</option>
                                                            <option value="Restaurant">Restaurant</option>
                                                        </Form.Control>
                                                    </div>

                                                    <Col>
                                                        <Row className='add-items-area'>
                                                            {addedItems.length > 0 && (
                                                                <div className="mb-3">
                                                                    <h5>Added Items:</h5>
                                                                    {addedItems.map((item, index) => (
                                                                        <Row key={index} className="added-item-row mb-2">
                                                                            <Col lg={6} md={6} sm={6} xs={6}>
                                                                                <Select
                                                                                    options={filteredRawProducts.map(product => ({
                                                                                        value: product.value,
                                                                                        label: product.label,
                                                                                    }))}
                                                                                    value={filteredRawProducts.find(product => product.value === item.productId)}
                                                                                    onChange={(selectedOption) => handleEditItem(index, selectedOption)}
                                                                                    placeholder="Select an item"
                                                                                    isClearable
                                                                                />
                                                                            </Col>
                                                                            <Col lg={3} md={3} sm={3} xs={3}>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    value={item.qty}
                                                                                    onChange={(e) => handleEditQuantity(index, e.target.value)}
                                                                                    placeholder="Quantity"
                                                                                />
                                                                            </Col>
                                                                            <Col lg={2} md={2} sm={2} xs={2}>
                                                                                <div>
                                                                                    {(() => {
                                                                                        const product = filteredRawProducts.find(product => product.value === item.productId);
                                                                                        const uom = filteredUoms.find(uom => uom.uomId === product.uomId);
                                                                                        return uom ? uom.name : '-'; // Return UOM name if found, otherwise '-'
                                                                                    })()}
                                                                                </div>
                                                                            </Col>
                                                                            <Col lg={1} md={1} sm={1} xs={1} className="remove-item-col" onClick={() => handleRemoveItem(index)}>
                                                                                x
                                                                            </Col>
                                                                        </Row>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Add item form */}
                                                            <div>
                                                                <Row className='add-item-row mb-4'>
                                                                    <Col lg={6} md={6} sm={6} col={6} className="add-item">
                                                                        <Select
                                                                            options={filteredRawProducts.map(product => ({
                                                                                value: product.value,
                                                                                label: product.label,
                                                                            }))}
                                                                            onChange={handleItemSelect}
                                                                            placeholder="Select an item"
                                                                            isClearable
                                                                            value={selectedItem ? { value: selectedItem.value, label: selectedItem.label } : null}
                                                                        />
                                                                    </Col>
                                                                    <Col lg={3} md={3} sm={3} col={3}>
                                                                        <Form.Control
                                                                            name="qty"
                                                                            type="number"
                                                                            placeholder="Quantity"
                                                                            value={qty}
                                                                            onChange={(e) => setQty(e.target.value)}
                                                                        />
                                                                    </Col>
                                                                    <Col lg={2} md={2} sm={2} xs={2}>
                                                                        <div>{selectedItem?.uomName}</div>
                                                                    </Col>
                                                                    <Col lg={1} md={1} sm={1} xs={1}></Col>
                                                                </Row>
                                                                <Col className="mb-3">
                                                                    <Button variant="primary" onClick={handleAddItem}>Add Item</Button>
                                                                </Col>
                                                            </div>
                                                        </Row>
                                                    </Col>
                                                </Form.Group>
                                            )}

                                            {(selectedTypes.includes('WIP') || selectedTypes.includes('Finished Good')) && selectedTypes.includes('Raw Material') && (
                                                <Form.Group className="mb-3" as={Row} controlId="formHorizontalBOMAuto">
                                                    <h6>BOM (Bill of Materiel) Auto</h6>
                                                </Form.Group>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <Form.Group className="mb-3 status" as={Row}>
                                    <Col sm={9} name="toggle">
                                        <Form.Check
                                            label="Active/Inactive"
                                            name="toggle"
                                            checked={product.toggle === 'enable'} // Adjust checked state based on toggle value
                                            onChange={(e) => setProduct((prev) => ({
                                                ...prev,
                                                toggle: e.target.checked ? 'enable' : 'disable'
                                            }))}
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3" as={Row}>
                                    <Col sm={{ span: 10, offset: 0 }}>
                                        <Button type='submit'>Save</Button>
                                        {/* <Button>New</Button> */}
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            )
            }

            {/*PLU code alrady exists error popup*/}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </React.Fragment >
    );
};

export default ProductList;