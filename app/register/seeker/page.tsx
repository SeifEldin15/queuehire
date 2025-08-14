"use client";
import type React from "react";

import { useState } from "react";
import { X, User, Briefcase, FileText, Camera } from "lucide-react";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";



export default function SeekerPage() {
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		fullName: "",
		skills: "",
		bio: "",
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const router = useRouter();

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
	const file = event.target.files?.[0];
	if (file) {
		// Show preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setProfileImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("profile-images")
			.upload(`seekers/${Date.now()}_${file.name}`, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (!error && data) {
			// Get public URL
			const { data: urlData } = supabase.storage
				.from("profile-images")
				.getPublicUrl(data.path);
			setProfileImage(urlData.publicUrl);
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

		if (!formData.fullName.trim()) {
			newErrors.fullName = "Full name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleProceed = async () => {
		if (validateForm()) {
			// Build and save profile data in local storage 
			const profileData = {
				fullName: formData.fullName,
				skills: formData.skills,
				bio: formData.bio,
				profile_image: profileImage || "",
				role: "job_seeker", // Changed from "seeker" to match database schema
			};
			localStorage.setItem("pendingProfile", JSON.stringify(profileData));
			router.push("/register/confirm");
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
