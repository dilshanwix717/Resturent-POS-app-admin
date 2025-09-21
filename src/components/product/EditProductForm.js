import { useState, useRef, useEffect } from "react"
import { Row, Col, Form, Card, Button } from "react-bootstrap"
import CloseIcon from "@mui/icons-material/Close"
import Select from "react-select"
import newRequest from "../../utils/newRequest"
import BomSection from "./BomSection"

const EditProductForm = ({
    handleClose,
    selectedProduct,
    categories,
    companies,
    shops,
    uoms,
    filteredCompanies,
    filteredActiveShops,
    filteredRawProducts,
    products,
    currentUser,
    setShowErrorModal,
    setErrorMessage,
}) => {
    // State for form data
    const [product, setProduct] = useState({
        name: selectedProduct.name,
        pluCode: selectedProduct.pluCode,
        minQty: selectedProduct.minQty,
        size: selectedProduct.size || "",
        deviceLocation: selectedProduct.deviceLocation || "",
        toggle: selectedProduct.toggle,
    })

    // State for selections
    const [selectedCategoryId, setSelectedCategoryId] = useState(selectedProduct.categoryId)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedCompanyId, setSelectedCompanyId] = useState(selectedProduct.companyId)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [selectedUomId, setSelectedUomId] = useState(selectedProduct.uomId)
    const [selectedUom, setSelectedUom] = useState(null)
    const [selectedShops, setSelectedShops] = useState([])
    const [selectedTypes, setSelectedTypes] = useState(selectedProduct.productType.split(",").map((type) => type.trim()))
    const [deviceLocation, setDeviceLocation] = useState(selectedProduct.deviceLocation || "")

    // State for BOM
    const [addedItems, setAddedItems] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)
    const [qty, setQty] = useState("")

    // State for filtered data
    const [filteredShops, setFilteredShops] = useState([])
    const [filteredCategories, setFilteredCategories] = useState([])

    // State for GRN and raw materials
    const [requiresGRN, setRequiresGRN] = useState(selectedProduct.requiresGRN || false)

    const panelEditProductRef = useRef(null)

    // Initialize form data
    useEffect(() => {
        // Set company
        const company = companies.find((comp) => comp.companyId === selectedProduct.companyId)
        const selectedCompanyOption = company ? { value: company.companyId, label: company.companyName } : null
        setSelectedCompany(selectedCompanyOption)

        // Set category
        const category = categories.find((cat) => cat.categoryId === selectedProduct.categoryId)
        const selectedCategoryOption = category ? { value: category.categoryId, label: category.categoryName } : null
        setSelectedCategory(selectedCategoryOption)

        // Set UOM
        const uom = uoms.find((uom) => uom.uomId === selectedProduct.uomId)
        const selectedUomOption = uom ? { value: uom.uomId, label: uom.name } : null
        setSelectedUom(selectedUomOption)

        // Set shops
        const activeShopOptions = selectedProduct.activeShopIds
            .map((shopId) => {
                const shop = shops.find((shop) => shop.shopId === shopId)
                return shop ? { value: shop.shopId, label: shop.shopName } : null
            })
            .filter((option) => option !== null)
        setSelectedShops(activeShopOptions)

        // Set filtered shops and categories
        const filteredShops = filteredActiveShops.filter((shop) => shop.companyId === selectedProduct.companyId)
        setFilteredShops(filteredShops)

        const filteredCategories = categories.filter((category) => category.companyId === selectedProduct.companyId)
        setFilteredCategories(filteredCategories)

        // Set BOM items
        const bomItems = selectedProduct.bomDetails ? selectedProduct.bomDetails.items : []
        const formattedBOMItems = bomItems.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            itemName: products.find((p) => p.productId === item.productId)?.name || "",
            uomName: uoms.find((u) => u.uomId === products.find((p) => p.productId === item.productId)?.uomId)?.name || "",
        }))
        setAddedItems(formattedBOMItems)

        // Set requiresGRN if it exists in selectedProduct
        if (selectedProduct.requiresGRN !== undefined) {
            setRequiresGRN(selectedProduct.requiresGRN)
        }
    }, [selectedProduct, categories, companies, shops, uoms, filteredActiveShops, products])

    // Clear added items when requiresGRN is toggled for Finished Good products
    useEffect(() => {
        if (requiresGRN && selectedTypes.includes("Finished Good")) {
            setAddedItems([])
        }
    }, [requiresGRN, selectedTypes])

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }))
    }

    // Handle category selection
    const handleCategorySelect = (selectedOption) => {
        setSelectedCategoryId(selectedOption.value)
        setSelectedCategory(selectedOption)
    }

    // Handle company selection
    const handleCompanySelect = (selectedOption) => {
        setSelectedCompanyId(selectedOption ? selectedOption.value : null)
        setSelectedCompany(selectedOption)

        // Filter shops based on the selected company
        if (selectedOption) {
            const filteredShops = filteredActiveShops.filter((shop) => shop.companyId === selectedOption.value)
            setFilteredShops(filteredShops)
        } else {
            setFilteredShops([])
        }

        // Filter categories based on the selected company's ID
        const filteredCategories = categories.filter((category) => category.companyId === selectedOption.value)
        setFilteredCategories(filteredCategories)
    }

    // Handle shop selection
    const handleShopSelect = (selectedOption) => {
        if (selectedOption) {
            const newSelectedShops = selectedOption.map((option) => ({
                value: option.value,
                label: option.label,
            }))
            setSelectedShops(newSelectedShops)
        } else {
            setSelectedShops([])
        }
    }

    // Handle UOM selection
    const handleUomSelect = (selectedOption) => {
        setSelectedUomId(selectedOption.value)
        setSelectedUom(selectedOption)
    }

    // Handle checkbox changes for product types
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target

        setSelectedTypes((prevSelectedTypes) => {
            return checked
                ? [...prevSelectedTypes, value]
                : prevSelectedTypes.filter((type) => type !== value)
        })
    }

    // Format product type for submission
    const formatProductType = (types) => {
        if (!Array.isArray(types)) {
            console.error("Expected an array for types but got", typeof types)
            return ""
        }
        return types.join(",")
    }

    // Check if the product has raw materials (based on if they've added items)
    const hasRawMaterials = addedItems.length > 0

    // Handle form submission
    const handleEditProductSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await newRequest.put(`/products/update-product/${selectedProduct.productId}`, {
                ...product,
                productName: product.name,
                uomId: selectedUomId,
                categoryId: selectedCategoryId,
                companyId: selectedCompanyId,
                activeShopIds: selectedShops.map((shop) => shop.value),
                productType: formatProductType(selectedTypes),
                items: addedItems,
                userId: currentUser.userId,
                requiresGRN: requiresGRN,
                hasRawMaterials: hasRawMaterials,
                shopId: selectedShops.length > 0 ? selectedShops[0].value : null, // Using first shop as default for logging
            })
            console.log("Product updated successfully!", response)
            window.location.reload()
        } catch (err) {
            console.error("Error updating product:", err)

            const errMessage = err.response?.status === 400 && err.response?.data?.message
            if (errMessage === "PLU Code already exists" || errMessage === "Product Name, Size combination already exists") {
                setErrorMessage(errMessage)
                setShowErrorModal(true)
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.")
                setShowErrorModal(true)
            }
        }
    }

    return (
        <div className="panel-edit-product-popup">
            <Card className="panel-edit-product" ref={panelEditProductRef}>
                <Card.Header className="popup-header">
                    <Card.Title as="h5">Edit Product</Card.Title>
                    <CloseIcon onClick={handleClose} className="close-icon" />
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleEditProductSubmit}>
                        {/* Product Basic Information Section */}
                        <div className="section-container mb-4">
                            <h6 className="section-title">Basic Information</h6>
                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>
                                    Product Name
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control name="name" type="text" value={product.name} onChange={handleChange} required />
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>PLU</Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        name="pluCode"
                                        type="text"
                                        value={product.pluCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>Company</Form.Label>
                                <Col sm={9}>
                                    <Select
                                        options={filteredCompanies.map((company) => ({
                                            value: company.companyId,
                                            label: company.companyName,
                                        }))}
                                        onChange={handleCompanySelect}
                                        value={selectedCompany}
                                        placeholder="Select company"
                                        isClearable
                                        required
                                        isDisabled={true}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>Category</Form.Label>
                                <Col sm={9}>
                                    <Select
                                        options={filteredCategories.map((category) => ({
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
                        </div>

                        {/* Inventory Management Section */}
                        <div className="section-container mb-4">
                            <h6 className="section-title">Inventory Management</h6>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>Min Qty</Form.Label>
                                <Col sm={9}>
                                    <Form.Control name="minQty" type="number" value={product.minQty} onChange={handleChange} required />
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>Active Shops</Form.Label>
                                <Col sm={9}>
                                    <Select
                                        options={filteredShops.map((shop) => ({ value: shop.shopId, label: shop.shopName }))}
                                        onChange={handleShopSelect}
                                        value={selectedShops}
                                        placeholder="Select shops"
                                        isMulti
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label column sm={3}>UoM</Form.Label>
                                <Col sm={9}>
                                    <Select
                                        options={uoms
                                            .filter((uom) => uom.toggle === "enable")
                                            .map((uom) => ({ value: uom.uomId, label: uom.name }))}
                                        onChange={handleUomSelect}
                                        value={selectedUom}
                                        placeholder="Select uom"
                                        isClearable
                                        required
                                    />
                                </Col>
                            </Form.Group>


                        </div>

                        {/* Product Type Section */}
                        <div className="type-wrapper mb-4">
                            <Form.Group className="mt-3" as={Row} controlId="formGridState">

                                {/* Product Type Selection */}
                                <Form.Group className="mb-3" as={Row}>
                                    <Col lg={3} md={3} sm={3}>
                                        <Form.Label>Type</Form.Label>
                                    </Col>
                                    <Col lg={9} md={9} sm={9}>
                                        <div className="checkbox-wrapper mt-2">
                                            {["Raw Material", "Finished Good"].map((type) => (
                                                <Form.Check
                                                    key={type}
                                                    type="checkbox"
                                                    value={type}
                                                    name="productType"
                                                    label={type}
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={handleCheckboxChange}
                                                />
                                            ))}
                                        </div>
                                    </Col>
                                </Form.Group>

                                {/* Tracking Options */}
                                <Form.Group className="mb-3" as={Row}>
                                    <Form.Label column sm={3}>Tracking Options</Form.Label>
                                    <Col sm={9}>
                                        <Form.Check
                                            className="mt-2"
                                            type="checkbox"
                                            id="requiresGRN"
                                            label="Requires GRN Tracking"
                                            checked={requiresGRN}
                                            onChange={(e) => setRequiresGRN(e.target.checked)}
                                        />
                                        <Form.Text className="text-muted">
                                            Enable if this product requires Goods Receipt Note tracking
                                        </Form.Text>
                                    </Col>
                                </Form.Group>

                                {/* BOM Section for Finished Good */}
                                {selectedTypes.includes("Finished Good") && (
                                    <Form.Group className="mb-3" as={Row}>
                                        <Col lg={3} md={3} sm={3}>
                                            <Form.Label>Product Configuration</Form.Label>
                                        </Col>
                                        <Col lg={9} md={9} sm={9}>
                                            {/* Size and Kitchen Location - Always available */}
                                            <div className="size-select-wrapper mb-3">
                                                <Form.Label>Size</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={product.size || ""}
                                                    onChange={(e) => setProduct((prevProduct) => ({ ...prevProduct, size: e.target.value }))}
                                                >
                                                    <option value="">Select Size</option>
                                                    <option value="Small">Small</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Regular">Regular</option>
                                                    <option value="Large">Large</option>
                                                </Form.Control>
                                            </div>

                                            <div className="kitchen-select-wrapper mb-3">
                                                <Form.Label>Kitchen Location</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={deviceLocation || ""}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        setProduct((prevProduct) => ({ ...prevProduct, deviceLocation: selectedValue }));
                                                        setDeviceLocation(selectedValue);
                                                    }}
                                                >
                                                    <option value="">Select Kitchen Location</option>
                                                    <option value="Hot Kitchen">Hot Kitchen</option>
                                                    <option value="Cold Kitchen">Cold Kitchen</option>
                                                    <option value="Bar">Bar</option>
                                                </Form.Control>
                                            </div>

                                            {/* BOM Section - Only if GRN tracking is disabled */}
                                            {!requiresGRN ? (
                                                <div>
                                                    <p className="text-muted mb-3">
                                                        Add raw materials that make up this product. Adding items will automatically set this product as having raw materials.
                                                    </p>
                                                    <BomSection
                                                        product={product}
                                                        setProduct={setProduct}
                                                        deviceLocation={deviceLocation}
                                                        setDeviceLocation={setDeviceLocation}
                                                        addedItems={addedItems}
                                                        setAddedItems={setAddedItems}
                                                        selectedItem={selectedItem}
                                                        setSelectedItem={setSelectedItem}
                                                        qty={qty}
                                                        setQty={setQty}
                                                        filteredRawProducts={filteredRawProducts}
                                                        uoms={uoms}
                                                        products={products}
                                                    />
                                                    {hasRawMaterials && (
                                                        <div className="mt-2 alert alert-info">
                                                            <small>
                                                                Raw materials added: {addedItems.length}. This product will be marked as having raw materials.
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-warning mt-3">
                                                    <small>Raw materials cannot be assigned when GRN tracking is enabled.</small>
                                                </div>
                                            )}
                                        </Col>
                                    </Form.Group>
                                )}

                                {/* Raw Material without BOM info */}
                                {(selectedTypes.includes("Raw Material") && !selectedTypes.includes("Finished Good")) && (
                                    <Form.Group className="mb-3" as={Row}>
                                        <Col lg={3} md={3} sm={3}>
                                            <Form.Label>Note</Form.Label>
                                        </Col>
                                        <Col lg={9} md={9} sm={9}>
                                            <div className="alert alert-info">
                                                <small>Raw Material products don&apos;t require a Bill of Materials.</small>
                                            </div>
                                        </Col>
                                    </Form.Group>
                                )}
                            </Form.Group>
                        </div>


                        {/* Status Toggle */}
                        <Form.Group className="mb-3 status" as={Row}>
                            <Form.Label column sm={3}>Status</Form.Label>
                            <Col sm={9} name="toggle">
                                <Form.Check
                                    label="Active/Inactive"
                                    name="toggle"
                                    checked={product.toggle === "enable"}
                                    onChange={(e) =>
                                        setProduct((prev) => ({
                                            ...prev,
                                            toggle: e.target.checked ? "enable" : "disable",
                                        }))
                                    }
                                />
                            </Col>
                        </Form.Group>

                        {/* Submit Button */}
                        <Form.Group className="mb-3" as={Row}>
                            <Col sm={12} className="d-flex justify-content-end">
                                <Button variant="secondary" className="me-2" onClick={handleClose}>Cancel</Button>
                                <Button type="submit" variant="primary">Save</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default EditProductForm