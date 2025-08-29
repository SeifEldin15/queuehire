"use client";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DatabaseService } from "@/lib/database";
import { UserProfile } from "@/lib/types";
import styles from "./page.module.css";

export default function UpgradePage() {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState<string | null>(null);
	const router = useRouter();

	// Fetch user profile on mount
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) {
					router.replace("/login");
					return;
				}

				const profileData = await DatabaseService.getUserProfile(user.id);
				if (profileData) {
					setProfile(profileData);
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [router]);

	const handleUpgrade = async (planType: 'Free' | 'Essential' | 'Power' | 'Pro') => {
		if (!profile) {
			// // console.log("No profile found");
			return;
		}

		// // console.log("Starting upgrade to:", planType);
		// // console.log("Current profile:", profile);
		setUpgrading(planType);
		
		try {
			// Try direct Supabase update first
			// // console.log("Attempting direct Supabase update...");
			const { data: directUpdateData, error: directUpdateError } = await supabase
				.from('users')
				.update({ plan_type: planType })
				.eq('id', profile.id)
				.select()
				.single();

			// // console.log("Direct update result:", { directUpdateData, directUpdateError });

			if (directUpdateError) {
				console.error("Direct update failed:", directUpdateError);
				alert(`Update failed: ${directUpdateError.message}`);
				return;
			}

			if (directUpdateData) {
				setProfile(directUpdateData);
				const action = planType === 'Free' ? 'downgraded to' : 'upgraded to';
				alert(`Successfully ${action} ${planType} plan!`);
			} else {
				// // console.log("No data returned from direct update");
				alert("Failed to update plan. Please try again.");
			}
		} catch (error) {
			console.error("Error updating plan:", error);
			alert("Failed to update plan. Please try again.");
		} finally {
			// // console.log("Finishing upgrade process");
			setUpgrading(null);
		}
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<div style={{ textAlign: 'center', padding: '2rem' }}>
					Loading your profile...
				</div>
			</div>
		);
	}
	const plans = [
		{
			name: "Essential",
			price: 15,
			features: [
				{ name: "60 minutes of calls daily", included: true },
				{ name: "Basic matching algorithm", included: true },
				{ name: "Email support", included: true },
				{ name: "Profile analytics", included: false },
				{ name: "Priority matching", included: false },
			],
			buttonText: "Choose Plan",
			buttonStyle: "secondary" as const,
			planType: "Essential" as const,
		},
		{
			name: "Power",
			price: 29,
			features: [
				{ name: "180 minutes of calls daily", included: true },
				{ name: "Advanced matching algorithm", included: true },
				{ name: "Priority support", included: true },
				{ name: "Profile analytics", included: true },
				{ name: "Priority matching", included: true },
			],
			buttonText: "Choose Plan",
			buttonStyle: "primary" as const,
			recommended: true,
			planType: "Power" as const,
		},
		{
			name: "Pro",
			price: 69,
			features: [
				{ name: "Unlimited minutes", included: true },
				{ name: "AI-powered matching", included: true },
				{ name: "24/7 premium support", included: true },
				{ name: "Advanced analytics", included: true },
				{ name: "Dedicated success manager", included: true },
			],
			buttonText: "Choose Plan",
			buttonStyle: "secondary" as const,
			planType: "Pro" as const,
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
							} ${
								profile?.plan_type === plan.planType ? styles.currentPlan : ""
							}`}
							onClick={() => handleUpgrade(plan.planType)}
							disabled={
								upgrading === plan.planType || 
								profile?.plan_type === plan.planType
							}
						>
							{upgrading === plan.planType 
								? "Upgrading..." 
								: profile?.plan_type === plan.planType 
								? "Current Plan"
								: plan.buttonText
							}
						</button>
					</div>
				))}
			</div>

			<div className={styles.currentPlanInfo}>
				<div className={styles.currentPlan}>
					<span className={styles.label}>Current Plan:</span>
					<span className={styles.value}>{profile?.plan_type || "Free"}</span>
				</div>
				<div className={styles.renewalDate}>
					<span className={styles.label}>Member Since:</span>
					<span className={styles.value}>
						{profile?.created_at 
							? new Date(profile.created_at).toLocaleDateString()
							: "N/A"
						}
					</span>
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
