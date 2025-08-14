
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../legal.module.css";

export const metadata = {
	title: "Cookie Policy - QueueHire",
	description: "The cookie policy of QueueHire",
};

export default function CookiePolicyPage() {
	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>Cookie Policy</h1>
				</div>
			</section>

			<section className={styles.mainContent}>
				<div className={styles.contentContainer}>
					<Link href="/" className={styles.backLink}>
						<ArrowLeft size={20} />
						<span>Return to Home</span>
					</Link>

					<div className={styles.lastUpdated}>
						<p>Last updated: January 1, 2025</p>
					</div>

					<div className={styles.contentSection}>
						<h2>What Are Cookies?</h2>
						<p>
							Cookies are small text files that are stored on your
							computer or mobile device when you visit a website.
							They help websites remember information about your
							visit, which can make your next visit easier and the
							site more useful to you.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>How We Use Cookies</h2>
						<p>QueueHire uses cookies to:</p>
						<ul>
							<li>Keep you signed in to your account</li>
							<li>Remember your preferences and settings</li>
							<li>Analyze how you use our website</li>
							<li>Improve our services and user experience</li>
							<li>
								Provide personalized content and recommendations
							</li>
							<li>Ensure the security of our platform</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Types of Cookies We Use</h2>

						<h3>Essential Cookies</h3>
						<p>
							These cookies are necessary for the website to
							function properly. They enable core functionality
							such as security, network management, and
							accessibility. You cannot opt-out of these cookies.
						</p>

						<h3>Performance Cookies</h3>
						<p>
							These cookies collect information about how visitors
							use our website, such as which pages are visited
							most often. This data helps us improve how our
							website works.
						</p>

						<h3>Functionality Cookies</h3>
						<p>
							These cookies allow our website to remember choices
							you make and provide enhanced, more personal
							features. They may be set by us or by third-party
							providers.
						</p>

						<h3>Targeting Cookies</h3>
						<p>
							These cookies are used to deliver advertisements
							more relevant to you and your interests. They
							remember that you have visited our website and may
							be combined with other information about you.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Third-Party Cookies</h2>
						<p>
							We may use third-party services that set cookies on
							your device. These include:
						</p>
						<ul>
							<li>
								<strong>Analytics Services:</strong> To
								understand how users interact with our website
							</li>
							<li>
								<strong>Social Media:</strong> To enable social
								media features and functionality
							</li>
							<li>
								<strong>Advertising:</strong> To show relevant
								advertisements
							</li>
							<li>
								<strong>Customer Support:</strong> To provide
								chat and support services
							</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Managing Cookies</h2>
						<p>
							You can control and manage cookies in various ways.
							Please note that removing or blocking cookies can
							impact your user experience and parts of our website
							may no longer be fully accessible.
						</p>

						<h3>Browser Settings</h3>
						<p>
							Most web browsers allow you to control cookies
							through their settings preferences. You can set your
							browser to refuse cookies or delete certain cookies.
						</p>

						<h3>Opt-Out Tools</h3>
						<p>
							You can opt-out of certain third-party cookies by
							visiting the respective opt-out pages of those
							services.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Cookie Consent</h2>
						<p>
							By continuing to use our website, you consent to our
							use of cookies as described in this policy. You can
							withdraw your consent at any time by adjusting your
							browser settings or contacting us.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Updates to This Policy</h2>
						<p>
							We may update this Cookie Policy from time to time
							to reflect changes in our practices or for other
							operational, legal, or regulatory reasons. Please
							check this page periodically for updates.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Contact Us</h2>
						<p>
							If you have any questions about our use of cookies,
							please contact us at:
						</p>
						<ul>
							<li>Email: ziad@queuehire.com</li>
							<li>Number: +20 109 823 3607</li>
						</ul>
					</div>
				</div>
			</section>

			<section className={styles.ctaSection}>
				<div className={styles.ctaContainer}>
					<div className={styles.ctaContent}>
						<h2 className={styles.ctaTitle}>
							Ready to Get Started?
						</h2>
						<p className={styles.ctaSubtitle}>
							Join QueueHire today and experience the future of
							hiring.
						</p>
						<Link href="/register">
							<button className={styles.ctaButton}>
								Start Now
							</button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
