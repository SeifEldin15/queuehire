"use client";
import type React from "react";

import { useState, useEffect } from "react";
import { X, User, Briefcase, FileText, Camera } from "lucide-react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";



export default function SeekerPage() {
	const { user, profile, refreshProfile } = useAuth();
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		fullName: "",
		skills: "",
		bio: "",
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
		
		// Test storage bucket connection
		const testStorageBucket = async () => {
			try {
				const { data, error } = await supabase.storage.listBuckets();
				console.log('Available storage buckets:', data);
				if (error) {
					console.error('Storage bucket check error:', error);
				}
				
				const profileImagesBucket = data?.find(bucket => bucket.id === 'profile-images');
				if (!profileImagesBucket) {
					console.warn('Profile-images bucket not found. You need to create it in Supabase.');
				} else {
					console.log('Profile-images bucket found:', profileImagesBucket);
				}
			} catch (err) {
				console.error('Storage check error:', err);
			}
		};
		
		testStorageBucket();
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
			const fileName = `seekers/${uniqueId}_${timestamp}.${fileExt}`;
			
			console.log('Uploading image with filename:', fileName);

			// Upload to Supabase Storage
			const { data, error } = await supabase.storage
				.from("profile-images")
				.upload(fileName, file, {
					cacheControl: "3600",
					upsert: false,
				});

			console.log('Upload response:', { data, error });

			if (error) {
				console.error('Image upload error:', error);
				if (error.message.includes('Bucket not found')) {
					setErrors(prev => ({...prev, image: "Storage bucket not found. Please contact support."}));
				} else if (error.message.includes('not allowed')) {
					setErrors(prev => ({...prev, image: "Upload not allowed. Please check permissions."}));
				} else {
					setErrors(prev => ({...prev, image: `Upload failed: ${error.message}`}));
				}
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
				
				// Clear any previous errors
				setErrors(prev => {
					const newErrors = {...prev};
					delete newErrors.image;
					return newErrors;
				});
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
				
				// Skip auth metadata update for now - focus on profile data
				console.log('Step 1: Skipping auth metadata update (causing delays)');

				// Update the profile data in public.users table
				const profileUpdateData = {
					full_name: formData.fullName.trim(),
					professional_bio: formData.bio.trim(),
					skills_expertise: formData.skills.trim(),
					profile_image: profileImage || "",
					user_type: "job_seeker" // This must match the schema constraint exactly
				};

				console.log('Step 2: Updating user profile with data:', profileUpdateData);
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
				// User not authenticated, continue with registration flow
				console.log('User not authenticated, continuing registration flow...');
				
				const profileData = {
					fullName: formData.fullName.trim(),
					skills: formData.skills.trim(),
					bio: formData.bio.trim(),
					profile_image: profileImage || "",
					role: "job_seeker",
				};
				
				localStorage.setItem("pendingProfile", JSON.stringify(profileData));
				console.log('Seeker profile data saved to localStorage:', profileData);
				
				// Create URL with query parameters for the confirm page
				const params = new URLSearchParams({
					fullName: formData.fullName.trim(),
					skills: formData.skills.trim(),
					bio: formData.bio.trim(),
					profile_image: profileImage || "",
					role: "job_seeker"
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
		// For skip, just pass minimal data
		const params = new URLSearchParams({
			fullName: formData.fullName.trim() || "User",
			skills: "",
			bio: "",
			profile_image: "",
			role: "job_seeker"
		});
		
		router.push(`/register/confirm?${params.toString()}`);
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
