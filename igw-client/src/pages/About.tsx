import React from 'react';

// about page component with podcast info
const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About It Gets Weird</h1>
        <p className="page-subtitle">
          Diving deep into the mysteries that keep us up at night
        </p>
      </div>

      <section className="about-content">
        <div className="about-text">
          <h2>Our Mission</h2>
          <p>
            Welcome to It Gets Weird, where we explore the strange, mysterious,
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
            <div className="topic-card">
              <h3>🔍 Cults & Religious Movements</h3>
              <p>Examining unusual religious groups and their beliefs</p>
            </div>
            <div className="topic-card">
              <h3>🌟 New Age Phenomena</h3>
              <p>Investigating modern spiritual and metaphysical claims</p>
            </div>
          </div>

          <h2>Meet the Hosts</h2>
          <div className="hosts-section">
            <div className="host-profile">
              <h3>Nile</h3>
              <p>
                One half of the dynamic duo bringing you the weirdest tales from
                around the world. Nile brings a keen eye for detail and a
                passion for getting to the bottom of every mystery, no matter
                how strange it might seem.
              </p>
            </div>
            <div className="host-profile">
              <h3>Kyle</h3>
              <p>
                The other half of our investigating team, Kyle adds his own
                unique perspective to every story. Together with Nile, he
                explores the unexplained with both skepticism and wonder, always
                ready for whatever weirdness comes their way.
              </p>
            </div>
          </div>

          <h2>Join Our Community</h2>
          <p>
            Have a weird tale of your own? We'd love to hear from you! Send us
            your stories, tips, and suggestions at{' '}
            <a href="mailto:itgetsweirdpodcast@gmail.com">
              itgetsweirdpodcast@gmail.com
            </a>
            . Who knows? Your experience might be featured in our next episode.
          </p>

          <h2>Every Sunday</h2>
          <p>
            New episodes drop every Sunday, featuring deep dives into the
            curious, the unexplained, and the outright weird. Whether you're a
            longtime believer or a healthy skeptic, there's something here for
            everyone who's ever wondered about the mysteries that surround us.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
