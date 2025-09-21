import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  { exact: 'true', path: '/', element: () => <Navigate to={BASE_URL} replace /> },
  { exact: 'true', path: '/login', element: lazy(() => import('./views/auth/signin/SignIn1')) },
  { exact: 'true', path: '/auth/signin', element: lazy(() => import('./views/auth/signin/SignIn1')) },
  { exact: 'true', path: '/auth/signup-1', element: lazy(() => import('./views/auth/signup/SignUp1')) },
  { exact: 'true', path: '/auth/reset-password-1', element: lazy(() => import('./views/auth/reset-password/ResetPassword1')) },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      { exact: 'true', path: '/superAdminPanel', element: lazy(() => import('./views/superAdminPanel')) },
      { exact: 'true', path: '/dashboard', element: lazy(() => import('./views/home/dashboard')) },
      { exact: 'true', path: '/cashInHand', element: lazy(() => import('./views/home/cashInHand')) },
      { exact: 'true', path: '/salesProfit', element: lazy(() => import('./views/home/salesProfit')) },
      { exact: 'true', path: '/inventoryReport', element: lazy(() => import('./views/home/InventoryReport')) },
      { exact: 'true', path: '/discountReport', element: lazy(() => import('./views/home/DiscountReport')) },
      { exact: 'true', path: '/serviceChargeReport', element: lazy(() => import('./views/home/ServiceChargeReport')) },
      { exact: 'true', path: '/orderDetails', element: lazy(() => import('./views/home/orderDetails')) },
      { exact: 'true', path: '/salesProductWise', element: lazy(() => import('./views/home/salesProductWise')) },
      { exact: 'true', path: '/profitLossReport', element: lazy(() => import('./views/home/profitLossReport')) },
      { exact: 'true', path: '/productMovement', element: lazy(() => import('./views/home/productMovement')) },
      { exact: 'true', path: '/posStock', element: lazy(() => import('./views/home/posStock')) },
      { exact: 'true', path: '/posReorders', element: lazy(() => import('./views/home/posReorders')) },
      { exact: 'true', path: '/pos', element: lazy(() => import('./views/sales/pos')) },
      { exact: 'true', path: '/posReturn', element: lazy(() => import('./views/sales/posReturn')) },
      { exact: 'true', path: '/posReceipts', element: lazy(() => import('./views/sales/posReceipts')) },
      { exact: 'true', path: '/posExpenses', element: lazy(() => import('./views/sales/posExpenses')) },
      { exact: 'true', path: '/profile', element: lazy(() => import('./views/userRoleManagement/userManagement/profile')) },
      { exact: 'true', path: '/salesRepList', element: lazy(() => import('./views/userRoleManagement/posCashiers/salesRepList')) },
      { exact: 'true', path: '/newSalesRepList', element: lazy(() => import('./views/userRoleManagement/posCashiers/newSalesRepList')) },
      { exact: 'true', path: '/productList', element: lazy(() => import('./views/productManagement/products/productList')) },
      { exact: 'true', path: '/productPrices', element: lazy(() => import('./views/productManagement/products/productPrices')) },
      { exact: 'true', path: '/sellingType', element: lazy(() => import('./views/productManagement/products/sellingType')) },
      { exact: 'true', path: '/stock', element: lazy(() => import('./views/productManagement/products/stock')) },
      { exact: 'true', path: '/categoryList', element: lazy(() => import('./views/productManagement/productCategories/categoryList')) },
      { exact: 'true', path: '/newCategoryList', element: lazy(() => import('./views/productManagement/productCategories/newCategoryList')) },
      { exact: 'true', path: '/purchaseBills', element: lazy(() => import('./views/purchases/purchaseBills')) },
      { exact: 'true', path: '/completePurchase', element: lazy(() => import('./views/purchases/completePurchase')) },
      { exact: 'true', path: '/returnPurchase', element: lazy(() => import('./views/purchases/returnPurchase')) },
      { exact: 'true', path: '/pendingTransactions', element: lazy(() => import('./views/supplier/pendingTransactions')) },
      { exact: 'true', path: '/supplierList', element: lazy(() => import('./views/supplier/supplierList')) },
      { exact: 'true', path: '/newSupplierList', element: lazy(() => import('./views/supplier/newSupplierList')) },
      { exact: 'true', path: '/storeList', element: lazy(() => import('./views/setup/stores/storeList')) },
      { exact: 'true', path: '/newStoreList', element: lazy(() => import('./views/setup/stores/newStoreList')) },
      { exact: 'true', path: '/storeTypes', element: lazy(() => import('./views/setup/storeTypes/storeTypes')) },
      { exact: 'true', path: '/newStoreType', element: lazy(() => import('./views/setup/storeTypes/newStoreType')) },
      { exact: 'true', path: '/printers', element: lazy(() => import('./views/configuration/printers')) },
      { exact: 'true', path: '/unitOfMaterial', element: lazy(() => import('./views/configuration/unitOfMaterial')) },
      { exact: 'true', path: '/themes', element: lazy(() => import('./views/configuration/themes')) },
      { exact: 'true', path: '/basic/button', element: lazy(() => import('./views/ui-elements/basic/BasicButton')) },
      { exact: 'true', path: '/basic/badges', element: lazy(() => import('./views/ui-elements/basic/BasicBadges')) },
      { exact: 'true', path: '/basic/breadcrumb', element: lazy(() => import('./views/ui-elements/basic/BasicBreadcrumb')) },
      { exact: 'true', path: '/basic/pagination', element: lazy(() => import('./views/ui-elements/basic/BasicPagination')) },
      { exact: 'true', path: '/basic/collapse', element: lazy(() => import('./views/ui-elements/basic/BasicCollapse')) },
      { exact: 'true', path: '/basic/tabs-pills', element: lazy(() => import('./views/ui-elements/basic/BasicTabsPills')) },
      { exact: 'true', path: '/basic/typography', element: lazy(() => import('./views/ui-elements/basic/BasicTypography')) },
      { exact: 'true', path: '/forms/form-basic', element: lazy(() => import('./views/forms/FormsElements')) },
      { exact: 'true', path: '/tables/bootstrap', element: lazy(() => import('./views/tables/BootstrapTable')) },
      { exact: 'true', path: '/charts/nvd3', element: lazy(() => import('./views/charts/nvd3-chart')) },
      { exact: 'true', path: '/sample-page', element: lazy(() => import('./views/extra/SamplePage')) },
      { exact: 'true', path: '/access', element: lazy(() => import('./views/configuration/Access')) },

    ],
  },
];

export default routes;
