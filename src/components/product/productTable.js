
import { Table, Badge } from "react-bootstrap"
import EditIcon from "@mui/icons-material/Edit"

const ProductTable = ({
    currentProducts,
    indexOfFirstItem,
    categories,
    companies,
    uoms,
    users,
    togglePanelEditProduct,
}) => {
    // Helper functions
    const getBadgeVariantAndText = (toggle) => {
        return toggle === "enable" ? { variant: "success", text: "Active" } : { variant: "danger", text: "Inactive" }
    }

    const getCategoryName = (categoryId) => {
        const category = categories.find((category) => category.categoryId === categoryId)
        return category ? category.categoryName : "-"
    }

    const getUomName = (uomId) => {
        const uom = uoms.find((uom) => uom.uomId === uomId)
        return uom ? uom.name : ""
    }

    const getCompanyName = (companyId) => {
        const company = companies.find((company) => company.companyId === companyId)
        return company ? company.companyName : "-"
    }

    const getCreatedByUserName = (userId) => {
        const user = users.find((user) => user.userId === userId)
        return user ? user.name : "-"
    }

    return (
        <div className="table-responsive">
            <Table responsive size="sm">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>PLU</th>
                        <th>Category</th>
                        <th>Types</th>
                        <th>Min Qty</th>
                        <th>Company</th>
                        <th>Created Date</th>
                        <th>Created By</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.map((product, index) => {
                        const { variant, text } = getBadgeVariantAndText(product.toggle)
                        return (
                            <tr key={product.productId}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{product.name}</td>
                                <td>{product.size}</td>
                                <td>{product.pluCode}</td>
                                <td>{getCategoryName(product.categoryId)}</td>
                                <td>{product.productType}</td>
                                <td>
                                    {product.minQty} {getUomName(product.uomId)}
                                </td>
                                <td>{getCompanyName(product.companyId)}</td>
                                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                <td>{getCreatedByUserName(product.createdBy)}</td>
                                <td>
                                    <Badge bg={variant} className={`badge ${variant === "light" ? "mx-2 text-dark" : "mx-2"}`}>
                                        {text}
                                    </Badge>
                                    <EditIcon className="edit-icon" onClick={() => togglePanelEditProduct(product)} />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    )
}

export default ProductTable

