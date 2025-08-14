import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "Pricing - QueueHire",
	description:
		"Transparent pricing, suitable for all people and use-cases",
};

export default function PricingPage() {
	const plans = [
		{
			name: "Free Plan",
			price: 0,
			period: "forever",
			description: "Perfect for getting started with QueueHire",
			features: [
				{ name: "15 minutes of calls daily", included: true },
				{ name: "Basic matching algorithm", included: true },
				{ name: "Save up to 3 contacts", included: true },
				{ name: "Standard support", included: true },
				{ name: "Advanced analytics", included: false },
				{ name: "Unlimited saves", included: false },
				{ name: "Priority matching", included: false },
				{ name: "Custom tags", included: false },
			],
			popular: false,
		},
		{
			name: "Essential Plan",
			price: 15,
			period: "month",
			description: "Great for regular users who need more time",
			features: [
				{ name: "60 minutes of calls daily", included: true },
				{ name: "Enhanced matching algorithm", included: true },
				{ name: "Save up to 15 contacts", included: true },
				{ name: "Priority support", included: true },
				{ name: "Basic analytics", included: true },
				{ name: "Unlimited saves", included: false },
				{ name: "Priority matching", included: false },
				{ name: "Custom tags", included: false },
			],
			popular: false,
		},
		{
			name: "Power Plan",
			price: 29,
			period: "month",
			description: "Most popular choice for active professionals",
			features: [
				{ name: "180 minutes of calls daily", included: true },
				{ name: "Advanced matching algorithm", included: true },
				{ name: "Unlimited contact saves", included: true },
				{ name: "Priority support", included: true },
				{ name: "Advanced analytics", included: true },
				{ name: "Priority matching", included: true },
				{ name: "Custom tags", included: true },
				{ name: "Profile boost", included: true },
			],
			popular: true,
		},
		{
			name: "Pro Plan",
			price: 69,
			period: "month",
			description: "For power users and agencies",
			features: [
				{ name: "Unlimited minutes", included: true },
				{ name: "AI-powered matching", included: true },
				{ name: "Unlimited contact saves", included: true },
				{ name: "Dedicated support", included: true },
				{ name: "Advanced analytics", included: true },
				{ name: "Priority matching", included: true },
				{ name: "Custom tags", included: true },
				{ name: "White-label options", included: true },
			],
			popular: false,
		},
	];

	return (
		<div className={styles.container}>

			{/* Hero Section */}
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>
						Simple, Transparent Pricing
					</h1>
					<p className={styles.heroSubtitle}>
						Choose the plan that fits your needs. No hidden fees, no
						surprises.
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

					<div className={styles.introSection}>
						<h2 className={styles.sectionTitle}>
							Find Your Perfect Plan
						</h2>
						<p className={styles.paragraph}>
							QueueHire offers flexible pricing to match your
							hiring needs. Start free and upgrade as you grow.
						</p>
					</div>

					{/* Pricing Cards */}
					<div className={styles.pricingGrid}>
						{plans.map((plan, index) => (
							<div
								key={index}
								className={`${styles.pricingCard} ${
									plan.popular ? styles.popularCard : ""
								}`}
							>
								{plan.popular && (
									<div className={styles.popularBadge}>
										Most Popular
									</div>
								)}

								<div className={styles.planHeader}>
									<h3 className={styles.planName}>
										{plan.name}
									</h3>
									<div className={styles.planPrice}>
										<span className={styles.currency}>
											$
										</span>
										<span className={styles.amount}>
											{plan.price}
										</span>
										<span className={styles.period}>
											/{plan.period}
										</span>
									</div>
									<p className={styles.planDescription}>
										{plan.description}
									</p>
								</div>

								<div className={styles.featuresContainer}>
									{plan.features.map(
										(feature, featureIndex) => (
											<div
												key={featureIndex}
												className={styles.featureItem}
											>
												<div
													className={`${
														styles.featureIcon
													} ${
														feature.included
															? styles.included
															: styles.notIncluded
													}`}
												>
													{feature.included ? (
														<Check size={16} />
													) : (
														<X size={16} />
													)}
												</div>
												<span
													className={
														styles.featureText
													}
												>
													{feature.name}
												</span>
											</div>
										)
									)}
								</div>

								<div className={styles.planFooter}>
									<div className={styles.upgradeNote}>
										<p>Sign in to upgrade to this plan</p>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className={styles.divider}></div>

					{/* Additional Information */}
					<div className={styles.additionalInfo}>
						<h2 className={styles.sectionTitle}>
							Why Choose QueueHire?
						</h2>

						<div className={styles.benefitsGrid}>
							<div className={styles.benefitItem}>
								<div className={styles.benefitIcon}>🚀</div>
								<h3>No Commission Fees</h3>
								<p>
									{`Unlike other platforms, we don't take a cut
									from your earnings. Keep 100% of what you
									make.`}
								</p>
							</div>

							<div className={styles.benefitItem}>
								<div className={styles.benefitIcon}>⚡</div>
								<h3>Instant Matching</h3>
								<p>
									Get matched with the right opportunities in
									minutes, not days or weeks.
								</p>
							</div>

							<div className={styles.benefitItem}>
								<div className={styles.benefitIcon}>🎯</div>
								<h3>Quality Over Quantity</h3>
								<p>
									Our algorithm ensures you only see relevant
									matches that fit your skills and
									requirements.
								</p>
							</div>

							<div className={styles.benefitItem}>
								<div className={styles.benefitIcon}>💬</div>
								<h3>Direct Communication</h3>
								<p>
									Skip the middleman and communicate directly
									with matched candidates or employers.
								</p>
							</div>
						</div>
					</div>

					<div className={styles.divider}></div>

					<div className={styles.faqSection}>
						<h2 className={styles.sectionTitle}>
							Frequently Asked Questions
						</h2>

						<div className={styles.faqGrid}>
							<div className={styles.faqItem}>
								<h3>Can I change plans anytime?</h3>
								<p>
									Yes! You can upgrade or downgrade your plan
									at any time from your dashboard. Changes
									take effect immediately.
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>Is there a free trial?</h3>
								<p>
									Our Free Plan gives you access to core
									features forever. You can upgrade when you
									need more minutes or advanced features.
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>What payment methods do you accept?</h3>
								<p>
									We accept all major credit cards, PayPal,
									and bank transfers. All payments are
									processed securely.
								</p>
							</div>

							<div className={styles.faqItem}>
								<h3>Can I cancel anytime?</h3>
								<p>
									You can cancel your subscription at any time
									with no cancellation fees. Your access
									continues until the end of your billing
									period.
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
						<p className={styles.ctaNote}>
							Already have an account?{" "}
							<Link href="/dashboard">Sign in to upgrade</Link>
						</p>
					</div>
				</div>
			</section>

		</div>
	);
}
