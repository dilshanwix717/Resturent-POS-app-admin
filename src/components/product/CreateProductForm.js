import { useState, useRef, useEffect } from "react"
import { Row, Col, Form, Card, Button } from "react-bootstrap"
import CloseIcon from "@mui/icons-material/Close"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
import newRequest from "../../utils/newRequest"
import BomSection from "./BomSection"

const CreateProductForm = ({
  handleClose,
  categories,
  companies,
  uoms,
  filteredCompanies,
  filteredActiveShops,
  filteredRawProducts,
  products,
  currentUser,
  userRole,
  setShowErrorModal,
  setErrorMessage,
}) => {
  const [product, setProduct] = useState({
    productName: "",
    barcode: "",
    pluCode: "",
    minQty: "",
    size: "",
    deviceLocation: "",
  })

  const [productName, setProductName] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedUomId, setSelectedUomId] = useState("")
  const [selectedUom, setSelectedUom] = useState("")
  const [selectedShops, setSelectedShops] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [deviceLocation, setDeviceLocation] = useState(null)
  const [addedItems, setAddedItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [qty, setQty] = useState("")
  const [filteredShops, setFilteredShops] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [requiresGRN, setRequiresGRN] = useState(false)

  const panelCreateProductRef = useRef(null)

  useEffect(() => {
    if (userRole === "admin" || userRole === "stockManager") {
      const selectedCompany = companies.find((company) => company.companyId === currentUser.companyId)
      setSelectedCompany(selectedCompany ? { value: currentUser.companyId, label: selectedCompany.companyName } : null)
      setSelectedCompanyId(currentUser.companyId)
      setFilteredCategories(categories.filter((category) => category.companyId === currentUser.companyId))
      setFilteredShops(filteredActiveShops.filter((shop) => shop.companyId === currentUser.companyId))
    }
  }, [userRole, companies, categories, currentUser.companyId, filteredActiveShops])

  // Clear added items when requiresGRN is toggled for Finished Good products
  useEffect(() => {
    if (requiresGRN && selectedTypes.includes("Finished Good")) {
      setAddedItems([])
    }
  }, [requiresGRN, selectedTypes])

  const handleChange = (e) => setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleProductNameChange = (selectedOption) => setProductName(selectedOption ? selectedOption.label.split(" - ")[0] : "")
  const handleCategorySelect = (selectedOption) => setSelectedCategoryId(selectedOption.value) & setSelectedCategory(selectedOption)
  const handleCompanySelect = (selectedOption) => {
    setSelectedCompanyId(selectedOption?.value || null)
    setSelectedCompany(selectedOption)
    setFilteredShops(filteredActiveShops.filter((shop) => shop.companyId === selectedOption?.value))
    setFilteredCategories(categories.filter((category) => category.companyId === selectedOption?.value))
  }
  const handleShopSelect = (selectedOption) => setSelectedShops(selectedOption ? selectedOption.map((opt) => ({ value: opt.value, label: opt.label })) : [])
  const handleUomSelect = (selectedOption) => setSelectedUomId(selectedOption.value) & setSelectedUom(selectedOption)
  const handleCheckboxChange = (e) => {
    if (e.target.name === "productType") {
      setSelectedTypes((prev) =>
        e.target.checked
          ? [...prev, e.target.value]
          : prev.filter((type) => type !== e.target.value)
      )
    }
  }

  const formatProductType = (types) => Array.isArray(types) ? types.join(",") : ""

  // Check if the product has raw materials (based on if they've added items)
  const hasRawMaterials = addedItems.length > 0

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault()
    if (![productName, selectedCategoryId, selectedCompanyId, selectedUomId, selectedTypes, currentUser.userId].every(Boolean)) return

    try {
      await newRequest.post("/products/new-product", {
        ...product,
        productName,
        uomId: selectedUomId,
        categoryId: selectedCategoryId,
        companyId: selectedCompanyId,
        activeShopIds: selectedShops.map((shop) => shop.value),
        productType: formatProductType(selectedTypes),
        items: addedItems,
        userId: currentUser.userId,
        shopId: selectedShops.length > 0 ? selectedShops[0].value : null, // Using first shop as default for logging
        requiresGRN,
        hasRawMaterials: hasRawMaterials,
      })
      console.log("Product created successfully!")
      window.location.reload()
    } catch (err) {
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
    <div className="panel-create-product-popup">
      <Card className="panel-create-product" ref={panelCreateProductRef}>
        <Card.Header className="popup-header">
          <Card.Title as="h5">Create Product</Card.Title>
          <CloseIcon onClick={handleClose} className="close-icon" />
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleCreateProductSubmit}>
            {/* Product Basic Information Section */}
            <div className="section-container mb-4">
              <h6 className="section-title">Basic Information</h6>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>Product Name</Form.Label>
                <Col sm={9}>
                  <CreatableSelect
                    isClearable
                    onChange={handleProductNameChange}
                    options={products.map((product) => ({
                      value: product.productId,
                      label: product.size ? `${product.name} - ${product.size}` : product.name,
                    }))}
                    value={productName ? { label: products.find((product) => product.productId === productName)?.name || productName, value: productName } : null}
                  />
                </Col>
              </Form.Group>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>PLU</Form.Label>
                <Col sm={9}><Form.Control name="pluCode" type="text" onChange={handleChange} required /></Col>
              </Form.Group>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>Company</Form.Label>
                <Col sm={9}>
                  <Select
                    options={filteredCompanies.map((company) => ({ value: company.companyId, label: company.companyName }))}
                    onChange={handleCompanySelect}
                    value={selectedCompany}
                    isClearable
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>Category</Form.Label>
                <Col sm={9}>
                  <Select
                    options={filteredCategories.map((category) => ({ value: category.categoryId, label: category.categoryName }))}
                    onChange={handleCategorySelect}
                    value={selectedCategory}
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
                <Col sm={9}><Form.Control name="minQty" type="number" onChange={handleChange} required /></Col>
              </Form.Group>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>Active Shops</Form.Label>
                <Col sm={9}>
                  <Select
                    options={filteredShops.map((shop) => ({ value: shop.shopId, label: shop.shopName }))}
                    onChange={handleShopSelect}
                    value={selectedShops}
                    isMulti
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group className="mb-3" as={Row}>
                <Form.Label column sm={3}>UoM</Form.Label>
                <Col sm={9}>
                  <Select
                    options={uoms.filter((uom) => uom.toggle === "enable").map((uom) => ({ value: uom.uomId, label: uom.name }))}
                    onChange={handleUomSelect}
                    value={selectedUom}
                    isClearable
                    required
                  />
                </Col>
              </Form.Group>
            </div>

            {/* Product Type Section */}
            <div className="type-wrapper mb-4">
              <Form.Group className="mt-3" as={Row} controlId="formGridState">


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
                            const selectedValue = e.target.value
                            setProduct((prevProduct) => ({ ...prevProduct, deviceLocation: selectedValue }))
                            setDeviceLocation(selectedValue)
                          }}
                        >
                          <option value="">Select Kitchen Location</option>
                          <option value="Hot Kitchen">Hot Kitchen</option>
                          <option value="Cold Kitchen">Cold Kitchen</option>
                          <option value="Bar">Bar</option>
                        </Form.Control>
                      </div>

                      {/* Only show BOM if GRN is not required */}
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

            {/* Submit Button */}
            <Form.Group className="mb-3" as={Row}>
              <Col sm={12} className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="primary">Save Product</Button>
              </Col>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default CreateProductForm