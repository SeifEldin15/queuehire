/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../legal.module.css";

export const metadata = {
	title: "Privacy Policy - QueueHire",
	description: "The privacy policy page of QueueHire",
};

export default function PrivacyPolicyPage() {
	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>Privacy Policy</h1>
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
						<h2>Introduction</h2>
						<p>
							At QueueHire, we take your privacy seriously. This
							Privacy Policy explains how we collect, use,
							disclose, and safeguard your information when you
							visit our website and use our services.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Information We Collect</h2>
						<h3>Personal Information</h3>
						<p>
							We may collect personal information that you
							voluntarily provide to us when you:
						</p>
						<ul>
							<li>Register for an account</li>
							<li>Create a profile</li>
							<li>Use our matching services</li>
							<li>Contact us for support</li>
							<li>Subscribe to our newsletter</li>
						</ul>

						<h3>Automatically Collected Information</h3>
						<p>
							We may automatically collect certain information
							about your device, including:
						</p>
						<ul>
							<li>IP address and location data</li>
							<li>Browser type and version</li>
							<li>Operating system</li>
							<li>Usage patterns and preferences</li>
							<li>Cookies and similar tracking technologies</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>How We Use Your Information</h2>
						<p>We use the information we collect to:</p>
						<ul>
							<li>Provide and maintain our services</li>
							<li>
								Match you with relevant opportunities or
								candidates
							</li>
							<li>
								Process transactions and send related
								information
							</li>
							<li>Send administrative information and updates</li>
							<li>Respond to your comments and questions</li>
							<li>Improve our services and user experience</li>
							<li>Comply with legal obligations</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Information Sharing and Disclosure</h2>
						<p>
							We may share your information in the following
							situations:
						</p>
						<ul>
							<li>
								<strong>With Other Users:</strong> Profile
								information may be visible to matched users
							</li>
							<li>
								<strong>Service Providers:</strong> Third-party
								companies that help us operate our services
							</li>
							<li>
								<strong>Legal Requirements:</strong> When
								required by law or to protect our rights
							</li>
							<li>
								<strong>Business Transfers:</strong> In
								connection with mergers, acquisitions, or asset
								sales
							</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Data Security</h2>
						<p>
							We implement appropriate technical and
							organizational security measures to protect your
							personal information against unauthorized access,
							alteration, disclosure, or destruction. However, no
							method of transmission over the internet is 100%
							secure.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Your Rights</h2>
						<p>
							Depending on your location, you may have the
							following rights:
						</p>
						<ul>
							<li>Access to your personal information</li>
							<li>Correction of inaccurate information</li>
							<li>Deletion of your personal information</li>
							<li>Restriction of processing</li>
							<li>Data portability</li>
							<li>Objection to processing</li>
						</ul>
					</div>

					<div className={styles.contentSection}>
						<h2>Cookies and Tracking</h2>
						<p>
							We use cookies and similar tracking technologies to
							enhance your experience on our platform. You can
							control cookie settings through your browser
							preferences.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Changes to This Policy</h2>
						<p>
							We may update this Privacy Policy from time to time.
							We will notify you of any changes by posting the new
							Privacy Policy on this page and updating the "Last
							updated" date.
						</p>
					</div>

					<div className={styles.contentSection}>
						<h2>Contact Us</h2>
						<p>
							If you have any questions about this Privacy Policy,
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
