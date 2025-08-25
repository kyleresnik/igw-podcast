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
          <h2>About It Gets Weird</h2>
          <p>
            Welcome to It Gets Weird, our comedy show where we explore the
            unusual, the unbelievable, and the unexplained to try and make your
            world a little weirder. We're Nile and Kyle and we've been
            discussing the world of weird for almost a decade. We both get
            stoked about this strange stories, most of which are - let's be
            honest - also pretty funny. And so we started a podcast about it.
          </p>

          <h2>What We Cover</h2>
          <div className="topics-grid">
            <div className="topic-card">
              <h3>🛸 UFOs & Aliens</h3>
              <p>
                Extraterrestrial encounters, alien mythologies, and government
                cover-ups
              </p>
            </div>
            <div className="topic-card">
              <h3>🦄 Cryptozoology</h3>
              <p>Legendary creatures, unidentified beasts, and weird biology</p>
            </div>
            <div className="topic-card">
              <h3>👻 Paranormal</h3>
              <p>
                Supernatural phenomena, haunted locations, and psychic abilities
              </p>
            </div>
            <div className="topic-card">
              <h3>🕵️ Conspiracies</h3>
              <p>Parapolitics, cover-ups, espionage, and secret societies</p>
            </div>
            <div className="topic-card">
              <h3>🔍 Cults & Religious Movements</h3>
              <p>Unusual religious groups, cults, and strange spirituality</p>
            </div>
            <div className="topic-card">
              <h3>🌟 New Age Phenomena</h3>
              <p>Modern spiritual and metaphysical beliefs</p>
            </div>
          </div>

          <h2>Meet the Hosts</h2>
          <div className="hosts-section">
            <div className="host-profile">
              <h3>Nile</h3>
              <p>
                Co-host Nile hails from the same Indiana town as Kyle. A
                consummate professional who also loves wrestling, comics,
                movies, music, and Godzilla in general. Especially interested in
                topics like Deep Underground Military Bases (DUMBs),
                supersoldiers, and the paranormal.
              </p>
            </div>
            <div className="host-profile">
              <h3>Kyle</h3>
              <p>
                Co-host Kyle also grew up in small-town Indiana, one of those
                places where the weird festers just below the surface. A big fan
                of anime, manga, games, coding, and movies. Especially
                interested in topics like parapolitics, ufology, and high
                strangeness.
              </p>
            </div>
          </div>

          <h2>Join Our Community</h2>
          <p>
            Have a weird story of your own? We'd love to hear from you! Send us
            your stories, tips, and suggestions at{' '}
            <a href="mailto:itgetsweirdpodcast@gmail.com">
              itgetsweirdpodcast@gmail.com
            </a>
            . Who knows? Your experience might be featured in our next episode!
            We also highly suggest clicking the Patreon link at the top of our
            page. Joining Patreon not only gets you a huge back catalog of bonus
            content, but also gets you into the exclusive It Gets Weird Discord
            server.
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
