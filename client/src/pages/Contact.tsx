import React, { useState } from 'react';

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      // simulate api call
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TODO: sanitize inputs - form is not functional until then
  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p className="page-subtitle">
          Have a weird tale to share? Questions? Suggestions? We'd love to hear
          from you!
        </p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email</h3>
              <p>
                <a href="mailto:itgetsweirdpodcast@gmail.com">
                  itgetsweirdpodcast@gmail.com
                </a>
              </p>
            </div>

            <div className="contact-method">
              <h3>Social Media</h3>
              <p>
                Find us on Twitter @IGWPodcast and Bluesky
                @itgetsweird.bsky.social
              </p>
            </div>
          </div>

          <div className="story-guidelines">
            <h3>Sharing Your Story?</h3>
            <ul>
              <li>Include as many details as possible</li>
              <li>Let us know if you'd like to remain anonymous</li>
              <li>Feel free to include photos or evidence</li>
              <li>Tell us if we can feature your story on the show</li>
            </ul>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <h2>Send Us a Message</h2>

          {submitStatus === 'success' && (
            <div className="form-message success" role="alert">
              Thanks for your message! We'll get back to you soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="form-message error" role="alert">
              Something went wrong. Please try again or email us directly.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              aria-required="true"
            >
              <option value="">Select a topic</option>
              <option value="story">I have a weird tale to share</option>
              <option value="question">General question</option>
              <option value="feedback">Podcast feedback</option>
              <option value="collaboration">Collaboration inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              required
              aria-required="true"
              placeholder="Tell us your story, ask your question, or share your thoughts..."
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
