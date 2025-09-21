import React from 'react';

import PropTypes from 'prop-types';

const Bill = React.forwardRef(
    (
        {
            billNumber,
            cartItems,
            discount,
            subTotal,
            totalAmount,
            cashAmount,
            balance,
            walletAmount,
            walletBalance,
            paymentMethod,
            date,
            time,
            serviceCharges,
        },
        ref
    ) => {
        const username = localStorage.getItem('username');

        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(price);
        };

        const calculateSellingFinalPrice = (sellingPrice, sellingTypeCommission) => {
            if (sellingTypeCommission.endsWith('%')) {
                const percentage = parseFloat(sellingTypeCommission) / 100;
                return sellingTypeCommission.startsWith('-')
                    ? sellingPrice - sellingPrice * Math.abs(percentage)
                    : sellingPrice + sellingPrice * Math.abs(percentage);
            } else {
                const commissionValue = parseFloat(sellingTypeCommission);
                return sellingTypeCommission.startsWith('-')
                    ? sellingPrice - Math.abs(commissionValue)
                    : sellingPrice + Math.abs(commissionValue);
            }
        };

        const calculateDiscountAmount = (finalPrice, discount) => {
            if (typeof discount === 'string' && discount.endsWith('%')) {
                const percentage = parseFloat(discount) / 100;
                return finalPrice * percentage;
            } else {
                // Treat discount as a number if it's not a percentage string
                return parseFloat(discount) || 0;
            }
        };


        return (
            <div ref={ref} className="fixed inset-0 z-50 bg-white bg-opacity-50 flex flex-col justify-center items-center px-5 border-1">
                <div className="slider flex flex-col gap-1 w-96 h-auto bg-white overflow-auto">
                    <div className='flex justify-center w-full'>
                        <img src="/logo.png" alt="logo" className="w-32" />
                    </div>
                    <h1 className="text-sm font-black text-center">SALES RECEIPT</h1>
                    <hr className="border-1 border-dashed border-black my-1" />
                    <div className="grid grid-cols-12 gap-1 font-bold text-xs">
                        <p className="col-span-6">Item</p>
                        <p className="col-span-2 text-right">Qt</p>
                        <p className="col-span-4 text-right">Price</p>
                    </div>
                    {cartItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-1 text-xs">
                            <p className="col-span-6">{item.name} ({item.size})</p>
                            <p className="col-span-2 text-right">{item.quantity}x</p>
                            <p className="col-span-4 text-right">
                                {formatPrice(
                                    calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission) -
                                    calculateDiscountAmount(
                                        calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission),
                                        item.discount
                                    )
                                )}
                            </p>
                        </div>
                    ))}
                    <p className="text-center font-bold text-xs">{cartItems.length}x Items Sold</p>
                    <hr className="border-1 border-dashed border-black my-1" />
                    <div className="flex font-bold justify-between text-xs">
                        <p>Sub Total :</p>
                        <p>LKR {subTotal}</p>
                    </div>
                    <div className="flex font-bold justify-between text-xs">
                        <p>Discount Total :</p>
                        <p>LKR {formatPrice(discount)}</p>
                    </div>
                    <div className="flex font-bold justify-between text-xs">
                        <p>Service Charges :</p>
                        <p>LKR {formatPrice(serviceCharges)}</p>
                    </div>
                    <hr className="border-1 border-dashed border-black my-1" />
                    <div className="flex font-bold justify-between text-xs">
                        <p>Total :</p>
                        <p>LKR {totalAmount}</p>
                    </div>
                    {paymentMethod === 'Cash' && (
                        <>
                            <div className="flex font-bold justify-between text-xs">
                                <p>Cash</p>
                                <p>LKR {formatPrice(cashAmount)}</p>
                            </div>
                            <div className="flex font-bold justify-between text-xs">
                                <p>Balance :</p>
                                <p>LKR {formatPrice(balance)}</p>
                            </div>
                        </>
                    )}
                    {paymentMethod === 'Wallet' && (
                        <>
                            <div className="flex font-bold justify-between text-xs">
                                <p>Wallet</p>
                                <p>LKR {formatPrice(walletAmount)}</p>
                            </div>
                            <div className="flex font-bold justify-between text-xs">
                                <p>Balance :</p>
                                <p>LKR {formatPrice(walletBalance)}</p>
                            </div>
                        </>
                    )}
                    <hr className="border-1 border-dashed border-black my-1" />
                    <h1 className="font-black text-center text-sm">THANK YOU.!</h1>
                    <hr className="border-1 border-dashed border-black my-1" />
                    <div className="flex font-bold justify-between text-sm">
                        <p>{billNumber}</p>
                        <p>{date}</p>
                        <p>{time}</p>
                        <p>{username}</p>
                    </div>
                    <hr className="border-1 border-dashed border-black my-1" />
                    <p className="text-center text-sm">Powered by CeylonX</p>
                </div>
            </div>
        );
    }
);

Bill.propTypes = {
    billNumber: PropTypes.string.isRequired,
    cartItems: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            size: PropTypes.string,
            quantity: PropTypes.number.isRequired,
            sellingPrice: PropTypes.number.isRequired,
            sellingTypeCommission: PropTypes.string.isRequired,
            discount: PropTypes.string,
        })
    ).isRequired,
    discount: PropTypes.string.isRequired,
    subTotal: PropTypes.number.isRequired,
    totalAmount: PropTypes.number.isRequired,
    cashAmount: PropTypes.number,
    balance: PropTypes.number,
    walletAmount: PropTypes.number,
    walletBalance: PropTypes.number,
    paymentMethod: PropTypes.string.isRequired,
    customer: PropTypes.string,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    serviceCharges: PropTypes.number.isRequired,
};

export default Bill;
