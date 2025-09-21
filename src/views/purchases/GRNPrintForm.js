import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table} from 'react-bootstrap';
import newRequest from '../../utils/newRequest';

const GRNPrintForm = React.forwardRef(({ grn }, ref) => {
  const [grnData, setGrnData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);

  useEffect(() => {
    if (grn) {
      newRequest.get(`grns/grn-details/${grn.companyId}/${grn.shopId}/${grn.transactionCode}/transactions/`)
        .then(response => {
          setGrnData(response.data);
        })
        .catch(error => {
          console.error('Error fetching GRN data:', error);
        });
    }
  }, [grn]);

  useEffect(() => {
    newRequest.get('/suppliers').then(response => setSuppliers(response.data));
    newRequest.get('/products').then(response => setProducts(response.data));
    newRequest.get('/uoms').then(response => setUoms(response.data));
  }, []);

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(supplier => supplier.supplierId === supplierId);
    return supplier ? supplier.supplierName : 'Unknown Supplier';
  };

  const getProductName = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getUomId = (productId) => {
    const product = products.find(product => product.productId === productId);
    return product ? product.uomId : 'Unknown UOM ID';
  };

  const getUom = (uomId) => {
    const uom = uoms.find(uom => uom.uomId === uomId);
    return uom ? uom.name : 'Unknown UOM';
  };

  const calculateTotalQuantity = () => {
    return grnData?.grnTransactions.reduce((total, transaction) => total + transaction.quantity, 0) || 0;
  };

  const calculateTotalAmount = () => {
    return grnData?.grnTransactions.reduce((total, transaction) => total + transaction.totalCost, 0) || 0;
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
  };

  if (!grnData) return null;

  return (
    <div ref={ref}>
      <div className='w-100 printable-section p-10 px-lg-5'>
        <div className='text-center pt-5'>
          <h5 className='border-light'>CeylonX Management System</h5>
          <p>Address</p>
          <p>Tel: 011 2254 255</p>
        </div>
        <div>
          <Card.Text>Date: {new Date(grnData.grnHeader.transactionDateTime).toLocaleDateString()}</Card.Text>
          <Card.Text>Supplier: {getSupplierName(grnData.grnHeader.supplierId)}</Card.Text>
          <Card.Text>Remarks: {grnData.grnTransactions.length > 0 ? grnData.grnTransactions[0].remarks : 'N/A'}</Card.Text>
          <Card.Text>GRN No: {grnData.grnHeader.transactionCode}</Card.Text>

          <Table className='w-100 border'>
            <thead>
              <tr>
                <th>No</th>
                <th>Raw Material</th>
                <th className='text-center'>Quantity</th>
                <th className='text-center'>UOM</th>
                <th className='text-end'>Rate</th>
                <th className='text-end'>Total</th>
              </tr>
            </thead>
            <tbody>
              {grnData.grnTransactions.map((transaction, index) => (
                <tr key={transaction._id}>
                  <td>{index + 1}</td>
                  <td>{getProductName(transaction.productId)}</td>
                  <td className='text-center'>{transaction.quantity}</td>
                  <td className='text-center'>{getUom(getUomId(transaction.productId))}</td>
                  <td className='text-end'>{formatPrice(transaction.unitCost)}</td>
                  <td className='text-end'>{formatPrice(transaction.totalCost)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>Total</td>
                <td className='text-center' style={{ fontWeight: 'bold' }}>{calculateTotalQuantity()}</td>
                <td></td>
                <td></td>
                <td className='text-end' style={{ fontWeight: 'bold' }}>{formatPrice(calculateTotalAmount())}</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className='text-center py-3'>
          <p>*** System generated document. No signature required ***</p>
          <p>Software By Ceylonx</p>
        </div>
      </div>
    </div>
  );
});

GRNPrintForm.propTypes = {
  grn: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    transactionCode: PropTypes.string.isRequired,
    shopId: PropTypes.string.isRequired,
    companyId: PropTypes.string.isRequired,
  }).isRequired,
};

export default GRNPrintForm;
