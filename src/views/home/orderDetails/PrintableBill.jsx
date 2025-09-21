import React, { useRef } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import Bill from './Bill';

const PrintableBill = ({ selectedOrder, productDetails }) => {
    const billRef = useRef();

    const handlePrint = () => {
        const printContent = billRef.current;
        const printWindow = window.open('', '_blank');

        // Wait until the print window is loaded before writing content and styles
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Bill</title> 
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css">
                </head>
                <body>
                    <div id="content">${printContent.outerHTML}</div>
                </body>
            </html>
        `);

        // Ensure styles are applied and print the content
        printWindow.document.close();

        // Wait for content and styles to load before printing
        printWindow.onload = () => {
            printWindow.print();
        };
    };


    const { finishedGoods, transactionDateTime, invoiceID, billTotal, serviceCharges } = selectedOrder || {};
    const date = new Date(transactionDateTime).toLocaleDateString();
    const time = new Date(transactionDateTime).toLocaleTimeString();

    const cartItems = finishedGoods.map((item) => ({
        name: productDetails[item.finishedgoodId]?.name || 'N/A',
        size: productDetails[item.finishedgoodId]?.size || '',
        quantity: item.finishedgoodQty,
        sellingPrice: item.sellingPrice,
        sellingTypeCommission: '0%',
        discount: item.discountAmount
    }));

    return (
        <div>
            <div ref={billRef}>
                <Bill
                    billNumber={invoiceID}
                    cartItems={cartItems}
                    discount={finishedGoods.reduce((sum, item) => sum + item.discountAmount, 0)}
                    subTotal={finishedGoods.reduce((sum, item) => sum + item.sellingPrice * item.finishedgoodQty, 0)}
                    totalAmount={billTotal}
                    cashAmount={billTotal} // Assume full payment by cash
                    balance={0}
                    walletAmount={0}
                    walletBalance={0}
                    paymentMethod="Cash"
                    customer="Customer"
                    date={date}
                    time={time}
                    serviceCharges={serviceCharges}
                />
            </div>
            <button onClick={handlePrint} className="btn btn-primary mt-3">
                Print Bill
            </button>
        </div>
    );
};

PrintableBill.propTypes = {
    selectedOrder: PropTypes.shape({
        finishedGoods: PropTypes.arrayOf(
            PropTypes.shape({
                finishedgoodId: PropTypes.string.isRequired,
                finishedgoodQty: PropTypes.number.isRequired,
                sellingPrice: PropTypes.number.isRequired,
                discountAmount: PropTypes.number.isRequired
            })
        ).isRequired,
        transactionDateTime: PropTypes.string.isRequired,
        transactionCode: PropTypes.string,
        invoiceID: PropTypes.string.isRequired,
        billTotal: PropTypes.number.isRequired,
        serviceCharges: PropTypes.number.isRequired
    }).isRequired,
    productDetails: PropTypes.objectOf(
        PropTypes.shape({
            name: PropTypes.string,
            size: PropTypes.string
        })
    ).isRequired
};

export default PrintableBill;
