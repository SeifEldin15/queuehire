"use client";
import { ExternalLink, Copy, Trash2, Lock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DatabaseService } from "@/lib/database";
import { UserProfile } from "@/lib/types";
import styles from "./page.module.css";

interface SavedContactWithProfile {
  id: string;
  user_id: string;
  saved_contact_id: string;
  created_at: string;
  saved_contact: UserProfile;
}

export default function FavoritesPage() {
	const [savedContacts, setSavedContacts] = useState<SavedContactWithProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
	const [removingContact, setRemovingContact] = useState<string | null>(null);
	const router = useRouter();

	// Fetch saved contacts and current user
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) {
					router.replace("/login");
					return;
				}

				// Get current user profile
				const userProfile = await DatabaseService.getUserProfile(user.id);
				setCurrentUser(userProfile);

				// Get saved contacts
				const contacts = await DatabaseService.getSavedContacts(user.id);
				setSavedContacts(contacts);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [router]);

	const handleRemoveContact = async (contactId: string) => {
		if (!currentUser) return;

		setRemovingContact(contactId);
		try {
			const success = await DatabaseService.removeSavedContact(currentUser.id, contactId);
			if (success) {
				setSavedContacts(prev => prev.filter(contact => contact.saved_contact_id !== contactId));
			} else {
				alert("Failed to remove contact. Please try again.");
			}
		} catch (error) {
			console.error("Error removing contact:", error);
			alert("Failed to remove contact. Please try again.");
		} finally {
			setRemovingContact(null);
		}
	};

	const handleCopyContact = async (contact: UserProfile) => {
		const contactInfo = `${contact.full_name || 'Unknown'}\nEmail: ${contact.email}\nType: ${contact.user_type}`;
		try {
			await navigator.clipboard.writeText(contactInfo);
			alert("Contact information copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy:", error);
			alert("Failed to copy contact information.");
		}
	};

	const getPlanLimit = (planType: string) => {
		switch (planType) {
			case 'Free':
				return 3;
			case 'Essential':
				return 10;
			case 'Power':
			case 'Pro':
				return Infinity;
			default:
				return 3;
		}
	};

	const canSaveMore = () => {
		if (!currentUser) return false;
		const limit = getPlanLimit(currentUser.plan_type);
		return savedContacts.length < limit;
	};

	const renderStars = (userType: string) => {
		// For now, we'll show a simple user type indicator instead of ratings
		// You can implement a rating system later if needed
		return (
			<div className={styles.ratingContainer}>
				<span className={styles.userType}>
					{userType === 'job_seeker' ? '👤 Job Seeker' : '🏢 Hiring Manager'}
				</span>
			</div>
		);
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<h1 className={styles.pageTitle}>Saved Contacts</h1>
				<div className={styles.loadingContainer}>
					<RefreshCw className={styles.loadingIcon} size={32} />
					<p>Loading your saved contacts...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.pageTitle}>Saved Contacts</h1>

			{savedContacts.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>📋</div>
					<h3>No saved contacts yet</h3>
					<p>Start networking and save contacts you'd like to connect with later!</p>
				</div>
			) : (
				<div className={styles.contactsTable}>
					<div className={styles.tableHeader}>
						<div className={styles.headerCell}>Name</div>
						<div className={styles.headerCell}>Save Date</div>
						<div className={styles.headerCell}>Type</div>
						<div className={styles.headerCell}>Profile</div>
						<div className={styles.headerCell}>Action</div>
					</div>

					<div className={styles.tableBody}>
						{savedContacts.map((contact, index) => (
							<div key={contact.id} className={styles.tableRow}>
								<div className={styles.nameCell}>
									<div className={styles.contactAvatar}>
										{contact.saved_contact?.full_name?.charAt(0) || contact.saved_contact?.email?.charAt(0) || '?'}
									</div>
									<div className={styles.contactInfo}>
										<span className={styles.contactName}>
											{contact.saved_contact?.full_name || 'Unknown User'}
										</span>
										<span className={styles.contactEmail}>
											{contact.saved_contact?.email || 'No email'}
										</span>
									</div>
								</div>
								<div className={styles.cell}>
									{new Date(contact.created_at).toLocaleDateString()}
								</div>
								<div className={styles.cell}>
									{renderStars(contact.saved_contact?.user_type || 'job_seeker')}
								</div>
								<div className={styles.cell}>
									<button className={styles.visitProfileBtn}>
										View Profile <ExternalLink size={14} />
									</button>
								</div>
								<div className={styles.cell}>
									<div className={styles.actionButtons}>
										<button
											className={styles.actionBtn}
											title="Copy contact"
											onClick={() => handleCopyContact(contact.saved_contact)}
										>
											<Copy size={16} />
										</button>
										<button
											className={`${styles.actionBtn} ${styles.deleteBtn}`}
											title="Remove from favorites"
											onClick={() => handleRemoveContact(contact.saved_contact_id)}
											disabled={removingContact === contact.saved_contact_id}
										>
											{removingContact === contact.saved_contact_id ? (
												<RefreshCw size={16} className={styles.loadingIcon} />
											) : (
												<Trash2 size={16} />
											)}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{!canSaveMore() && (
				<div className={styles.limitationNotice}>
					<div className={styles.lockIcon}>
						<Lock size={48} />
					</div>
					<p className={styles.limitationText}>
						<em>
							You have reached the limit of {getPlanLimit(currentUser?.plan_type || 'Free')} saved contacts for your {currentUser?.plan_type || 'Free'} plan
						</em>
					</p>
					<button 
						className={styles.upgradeBtn}
						onClick={() => router.push('/dashboard/upgrade')}
					>
						Upgrade?
					</button>
				</div>
			)}

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
					<button 
						className={styles.upgradeBtn}
						onClick={() => router.push('/dashboard/upgrade')}
					>
						View Pricing Plans
					</button>
				</div>
			</div>
		</div>
	);
}
