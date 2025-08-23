import React from 'react';

/**
 * About page component with podcast information
 */
const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Weird Tales</h1>
        <p className="page-subtitle">
          Diving deep into the mysteries that keep us up at night
        </p>
      </div>

      <section className="about-content">
        <div className="about-text">
          <h2>Our Mission</h2>
          <p>
            Welcome to Weird Tales, where we explore the strange, mysterious,
            and unexplained corners of our world. From ancient conspiracies to
            modern UFO sightings, from cryptid encounters to paranormal
            investigations, we leave no stone unturned in our quest for the
            truth.
          </p>

          <h2>What We Cover</h2>
          <div className="topics-grid">
            <div className="topic-card">
              <h3>🛸 UFOs & Aliens</h3>
              <p>
                Exploring extraterrestrial encounters and government cover-ups
              </p>
            </div>
            <div className="topic-card">
              <h3>🦄 Cryptozoology</h3>
              <p>Investigating legendary creatures and mysterious beasts</p>
            </div>
            <div className="topic-card">
              <h3>👻 Paranormal</h3>
              <p>Delving into ghost stories and supernatural phenomena</p>
            </div>
            <div className="topic-card">
              <h3>🕵️ Conspiracies</h3>
              <p>Uncovering hidden truths and secret societies</p>
            </div>
          </div>

          <h2>Meet the Hosts</h2>
          <div className="hosts-section">
            <div className="host-profile">
              <h3>Alex Johnson</h3>
              <p>
                A former investigative journalist with a passion for the
                unexplained. Alex brings a skeptical yet open-minded approach to
                every story.
              </p>
            </div>
            <div className="host-profile">
              <h3>Sam Rivera</h3>
              <p>
                A researcher and folklore enthusiast who's been studying
                mysterious phenomena for over a decade. Sam adds historical
                context and cultural insights to our investigations.
              </p>
            </div>
          </div>

          <h2>Join Our Community</h2>
          <p>
            Have a weird tale of your own? We'd love to hear from you! Send us
            your stories, tips, and suggestions. Who knows? Your experience
            might be featured in our next episode.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
