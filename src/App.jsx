import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Lawin from './projects/Lawin';
import Lodibet from './projects/Lodibet';
import Integrate from './projects/Integrate';
import Naseebet from './projects/Naseebet';
import ProgressDraw from './projects/ProgressDraw';
import BettingRankLodibet from './projects/BettingRankLodibet';
import BettingRankHawk from './projects/BettingRankHawk';

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
