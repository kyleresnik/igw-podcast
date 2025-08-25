import React from 'react';

// Blog page component (placeholder for future blog functionality)
const Blog: React.FC = () => {
  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>It Gets Weird the Podcast the Blog</h1>
        <p className="page-subtitle">
          Deep dives, behind-the-scenes content, and extra stuff
        </p>
      </div>

      <div className="blog-content">
        <div className="coming-soon">
          <h2>Coming Soon!</h2>
          <p>
            We're working on setting up a blog for extra stuff! Check back soon.
          </p>
          <p>
            In the meantime, make sure you're subscribed to the podcast and
            following us on social media for the latest updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
