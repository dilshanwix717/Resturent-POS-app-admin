import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Table } from 'react-bootstrap';
import newRequest from '../../../utils/newRequest';
import './print.css';

const GRNBill = ({ formData, rowsData, grnData }) => {
  const [products, setProducts] = useState([]);
  const rowsToDisplay = rowsData.slice(0, -1);

  // Function to format prices
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
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

  const productMap = products.reduce((map, product) => {
    map[product.productId] = product.name;
    return map;
  }, {});

  const totalQuantity = rowsData.reduce((total, row) => total + (row.quantity || 0), 0);
  const totalAmount = rowsData.reduce((total, row) => total + (row.total || 0), 0);

  return (
    <div>
      <div className='w-100 printable-section'>
        <div className='text-center pt-5'>
          <h5 className='border-light'>CeylonX Management System</h5>
          <p>Address</p>
          <p>Tel:011 2254 255</p>
        </div>
        <div>
          <Card.Text>Date: {formData.date || 'N/A'}</Card.Text>
          <Card.Text>Supplier: {formData.supplier || 'N/A'}</Card.Text>
          <Card.Text>Remarks: {formData.remarks || 'N/A'}</Card.Text>
          {grnData && <Card.Text>GRN No: {grnData.transactionCode || 'N/A'}</Card.Text>}

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
              {rowsToDisplay.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{productMap[row.rawMaterial] || 'N/A'}</td>
                  <td className='text-center'>{row.quantity || 'N/A'}</td>
                  <td className='text-center'>{row.uom || 'N/A'}</td>
                  <td className='text-end'>{formatPrice(row.unitCost || 'N/A')}</td>
                  <td className='text-end'>{formatPrice(row.total || 'N/A')}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ fontWeight: 'bold' }}>Total</td>
                <td className='text-center' style={{ fontWeight: 'bold' }}>{totalQuantity}</td>
                <td></td>
                <td></td>
                <td className='text-end' style={{ fontWeight: 'bold' }}>{formatPrice(totalAmount)}</td>
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
};

GRNBill.propTypes = {
  formData: PropTypes.shape({
    date: PropTypes.string,
    supplier: PropTypes.string,
    remarks: PropTypes.string
  }),
  rowsData: PropTypes.arrayOf(PropTypes.shape({
    rawMaterial: PropTypes.string,
    quantity: PropTypes.number,
    uom: PropTypes.string,
    unitCost: PropTypes.number,
    total: PropTypes.number
  })),
  grnData: PropTypes.shape({
    transactionCode: PropTypes.string
  })
};

export default GRNBill;
