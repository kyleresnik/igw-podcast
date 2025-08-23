import React from 'react';

// Blog page component (placeholder for future blog functionality)
const Blog: React.FC = () => {
  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>The Weird Tales Blog</h1>
        <p className="page-subtitle">
          Deep dives, behind-the-scenes content, and extra investigations
        </p>
      </div>

      <div className="blog-content">
        <div className="coming-soon">
          <h2>Coming Soon!</h2>
          <p>
            We're working on bringing you exclusive written content, extended
            research notes, and behind-the-scenes stories from our
            investigations.
          </p>
          <p>
            In the meantime, make sure you're subscribed to the podcast and
            following us on social media for the latest updates.
          </p>
        </div>

        <div className="newsletter-signup">
          <h3>Get Notified</h3>
          <p>
            Be the first to know when we launch our blog and get exclusive
            content delivered to your inbox.
          </p>
          <form className="newsletter-form" aria-label="Newsletter signup">
            <div className="form-group">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                aria-required="true"
              />
              <button type="submit" className="submit-button">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog;
