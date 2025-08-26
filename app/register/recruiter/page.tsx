"use client";
import type React from "react";

import { useState, useEffect } from "react";
import { X, User, Target, FileText, Camera } from "lucide-react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import { DatabaseService } from "@/lib/database";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useRegistration } from "@/lib/RegistrationContext";


export default function RecruiterPage() {
	const { user, profile, refreshProfile } = useAuth();
	const { registrationData, updateRegistrationData } = useRegistration();
	const [profileImage, setProfileImage] = useState<string | null>(registrationData.profileImage || null);
	const [formData, setFormData] = useState({
		fullName: registrationData.fullName || "",
		skills_needed: registrationData.skillsNeeded || "",
		bio: registrationData.bio || "",
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	// Load existing profile data if user is authenticated
	useEffect(() => {
		if (profile) {
			setFormData({
				fullName: profile.full_name || "",
				skills_needed: profile.required_skills || "",
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
		const newErrors: { [key: string]: string } = {};

		// Validate full name
		if (!formData.fullName.trim()) {
			newErrors.fullName = "Full name is required";
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = "Full name must be at least 2 characters";
		} else if (formData.fullName.trim().length > 100) {
			newErrors.fullName = "Full name must be less than 100 characters";
		}

		// Validate skills needed (optional - only validate max length)
		if (formData.skills_needed.trim().length > 500) {
			newErrors.skills_needed = "Skills description must be less than 500 characters";
		}

		// Validate bio (optional - only validate max length)
		if (formData.bio.trim().length > 1000) {
			newErrors.bio = "Bio must be less than 1000 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleProceed = async () => {
		console.log('Complete Profile button clicked!');
		console.log('Form data:', formData);
		console.log('Current user:', user);
		console.log('Current profile:', profile);
		
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
				
				// First, update the auth user metadata for full name
				const { error: authError } = await supabase.auth.updateUser({
					data: { full_name: formData.fullName.trim() }
				});

				if (authError) {
					console.error('Auth metadata update error:', authError);
				}

				// Then update the profile data in public.users table
				const profileUpdateData = {
					professional_bio: formData.bio.trim(),
					required_skills: formData.skills_needed.trim(),
					profile_image: profileImage || null, // Use null instead of empty string
					user_type: "hiring",
					updated_at: new Date().toISOString()
				};

				console.log('Profile update data:', profileUpdateData);
				console.log('Profile image being saved:', profileUpdateData.profile_image);

				const { error } = await supabase
					.from('users')
					.update(profileUpdateData)
					.eq('id', user.id);

				if (error) {
					console.error('Profile update error:', error);
					setErrors(prev => ({...prev, form: `Failed to save profile: ${error.message}`}));
					return;
				}

				console.log('Profile updated successfully');
				
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
					userType: 'hiring',
					skillsNeeded: formData.skills_needed.trim() || undefined,
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

	const handleSkip = () => {
		if (validateForm()) {
			// Skip to next step
			window.location.href = "/register/confirm";
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>
						Complete Your Recruiter Profile
					</h1>
					<p className={styles.subtitle}>
					   {` Tell us about yourself and the skills you're looking for
						to help candidates understand your needs`}
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
									htmlFor="skillsNeeded"
									className={styles.fieldLabel}
								>
									<Target size={18} />
									{`Skills You're Looking For`}
								</label>
								<input
									type="text"
									id="skillsNeeded"
									name="skills_needed" // CORRECT NAME to match state variable
									value={formData.skills_needed}
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
									About You & Your Company
								</label>
								<textarea
									id="bio"
									name="bio"
									value={formData.bio}
									onChange={handleInputChange}
									placeholder="Tell candidates about your company culture, what you're looking for in candidates, and what makes your opportunities unique..."
									className={styles.textarea}
									rows={4}
								/>
								<span className={styles.fieldHint}>
									Help candidates understand your company and
									opportunities
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
