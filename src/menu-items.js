const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const role = currentUser ? currentUser.role : '';

const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        { id: 'dashboard', title: 'Dashboard', type: 'item', icon: 'feather icon-grid', url: '/dashboard', visible: role === 'superAdmin' || role === 'admin' },
        { id: 'super-admin-panel', title: 'Company Management', type: 'item', icon: 'feather icon-command', url: '/superAdminPanel', visible: role === 'superAdmin' },
        {
          id: 'home',
          title: 'Home',
          type: 'collapse',
          icon: 'feather icon-home',
          visible: role === 'superAdmin',
          children: [
            { id: 'cashInHand', title: 'Cash in Hand', type: 'item', url: '/cashInHand', visible: role === 'superAdmin' },
            { id: 'sales/profit', title: 'Sales and Profit', type: 'item', url: '/salesProfit', visible: role === 'superAdmin' },
            { id: 'orderDetails', title: 'Order Details', type: 'item', url: '/orderDetails', visible: role === 'superAdmin' },
            { id: 'inventoryReport', title: 'Inventory Report', type: 'item', url: '/inventoryReport', visible: role === 'superAdmin' },
            { id: 'discountReport', title: 'Discount Report', type: 'item', url: '/discountReport', visible: role === 'superAdmin' },
            { id: 'serviceChargeReport', title: 'Service Charge Report', type: 'item', url: '/serviceChargeReport', visible: role === 'superAdmin' },

          ]
        },
        {
          id: 'productManagement',
          title: 'Product Management',
          type: 'collapse',
          icon: 'feather icon-box',
          visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager',
          children: [
            { id: 'categoryList', title: 'Category List', type: 'item', url: '/categoryList', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'productList', title: 'Product List', type: 'item', url: '/productList', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'sellingType', title: 'Selling Type', type: 'item', url: '/sellingType', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'productPrices', title: 'Product Prices', type: 'item', url: '/productPrices', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'stocks', title: 'Inventory Stock', type: 'item', url: '/stock', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
          ]
        },
        {
          id: 'purchases',
          title: 'Purchases',
          type: 'collapse',
          icon: 'feather icon-credit-card',
          visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager',
          children: [
            { id: 'purchaseBills', title: 'Create GRN', type: 'item', url: '/purchaseBills', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'completePurchase', title: 'Complete GRN', type: 'item', url: '/completePurchase', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
            { id: 'returnPurchase', title: 'Return GRN', type: 'item', url: '/returnPurchase', visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager' },
          ]
        },
        {
          id: 'supplier',
          title: 'Supplier',
          type: 'collapse',
          icon: 'feather icon-plus-square',
          visible: role === 'superAdmin',
          children: [
            { id: 'supplierList', title: 'Supplier List', type: 'item', url: '/supplierList', visible: role === 'superAdmin' },
          ]
        },
        {
          id: 'configuration',
          title: 'Configuration',
          type: 'collapse',
          icon: 'feather icon-globe',
          visible: role === 'superAdmin' || role === 'admin' || role === 'stockManager',
          children: [
            { id: 'printers', title: 'Printers', type: 'item', url: '/printers', visible: role === 'superAdmin' || role === 'admin' },
            { id: 'unitOfMaterial', title: 'Unit of Material', type: 'item', url: '/unitOfMaterial', visible: role === 'superAdmin' || role === 'stockManager' },
            { id: 'themes', title: 'Themes', type: 'item', url: '/themes', visible: role === 'superAdmin' },
            { id: 'access', title: 'Access', type: 'item', url: '/access', visible: role === 'superAdmin' || role === 'admin' },
          ]
        },
      ]
    },
  ]
};

// Filter out items not visible to the current role
menuItems.items = menuItems.items.map(group => ({
  ...group,
  children: group.children.map(item => ({
    ...item,
    children: item.children ? item.children.filter(child => child.visible !== false) : undefined,
  })).filter(item => item.visible !== false),
}));

export default menuItems;
