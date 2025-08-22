import { Check } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "QueueHire - Upgrade",
	description:
		"Find a job in seconds. Recruit the right person today. All in one platform",
};

export default function UpgradePage() {
	const plans = [
		{
			name: "Essential Plan",
			price: 15,
			features: [
				{ name: "60 minutes of calls daily", included: true },
				{ name: "Second insane perk", included: false },
				{ name: "Third crazy perk", included: false },
				{ name: "Fourth fantastic perk", included: false },
				{ name: "Fifth amazing perk", included: false },
			],
			buttonText: "Choose Plan",
			buttonStyle: "secondary",
		},
		{
			name: "Power Plan",
			price: 29,
			features: [
				{ name: "180 minutes of calls daily", included: true },
				{ name: "Second insane perk", included: true },
				{ name: "Third crazy perk", included: true },
				{ name: "Fourth fantastic perk", included: true },
				{ name: "Fifth amazing perk", included: true },
			],
			buttonText: "Choose Plan",
			buttonStyle: "primary",
			recommended: true,
		},
		{
			name: "Pro Plan",
			price: 69,
			features: [
				{ name: "Unlimited minutes", included: true },
				{ name: "Second insane perk", included: false },
				{ name: "Third crazy perk", included: false },
				{ name: "Fourth fantastic perk", included: false },
				{ name: "Fifth amazing perk", included: false },
			],
			buttonText: "Choose Plan",
			buttonStyle: "secondary",
		},
	];

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.pageTitle}>Upgrade Your Plan</h1>
				<p className={styles.pageSubtitle}>
					Looking to take your recruitment and job seeking to the next
					level?
				</p>
			</div>

			<div className={styles.plansGrid}>
				{plans.map((plan, index) => (
					<div
						key={index}
						className={`${styles.planCard} ${
							plan.recommended ? styles.recommended : ""
						}`}
					>
						{plan.recommended && (
							<div className={styles.recommendedBadge}>
								Most Popular
							</div>
						)}

						<div className={styles.planHeader}>
							<h3 className={styles.planName}>{plan.name}</h3>
							<div className={styles.planPrice}>
								<span className={styles.currency}>$</span>
								<span className={styles.amount}>
									{plan.price}
								</span>
								<span className={styles.period}>/mon</span>
							</div>
						</div>

						<div className={styles.featuresContainer}>
							{plan.features.map((feature, featureIndex) => (
								<div
									key={featureIndex}
									className={styles.featureItem}
								>
									<div
										className={`${styles.featureIcon} ${
											feature.included
												? styles.included
												: styles.notIncluded
										}`}
									>
										{feature.included ? (
											<Check size={16} />
										) : (
											<span>○</span>
										)}
									</div>
									<span className={styles.featureText}>
										{feature.name}
									</span>
								</div>
							))}
						</div>

						<button
							className={`${styles.planButton} ${
								plan.buttonStyle === "primary"
									? styles.primaryButton
									: styles.secondaryButton
							}`}
						>
							{plan.buttonText}
						</button>
					</div>
				))}
			</div>

			<div className={styles.currentPlanInfo}>
				<div className={styles.currentPlan}>
					<span className={styles.label}>Current Plan:</span>
					<span className={styles.value}>Free</span>
				</div>
				<div className={styles.renewalDate}>
					<span className={styles.label}>Date of Renewal:</span>
					<span className={styles.value}>31st June 2025</span>
				</div>
			</div>

			{/* Additional Benefits Section */}
			<div className={styles.benefitsSection}>
				<h2 className={styles.benefitsTitle}>
					Why upgrade with QueueHire?
				</h2>
				<div className={styles.benefitsList}>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>🚀</div>
						<div>
							<h3>Lightning Fast Matching</h3>
							<p>
								Get matched with the perfect candidates or jobs
								in record time with our advanced AI algorithm
							</p>
							<ul className={styles.benefitFeatures}>
								<li>AI-powered matching in under 30 seconds</li>
								<li>Smart skill compatibility analysis</li>
								<li>Real-time availability matching</li>
							</ul>
						</div>
					</div>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>💼</div>
						<div>
							<h3>Priority Support & Success Manager</h3>
							<p>
								Get dedicated support and a personal success
								manager to help you achieve your goals
							</p>
							<ul className={styles.benefitFeatures}>
								<li>24/7 priority customer support</li>
								<li>Personal success manager</li>
								<li>Weekly strategy consultations</li>
							</ul>
						</div>
					</div>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>📈</div>
						<div>
							<h3>Advanced Analytics & Insights</h3>
							<p>
								Track your success rate and optimize your
								approach with detailed analytics
							</p>
							<ul className={styles.benefitFeatures}>
								<li>Detailed performance metrics</li>
								<li>Success rate tracking</li>
								<li>Market trend insights</li>
							</ul>
						</div>
					</div>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>🎯</div>
						<div>
							<h3>Smart Targeting & Filters</h3>
							<p>
								{`Advanced filtering options to find exactly what
								you're looking for`}
							</p>
							<ul className={styles.benefitFeatures}>
								<li>Location-based filtering</li>
								<li>Salary range targeting</li>
								<li>Company size preferences</li>
							</ul>
						</div>
					</div>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>🔒</div>
						<div>
							<h3>Enhanced Privacy & Security</h3>
							<p>
								Keep your information secure with
								enterprise-grade security features
							</p>
							<ul className={styles.benefitFeatures}>
								<li>End-to-end encryption</li>
								<li>Private profile options</li>
								<li>Secure communication channels</li>
							</ul>
						</div>
					</div>
					<div className={styles.benefitItem}>
						<div className={styles.benefitIcon}>⚡</div>
						<div>
							<h3>Unlimited Everything</h3>
							<p>
								No limits on your potential with unlimited
								access to all features
							</p>
							<ul className={styles.benefitFeatures}>
								<li>Unlimited queue time</li>
								<li>Unlimited saved contacts</li>
								<li>Unlimited profile views</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
