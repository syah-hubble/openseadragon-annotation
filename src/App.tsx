import React, { Suspense } from 'react';
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { Image, PDF } from './pages';

const App = () => (
  <BrowserRouter>
    <nav>
      <NavLink to="/image">Image</NavLink>

      <NavLink to="/pdf">PDF</NavLink>
    </nav>
    <Suspense fallback={null}>
      <Routes>
        <Route path="image" element={<Image />} />
        <Route path="pdf" element={<PDF />} />
        <Route path="*" element={<Navigate to="/image" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
