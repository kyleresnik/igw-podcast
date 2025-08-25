import React from 'react';

// TODO: merchandise page component - may use 3rd party

const Merch: React.FC = () => {
  return (
    <div className="merch-page">
      <div className="page-header">
        <h1>Weird Tales Merch</h1>
        <p className="page-subtitle">
          Wear your love for the mysterious and unexplained
        </p>
      </div>

      <div className="merch-content">
        <div className="coming-soon-notice">
          <h2>Store Coming Soon!</h2>
          <p>
            We're working on launching our official merchandise store. Be sure
            to check back soon!
          </p>
        </div>

        <div className="custom-requests">
          <h3>Have Ideas?</h3>
          <p>
            Got an idea for a design or product you'd love to see?
            <a href="/contact"> Contact us</a> and let us know what kind of It
            Gets Weird merch you'd like to see!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Merch;
