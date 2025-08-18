"use client";
import type React from "react";

import { useState, useEffect } from "react";
import { X, User, Target, FileText, Camera } from "lucide-react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";


export default function RecruiterPage() {
	const { user, profile, refreshProfile } = useAuth();
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		fullName: "",
		skills_needed : "",
		bio: "",
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
			// Generate unique filename
			const fileExt = file.name.split('.').pop();
			const uniqueId = crypto.randomUUID();
			const timestamp = Date.now();
			const fileName = `recruiters/${uniqueId}_${timestamp}.${fileExt}`;
			
			console.log('Uploading image with filename:', fileName);

			// Upload to Supabase Storage
			const { data, error } = await supabase.storage
				.from("profile-images")
				.upload(fileName, file, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				console.error('Image upload error:', error);
				setErrors(prev => ({...prev, image: "Failed to upload image. Please try again."}));
				return;
			}

			if (data) {
				console.log('Image uploaded successfully:', data);
				
				// Get public URL
				const { data: urlData } = supabase.storage
					.from("profile-images")
					.getPublicUrl(data.path);
				
				console.log('Image public URL:', urlData.publicUrl);
				setProfileImage(urlData.publicUrl);
			}
		} catch (err) {
			console.error('Image upload error:', err);
			setErrors(prev => ({...prev, image: "Failed to upload image. Please try again."}));
		}
	}
};

	const removeImage = () => {
		setProfileImage(null);
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
					profile_image: profileImage || "",
					user_type: "hiring",
					updated_at: new Date().toISOString()
				};

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
				// User not authenticated, continue with registration flow
				console.log('User not authenticated, continuing registration flow...');
				
				const profileData = {
					fullName: formData.fullName.trim(),
					skills_needed: formData.skills_needed.trim(),
					bio: formData.bio.trim(),
					profile_image: profileImage || "",
					role: "hiring",
				};
				
				localStorage.setItem("pendingProfile", JSON.stringify(profileData));
				console.log('Recruiter profile data saved to localStorage:', profileData);
				
				// Create URL with query parameters for the confirm page
				const params = new URLSearchParams({
					fullName: formData.fullName.trim(),
					skills_needed: formData.skills_needed.trim(),
					bio: formData.bio.trim(),
					profile_image: profileImage || "",
					role: "hiring"
				});
				
				router.push(`/register/confirm?${params.toString()}`);
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
