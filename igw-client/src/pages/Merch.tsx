import React from 'react';

// TODO: merchandise page component - may use 3rd party

const Merch: React.FC = () => {
  const merchItems = [
    {
      id: 1,
      name: 'Weird Tales Logo T-Shirt',
      price: '$24.99',
      image: '/images/tshirt-logo.jpg',
      description: 'Classic black tee with our mysterious logo',
    },
    {
      id: 2,
      name: 'I Want to Believe Mug',
      price: '$16.99',
      image: '/images/mug-believe.jpg',
      description:
        'Perfect for your morning coffee while pondering the unknown',
    },
    {
      id: 3,
      name: 'Cryptid Hunter Hoodie',
      price: '$42.99',
      image: '/images/hoodie-cryptid.jpg',
      description: 'Stay warm during those late-night creature hunts',
    },
  ];

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
            We're working on launching our official merchandise store. Sign up
            below to be notified when it goes live and get exclusive early
            access to our designs.
          </p>
        </div>

        <div className="preview-items">
          <h3>Sneak Peek at What's Coming</h3>
          <div className="merch-grid">
            {merchItems.map((item) => (
              <div key={item.id} className="merch-item">
                <div className="item-image-placeholder">
                  <span>📷 Image Coming Soon</span>
                </div>
                <h4>{item.name}</h4>
                <p className="item-price">{item.price}</p>
                <p className="item-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="merch-signup">
          <h3>Get Early Access</h3>
          <p>
            Be the first to shop our merchandise and get exclusive designs not
            available anywhere else.
          </p>
          <form
            className="signup-form"
            aria-label="Merch store notification signup"
          >
            <div className="form-group">
              <label htmlFor="merch-email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="merch-email"
                name="email"
                placeholder="Enter your email for merch updates"
                required
                aria-required="true"
              />
              <button type="submit" className="submit-button">
                Notify Me
              </button>
            </div>
          </form>
        </div>

        <div className="custom-requests">
          <h3>Have Ideas?</h3>
          <p>
            Got an idea for a design or product you'd love to see?
            <a href="/contact"> Contact us</a> and let us know what weird
            merchandise you'd like to represent!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Merch;
