import Link from "next/link";
import { ArrowLeft, Mail, Phone, Clock, Send } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "Contact QueueHire",
	description:
		"Get in touch with the team and get a response within just 48 hours!",
};

export default function ContactPage() {
	return (
		<div className={styles.container}>
			{/* Hero Section */}
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>Get in Touch</h1>
					<p className={styles.heroSubtitle}>
						{`Have questions? We'd love to hear from you. Send us a
						message and we'll respond as soon as possible.`}
					</p>
				</div>
			</section>

			{/* Main Content */}
			<section className={styles.mainContent}>
				<div className={styles.contentContainer}>
					<Link href="/" className={styles.backLink}>
						<ArrowLeft size={20} />
						<span>Return to Home</span>
					</Link>

					<div className={styles.contactGrid}>
						{/* Contact Information */}
						<div className={styles.contactInfo}>
							<h2 className={styles.sectionTitle}>
								Contact Information
							</h2>
							<p className={styles.paragraph}>
								{`We're here to help and answer any question you
								might have. We look forward to hearing from you.`}
							</p>

							<div className={styles.contactMethods}>
								<div className={styles.contactMethod}>
									<div className={styles.contactIcon}>
										<Mail size={24} />
									</div>
									<div className={styles.contactDetails}>
										<h3>Email Us</h3>
										<p>ziad@queuehire.com</p>
										<span>
											{`We'll respond within 48 hours`}
										</span>
									</div>
								</div>

								<div className={styles.contactMethod}>
									<div className={styles.contactIcon}>
										<Phone size={24} />
									</div>
									<div className={styles.contactDetails}>
										<h3>Call Us</h3>
										<p>+20 109 823 3607</p>
										<span>Mon-Fri from 8am to 5pm</span>
									</div>
								</div>

								<div className={styles.contactMethod}>
									<div className={styles.contactIcon}>
										<Clock size={24} />
									</div>
									<div className={styles.contactDetails}>
										<h3>Business Hours</h3>
										<p>
											Monday - Friday: 8am - 6pm PST
											<br />
											Saturday: 9am - 4pm PST
										</p>
										<span>Closed on Sundays</span>
									</div>
								</div>
							</div>
						</div>

						{/* Contact Form */}
						<div className={styles.contactForm}>
							<h2 className={styles.sectionTitle}>
								Send us a Message
							</h2>
							<form className={styles.form}>
								<div className={styles.formRow}>
									<div className={styles.formGroup}>
										<label htmlFor="firstName">
											First Name
										</label>
										<input
											type="text"
											id="firstName"
											name="firstName"
											required
										/>
									</div>
									<div className={styles.formGroup}>
										<label htmlFor="lastName">
											Last Name
										</label>
										<input
											type="text"
											id="lastName"
											name="lastName"
											required
										/>
									</div>
								</div>

								<div className={styles.formGroup}>
									<label htmlFor="email">Email Address</label>
									<input
										type="email"
										id="email"
										name="email"
										required
									/>
								</div>

								<div className={styles.formGroup}>
									<label htmlFor="subject">Subject</label>
									<select
										id="subject"
										name="subject"
										required
									>
										<option value="">
											Select a subject
										</option>
										<option value="general">
											General Inquiry
										</option>
										<option value="support">
											Technical Support
										</option>
										<option value="billing">
											Billing Question
										</option>
										<option value="partnership">
											Partnership
										</option>
										<option value="feedback">
											Feedback
										</option>
									</select>
								</div>

								<div className={styles.formGroup}>
									<label htmlFor="message">Message</label>
									<textarea
										id="message"
										name="message"
										rows={6}
										required
										placeholder="Tell us how we can help you..."
									></textarea>
								</div>

								<button
									type="submit"
									className={styles.submitButton}
								>
									<Send size={20} />
									<span>Send Message</span>
								</button>
							</form>
						</div>
					</div>

					<div className={styles.divider}></div>

					{/* FAQ Section */}
					<div className={styles.contentSection}>
						<h2 className={styles.sectionTitle}>
							Frequently Asked Questions
						</h2>
						<div className={styles.faqGrid}>
							<div className={styles.faqItem}>
								<h3>
									How quickly do you respond to inquiries?
								</h3>
								<p>
									We typically respond to all inquiries within
									24 hours during business days. For urgent
									matters, please call us directly.
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>Do you offer phone support?</h3>
								<p>
									Yes! We offer phone support during business
									hours (Monday-Friday, 8am-6pm PST). You can
									reach us at +20 109 823 3607.
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>Can I schedule a demo?</h3>
								<p>
									{`Contact us to schedule a personalized demo
									of QueueHire. We'll show you how our
									platform can benefit your hiring process.`}
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>Do you offer enterprise solutions?</h3>
								<p>
									Yes, we offer custom enterprise solutions
									for larger organizations. Contact us to
									discuss your specific needs and
									requirements.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className={styles.ctaSection}>
				<div className={styles.ctaContainer}>
					<div className={styles.ctaContent}>
						<h2 className={styles.ctaTitle}>
							Ready to Get Started?
						</h2>
						<p className={styles.ctaSubtitle}>
							{`Join thousands of professionals who've found their
							perfect match on QueueHire.`}
						</p>
						<Link href="/register">
							<button className={styles.ctaButton}>
								Start Free Today
							</button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
