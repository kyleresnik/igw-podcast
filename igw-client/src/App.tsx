import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Archive from './pages/Archive';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Merch from './pages/Merch';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/merch" element={<Merch />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
