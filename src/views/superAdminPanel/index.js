import React  from 'react';
import './index.scss';

// import TopPanel from '../../components/panels/TopPanel';
import PanelCompany from '../../components/panels/PanelCompany';

const SuperAdminPanel = () => {
  
  return (
    <React.Fragment>
        {/* <TopPanel /> */}
        <PanelCompany />   
    </React.Fragment>
  );
};

export default SuperAdminPanel;
