 "use client";


import { ExternalLink, Copy, Trash2, Lock, Search, Filter, Plus } from "lucide-react";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/lib/types';
import styles from "./page.module.css";

interface SavedContact {
	id: string;
	user_id: string;
	saved_contact_id: string;
	created_at: string;
	contact_profile: UserProfile;
}

export default function FavoritesPage() {
	const { user, profile } = useAuth();
	const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<'all' | 'job_seeker' | 'hiring'>('all');

	// Fetch saved contacts
	const fetchSavedContacts = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from('saved_contacts')
				.select(`
					*,
					contact_profile:saved_contact_id (
						id,
						email,
						full_name,
						user_type,
						plan_type,
						professional_bio,
						skills_expertise,
						created_at
					)
				`)
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (error) {
				setError(error.message);
			} else {
				setSavedContacts(data || []);
			}
		} catch (err) {
			setError('Failed to fetch saved contacts');
			console.error('Error fetching saved contacts:', err);
		} finally {
			setLoading(false);
		}
	};

	// Remove contact from favorites
	const removeContact = async (contactId: string) => {
		if (!confirm('Are you sure you want to remove this contact from your favorites?')) {
			return;
		}

		try {
			const { error } = await supabase
				.from('saved_contacts')
				.delete()
				.eq('id', contactId)
				.eq('user_id', user?.id);

			if (error) {
				alert('Failed to remove contact: ' + error.message);
			} else {
				setSavedContacts(prev => prev.filter(contact => contact.id !== contactId));
			}
		} catch (err) {
			alert('Failed to remove contact');
			console.error('Error removing contact:', err);
		}
	};

	// Copy contact info to clipboard
	const copyContactInfo = async (contact: SavedContact) => {
		const contactInfo = `
Name: ${contact.contact_profile.full_name || 'Not provided'}
Email: ${contact.contact_profile.email}
Type: ${contact.contact_profile.user_type === 'job_seeker' ? 'Job Seeker' : 'Hiring Manager'}
Plan: ${contact.contact_profile.plan_type}
${contact.contact_profile.professional_bio ? `Bio: ${contact.contact_profile.professional_bio}` : ''}
${contact.contact_profile.skills_expertise ? `Skills: ${contact.contact_profile.skills_expertise}` : ''}
		`.trim();

		try {
			await navigator.clipboard.writeText(contactInfo);
			alert('Contact information copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
			alert('Failed to copy contact information');
		}
	};

	// Filter contacts based on search and type
	const filteredContacts = savedContacts.filter(contact => {
		const matchesSearch = !searchTerm || 
			contact.contact_profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			contact.contact_profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			contact.contact_profile.professional_bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			contact.contact_profile.skills_expertise?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesType = filterType === 'all' || contact.contact_profile.user_type === filterType;

		return matchesSearch && matchesType;
	});

	useEffect(() => {
		fetchSavedContacts();
	}, [user]);

	if (loading) {
		return (
			<div className={styles.container}>
				<div className={styles.loadingContainer}>
					<div className={styles.spinner}></div>
					<p>Loading your saved contacts...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>


			{error && (
				<div className={styles.errorMessage}>
					<p>Error: {error}</p>
					<button onClick={fetchSavedContacts} className={styles.retryBtn}>
						Retry
					</button>
				</div>
			)}

			{filteredContacts.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>
						<Plus size={48} />
					</div>
					<h2>No saved contacts {searchTerm || filterType !== 'all' ? 'match your criteria' : 'yet'}</h2>
					<p>
						{searchTerm || filterType !== 'all' 
							? 'Try adjusting your search or filter criteria.'
							: 'Start building your network by saving contacts you meet on QueueHire.'
						}
					</p>
				</div>
			) : (
				<div className={styles.contactsTable}>
					<div className={styles.tableHeader}>
						<div className={styles.headerCell}>Contact</div>
						<div className={styles.headerCell}>Type</div>
						<div className={styles.headerCell}>Plan</div>
						<div className={styles.headerCell}>Saved Date</div>
						<div className={styles.headerCell}>Actions</div>
					</div>

					<div className={styles.tableBody}>
						{filteredContacts.map((contact) => (
							<div key={contact.id} className={styles.tableRow}>
								<div className={styles.contactCell}>
									<div className={styles.contactAvatar}>
										{(contact.contact_profile.full_name || contact.contact_profile.email).charAt(0).toUpperCase()}
									</div>
									<div className={styles.contactInfo}>
										<div className={styles.contactName}>
											{contact.contact_profile.full_name || 'Name not provided'}
										</div>
										<div className={styles.contactEmail}>
											{contact.contact_profile.email}
										</div>
										{contact.contact_profile.professional_bio && (
											<div className={styles.contactBio}>
												{contact.contact_profile.professional_bio.substring(0, 100)}
												{contact.contact_profile.professional_bio.length > 100 ? '...' : ''}
											</div>
										)}
									</div>
								</div>
								<div className={styles.cell}>
									<span className={`${styles.typeBadge} ${styles[contact.contact_profile.user_type]}`}>
										{contact.contact_profile.user_type === 'job_seeker' ? 'Job Seeker' : 'Hiring Manager'}
									</span>
								</div>
								<div className={styles.cell}>
									<span className={`${styles.planBadge} ${styles[contact.contact_profile.plan_type.toLowerCase()]}`}>
										{contact.contact_profile.plan_type}
									</span>
								</div>
								<div className={styles.cell}>
									{new Date(contact.created_at).toLocaleDateString()}
								</div>
								<div className={styles.cell}>
									<div className={styles.actionButtons}>
										<button
											className={styles.actionBtn}
											onClick={() => copyContactInfo(contact)}
											title="Copy contact info"
										>
											<Copy size={16} />
										</button>
										<button
											className={styles.actionBtn}
											onClick={() => removeContact(contact.id)}
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
			)}
		</div>
	);
}
