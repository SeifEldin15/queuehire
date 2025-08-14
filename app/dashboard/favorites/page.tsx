import { ExternalLink, Copy, Trash2, Lock } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "QueueHire - Saved Contacts",
	description:
		"Find a job in seconds. Recruit the right person today. All in one platform",
};

export default function FavoritesPage() {
	const savedContacts = [
		{
			name: "Ziad Nagy",
			saveDate: "31/5/2025",
			rating: 4,
			totalRatings: 12,
		},
		{
			name: "Sara Johnson",
			saveDate: "29/5/2025",
			rating: 5,
			totalRatings: 8,
		},
		{
			name: "Mennatallah",
			saveDate: "11/5/2025",
			rating: 3,
			totalRatings: 15,
		},
	];

	const renderStars = (rating: number, total: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<span
					key={i}
					className={
						i <= rating ? styles.starFilled : styles.starEmpty
					}
				>
					⭐
				</span>
			);
		}
		return (
			<div className={styles.ratingContainer}>
				<div className={styles.stars}>{stars}</div>
				<span className={styles.ratingCount}>({total})</span>
			</div>
		);
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.pageTitle}>Saved Contacts</h1>

			<div className={styles.contactsTable}>
				<div className={styles.tableHeader}>
					<div className={styles.headerCell}>Name</div>
					<div className={styles.headerCell}>Save Date</div>
					<div className={styles.headerCell}>Rating</div>
					<div className={styles.headerCell}>Profile</div>
					<div className={styles.headerCell}>Action</div>
				</div>

				<div className={styles.tableBody}>
					{savedContacts.map((contact, index) => (
						<div key={index} className={styles.tableRow}>
							<div className={styles.nameCell}>
								<div className={styles.contactAvatar}>
									{contact.name.charAt(0)}
								</div>
								<span className={styles.contactName}>
									{contact.name}
								</span>
							</div>
							<div className={styles.cell}>
								{contact.saveDate}
							</div>
							<div className={styles.cell}>
								{renderStars(
									contact.rating,
									contact.totalRatings
								)}
							</div>
							<div className={styles.cell}>
								<button className={styles.visitProfileBtn}>
									Visit profile <ExternalLink size={14} />
								</button>
							</div>
							<div className={styles.cell}>
								<div className={styles.actionButtons}>
									<button
										className={styles.actionBtn}
										title="Copy contact"
									>
										<Copy size={16} />
									</button>
									<button
										className={styles.actionBtn}
										title="Remove from favorites"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className={styles.limitationNotice}>
				<div className={styles.lockIcon}>
					<Lock size={48} />
				</div>
				<p className={styles.limitationText}>
					<em>You can not save more than 3 users in this plan</em>
				</p>
				<button className={styles.upgradeBtn}>Upgrade?</button>
			</div>

			{/* Enhanced Features Section */}
			<div className={styles.featuresSection}>
				<h2 className={styles.featuresTitle}>
					Unlock Premium Features
				</h2>
				<p className={styles.featuresSubtitle}>
					Take your networking to the next level with advanced tools
					and unlimited access
				</p>

				<div className={styles.featuresList}>
					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>📊</div>
						<div className={styles.featureContent}>
							<h3>Advanced Contact Analytics</h3>
							<p>
								Track engagement rates, response times, and
								success metrics for all your saved contacts
							</p>
							<div className={styles.featureBadge}>
								Pro Feature
							</div>
						</div>
					</div>

					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>🔄</div>
						<div className={styles.featureContent}>
							<h3>Unlimited Contact Storage</h3>
							<p>
								Save as many contacts as you need without any
								restrictions or limitations
							</p>
							<div className={styles.featureBadge}>
								Essential+
							</div>
						</div>
					</div>

					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>🏷️</div>
						<div className={styles.featureContent}>
							<h3>Smart Contact Organization</h3>
							<p>
								Create custom tags, categories, and smart
								folders to organize your network efficiently
							</p>
							<div className={styles.featureBadge}>
								Pro Feature
							</div>
						</div>
					</div>

					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>🔔</div>
						<div className={styles.featureContent}>
							<h3>Smart Notifications</h3>
							<p>
								Get notified when your saved contacts are active
								or when new opportunities arise
							</p>
							<div className={styles.featureBadge}>Premium</div>
						</div>
					</div>

					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>📱</div>
						<div className={styles.featureContent}>
							<h3>Contact Export & Sync</h3>
							<p>
								Export your contacts to CSV or sync with your
								favorite CRM and productivity tools
							</p>
							<div className={styles.featureBadge}>
								Pro Feature
							</div>
						</div>
					</div>

					<div className={styles.featureItem}>
						<div className={styles.featureIcon}>🎯</div>
						<div className={styles.featureContent}>
							<h3>Priority Matching</h3>
							<p>
								{`Get matched with your saved contacts first when
								they're looking for opportunities`}
							</p>
							<div className={styles.featureBadge}>Premium</div>
						</div>
					</div>
				</div>

				<div className={styles.upgradeCallout}>
					<h3>Ready to unlock these features?</h3>
					<p>
						{`Choose the plan that's right for you and start building
						better connections today`}
					</p>
					<button className={styles.upgradeBtn}>
						View Pricing Plans
					</button>
				</div>
			</div>
		</div>
	);
}
