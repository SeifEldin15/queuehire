"use client";
import type React from "react";

import { useState, useEffect } from "react";
import { X, User, Briefcase, FileText, Camera } from "lucide-react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import { DatabaseService } from "@/lib/database";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useRegistration } from "@/lib/RegistrationContext";



export default function SeekerPage() {
	const { user, profile, refreshProfile } = useAuth();
	const { registrationData, updateRegistrationData } = useRegistration();
	const [profileImage, setProfileImage] = useState<string | null>(registrationData.profileImage || null);
	const [formData, setFormData] = useState({
		fullName: registrationData.fullName || "",
		skills: registrationData.skills || "",
		bio: registrationData.bio || "",
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	// Load existing profile data if user is authenticated
	useEffect(() => {
		if (profile) {
			console.log('Available profile fields:', Object.keys(profile));
			setFormData({
				fullName: profile.full_name || "",
				skills: profile.skills_expertise || "",
				bio: profile.professional_bio || "",
			});
			if (profile.profile_image) {
				setProfileImage(profile.profile_image);
			}
		}
	}, [profile]);

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
	const file = event.target.files?.[0];
	if (file) {
		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setErrors(prev => ({...prev, image: "Image must be less than 5MB"}));
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setErrors(prev => ({...prev, image: "Please select a valid image file"}));
			return;
		}

		// Clear previous image errors
		setErrors(prev => {
			const newErrors = {...prev};
			delete newErrors.image;
			return newErrors;
		});

		try {
			// Create FormData for file upload
			const formData = new FormData();
			formData.append('file', file);

			console.log('Uploading image to traditional upload endpoint...');

			// Upload to our API endpoint
			const response = await fetch('/api/upload-profile-image', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Upload failed');
			}

			if (result.success) {
				console.log('Image uploaded successfully:', result.url);
				setProfileImage(result.url);
				
				// Update registration context
				updateRegistrationData({
					profileImage: result.url
				});
				
				// Clear any previous errors
				setErrors(prev => {
					const newErrors = {...prev};
					delete newErrors.image;
					return newErrors;
				});
			}
		} catch (err) {
			console.error('Image upload error:', err);
			setErrors(prev => ({...prev, image: `Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`}));
		}
	}
};

	const removeImage = () => {
		setProfileImage(null);
		// Update registration context
		updateRegistrationData({
			profileImage: undefined
		});
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		console.log('Validating form with data:', formData);
		const newErrors: { [key: string]: string } = {};

		// Validate full name
		if (!formData.fullName.trim()) {
			newErrors.fullName = "Full name is required";
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = "Full name must be at least 2 characters";
		} else if (formData.fullName.trim().length > 100) {
			newErrors.fullName = "Full name must be less than 100 characters";
		}

		// Validate skills (optional - only validate max length)
		if (formData.skills.trim().length > 500) {
			newErrors.skills = "Skills description must be less than 500 characters";
		}

		// Validate bio (optional - only validate max length)
		if (formData.bio.trim().length > 1000) {
			newErrors.bio = "Bio must be less than 1000 characters";
		}

		console.log('Validation errors:', newErrors);
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleProceed = async () => {
		console.log('Complete Profile button clicked!');
		
		if (!validateForm()) {
			console.log('Form validation failed');
			return;
		}

		console.log('Form validation passed, proceeding...');
		setIsSubmitting(true);
		
		try {
			// If user is already authenticated, save directly to database
			if (user) {
				console.log('User is authenticated, saving profile to database...');
				console.log('Current profileImage state:', profileImage);
				
				// Skip auth metadata update for now - focus on profile data
				console.log('Step 1: Skipping auth metadata update (causing delays)');

				// Update the profile data in public.users table
				const profileUpdateData = {
					full_name: formData.fullName.trim(),
					professional_bio: formData.bio.trim(),
					skills_expertise: formData.skills.trim(),
					profile_image: profileImage || null, // Use null instead of empty string
					user_type: "job_seeker" // This must match the schema constraint exactly
				};

				console.log('Step 2: Updating user profile with data:', profileUpdateData);
				console.log('Profile image being saved:', profileUpdateData.profile_image);
				console.log('User ID:', user.id);

				const { data, error } = await supabase
					.from('users')
					.update(profileUpdateData)
					.eq('id', user.id)
					.select(); // Return the updated data

				console.log('Step 3: Database update completed');
				console.log('Database update result:', { data, error, userId: user.id });

				if (error) {
					console.error('Profile update error:', error);
					
					// Try to provide more specific error messages
					if (error.message.includes('user_type')) {
						setErrors(prev => ({...prev, form: `User type error: ${error.message}`}));
					} else if (error.message.includes('RLS')) {
						setErrors(prev => ({...prev, form: `Permission error: ${error.message}`}));
					} else {
						setErrors(prev => ({...prev, form: `Failed to save profile: ${error.message}`}));
					}
					return;
				}

				console.log('Profile updated successfully, updated data:', data);
				
				// Refresh the profile in context
				await refreshProfile();
				
				// Redirect to dashboard
				router.push('/dashboard');
			} else {
				// User not authenticated, save to registration context and continue registration
				console.log('User not authenticated, saving to registration context...');
				
				// Update registration data in context
				updateRegistrationData({
					fullName: formData.fullName.trim(),
					userType: 'job_seeker',
					skills: formData.skills.trim() || undefined,
					bio: formData.bio.trim() || undefined,
					profileImage: profileImage || undefined,
				});

				console.log('Registration data saved to context');
				
				// Navigate to confirm page
				router.push('/register/confirm');
			}
		} catch (err) {
			console.error('Form submission error:', err);
			setErrors(prev => ({...prev, form: "An error occurred. Please try again."}));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = async () => {
		console.log('Skip button clicked, saving minimal data...');
		setIsSubmitting(true);
		
		try {
			// Save minimal data to registration context
			updateRegistrationData({
				fullName: formData.fullName.trim() || "User",
				userType: 'job_seeker',
				skills: undefined,
				bio: undefined,
				profileImage: undefined,
			});

			console.log('Minimal registration data saved to context');
			
			// Navigate to confirm page
			router.push('/register/confirm');
			
		} catch (error) {
			console.error('Error saving registration data:', error);
			setErrors(prev => ({...prev, form: "Failed to save data. Please try again."}));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>
						Complete Your Seeker Profile
					</h1>
					<p className={styles.subtitle}>
						Help us understand your skills and experience to match
						you with the perfect opportunities
					</p>
				</div>

				<div className={styles.formContainer}>
					<form className={styles.form}>
						{/* Profile Image Upload */}
						<div className={styles.imageSection}>
							<label className={styles.imageLabel}>
								Profile Picture
							</label>
							<div className={styles.imageUploadContainer}>
								{profileImage ? (
									<div className={styles.imagePreview}>
										<img
											src={
												profileImage ||
												"/placeholder.svg"
											}
											alt="Profile preview"
											className={styles.previewImage}
										/>
										<button
											type="button"
											onClick={removeImage}
											className={styles.removeImageBtn}
											aria-label="Remove image"
										>
											<X size={16} />
										</button>
									</div>
								) : (
									<label
										htmlFor="profileImage"
										className={styles.uploadArea}
									>
										<div className={styles.uploadIcon}>
											<Camera size={32} />
										</div>
										<div className={styles.uploadText}>
											<span
												className={styles.uploadTitle}
											>
												Upload your photo
											</span>
											<span
												className={styles.uploadSubtext}
											>
												PNG, JPG or WEBP (max 5MB)
											</span>
										</div>
										<input
											type="file"
											id="profileImage"
											accept="image/*"
											onChange={handleImageUpload}
											className={styles.hiddenInput}
										/>
									</label>
								)}
							</div>
						</div>

						{/* Form Fields */}
						<div className={styles.fieldsGrid}>
							<div className={styles.fieldGroup}>
								<label
									htmlFor="fullName"
									className={styles.fieldLabel}
								>
									<User size={18} />
									Full Name *
								</label>
								<input
									type="text"
									id="fullName"
									name="fullName"
									value={formData.fullName}
									onChange={handleInputChange}
									placeholder="Enter your full name"
									className={`${styles.input} ${
										errors.fullName ? styles.inputError : ""
									}`}
									required
								/>
								{errors.fullName && (
									<span className={styles.errorText}>
										{errors.fullName}
									</span>
								)}
							</div>

							<div className={styles.fieldGroup}>
								<label
									htmlFor="skills"
									className={styles.fieldLabel}
								>
									<Briefcase size={18} />
									Skills & Expertise
								</label>
								<input
									type="text"
									id="skills"
									name="skills"
									value={formData.skills}
									onChange={handleInputChange}
									placeholder="e.g., React, Node.js, UI/UX Design, Python..."
									className={styles.input}
								/>
								<span className={styles.fieldHint}>
									Separate multiple skills with commas
								</span>
							</div>

							<div className={styles.fieldGroup}>
								<label
									htmlFor="bio"
									className={styles.fieldLabel}
								>
									<FileText size={18} />
									Professional Bio
								</label>
								<textarea
									id="bio"
									name="bio"
									value={formData.bio}
									onChange={handleInputChange}
									placeholder="Tell us about your experience, what you're passionate about, and what kind of opportunities you're looking for..."
									className={styles.textarea}
									rows={4}
								/>
								<span className={styles.fieldHint}>
									Help employers understand what makes you
									unique
								</span>
							</div>
						</div>

						<div className={styles.actionButtons}>
							<button
								type="button"
								onClick={handleSkip}
								className={styles.skipButton}
							>
								Skip for Now
							</button>
							<button
								type="button"
								onClick={handleProceed}
								className={styles.proceedButton}
							>
								Complete Profile
							</button>
						</div>

						<div className={styles.formFooter}>
							<p className={styles.footerText}>
								* Required fields. You can always update your
								profile later in your dashboard.
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
