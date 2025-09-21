import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import SessionMonitor from "./SessionMonitor";
import routes, { renderRoutes } from "./routes";

const App = () => {
  return (
    <Router>
      <SessionMonitor>
        {renderRoutes(routes)}
      </SessionMonitor>
    </Router>
  );
};

export default App;
