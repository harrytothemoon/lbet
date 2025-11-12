import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import BettingRankLodibet from './projects/BettingRankLodibet';

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/betting-rank-lodibet" element={<BettingRankLodibet />} />
        <Route path="*" element={<Navigate to="/betting-rank-lodibet" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
