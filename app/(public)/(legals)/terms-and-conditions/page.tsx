/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../legal.module.css";

export const metadata = {
	title: "Terms and Conditions - QueueHire",
	description: "The terms and conditions of QueueHire",
};

export default function TermsAndConditionsPage() {
	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>Terms & Conditions</h1>
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
						<h2>Agreement to Terms</h2>
						<p>
							By accessing and using QueueHire, you accept and
							agree to be bound by the terms and provision of this
							agreement. If you do not agree to abide by the
							above, please do not use this service.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Description of Service</h2>
						<p>
							QueueHire is a platform that connects job seekers
							with recruiters through instant matching technology.
							Our service facilitates direct communication and
							interviews between matched parties.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>User Accounts</h2>
						<h3>Registration</h3>
						<p>To use our services, you must:</p>
						<ul>
							<li>Be at least 18 years old</li>
							<li>Provide accurate and complete information</li>
							<li>Maintain the security of your account</li>
							<li>
								Accept responsibility for all activities under
								your account
							</li>
						</ul>

						<h3>Account Termination</h3>
						<p>
							We reserve the right to terminate accounts that
							violate these terms or engage in prohibited
							activities.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Acceptable Use</h2>
						<p>You agree not to:</p>
						<ul>
							<li>Use the service for any unlawful purpose</li>
							<li>Harass, abuse, or harm other users</li>
							<li>
								Post false, misleading, or fraudulent
								information
							</li>
							<li>
								Attempt to gain unauthorized access to our
								systems
							</li>
							<li>Use automated systems to access the service</li>
							<li>
								Interfere with the proper functioning of the
								service
							</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Fees and Payment</h2>
						<p>
							QueueHire operates on a freemium model. Basic
							services are free, while premium features require a
							subscription. All fees are non-refundable unless
							otherwise stated.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Intellectual Property</h2>
						<p>
							The service and its original content, features, and
							functionality are owned by QueueHire and are
							protected by international copyright, trademark,
							patent, trade secret, and other intellectual
							property laws.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>User Content</h2>
						<p>
							You retain ownership of content you submit to our
							service. By submitting content, you grant us a
							non-exclusive, worldwide, royalty-free license to
							use, modify, and display your content in connection
							with our services.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Privacy</h2>
						<p>
							Your privacy is important to us. Please review our
							Privacy Policy, which also governs your use of the
							service, to understand our practices.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Disclaimers</h2>
						<p>
							The service is provided "as is" without warranties
							of any kind. We do not guarantee that the service
							will be uninterrupted, secure, or error-free. We are
							not responsible for the conduct of users or the
							outcome of any interactions facilitated through our
							platform.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Limitation of Liability</h2>
						<p>
							In no event shall QueueHire be liable for any
							indirect, incidental, special, consequential, or
							punitive damages, including without limitation, loss
							of profits, data, use, goodwill, or other intangible
							losses.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Changes to Terms</h2>
						<p>
							We reserve the right to modify these terms at any
							time. We will notify users of any changes by posting
							the new terms on this page. Your continued use of
							the service after such modifications constitutes
							acceptance of the updated terms.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Contact Information</h2>
						<p>
							If you have any questions about these Terms &
							Conditions, please contact us at:
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
