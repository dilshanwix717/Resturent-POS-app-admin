import { Row, Col, Form, Button } from "react-bootstrap"
import Select from "react-select"

const BomSection = ({
    // product,
    // setProduct,
    addedItems,
    setAddedItems,
    selectedItem,
    setSelectedItem,
    qty,
    setQty,
    filteredRawProducts,
    uoms,
    products,
}) => {
    // Handle item selection
    const handleItemSelect = (selectedOption) => {
        if (!selectedOption) {
            setSelectedItem(null)
            return
        }

        const selectedProduct = filteredRawProducts.find((product) => product.value === selectedOption.value)

        if (!selectedProduct) {
            return
        }

        const relevantProduct = products.find((product) => product.productId === selectedProduct.value)

        if (!relevantProduct) {
            return
        }

        const uomId = relevantProduct.uomId
        const uom = uoms.find((uom) => uom.uomId === uomId)

        setSelectedItem({
            ...selectedOption,
            uomName: uom?.name || "Unknown UOM",
        })
    }

    // Handle adding an item to BOM
    const handleAddItem = () => {
        if (selectedItem && qty !== "") {
            const newItem = {
                itemName: selectedItem.label,
                qty: Number(qty),
                productId: selectedItem.value,
                uomName: selectedItem.uomName,
            }

            setAddedItems([...addedItems, newItem])
            setQty("")
            setSelectedItem(null)
        }
    }

    // Handle editing an item in BOM
    const handleEditItem = (index, selectedOption) => {
        const updatedItems = [...addedItems]
        updatedItems[index].productId = selectedOption ? selectedOption.value : ""
        setAddedItems(updatedItems)
    }

    // Handle editing quantity in BOM
    const handleEditQuantity = (index, quantity) => {
        const updatedItems = [...addedItems]
        updatedItems[index].qty = Number(quantity)
        setAddedItems(updatedItems)
    }

    // Handle removing an item from BOM
    const handleRemoveItem = (index) => {
        setAddedItems(addedItems.filter((_, i) => i !== index))
    }

    return (
        <Form.Group className="mb-3" as={Row} controlId="formHorizontalBOMManual">
            <h6>Bill of Materials</h6>

            <Col>
                <Row className="add-items-area">
                    {addedItems.length > 0 && (
                        <div className="mb-3">
                            <h5>Added Items:</h5>
                            {addedItems.map((item, index) => (
                                <Row key={index} className="added-item-row mb-2">
                                    <Col lg={6} md={6} sm={6} xs={6}>
                                        <Select
                                            options={filteredRawProducts.map((product) => ({
                                                value: product.value,
                                                label: product.label,
                                            }))}
                                            value={filteredRawProducts.find((product) => product.value === item.productId)}
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
                        <Row className="add-item-row mb-4">
                            <Col lg={6} md={6} sm={6} col={6} className="add-item">
                                <Select
                                    options={filteredRawProducts.map((product) => ({
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
                            <Button variant="primary" onClick={handleAddItem}>
                                Add Item
                            </Button>
                        </Col>
                    </div>
                </Row>
            </Col>
        </Form.Group>
    )
}

export default BomSection