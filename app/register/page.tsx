"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

function RegisterPage() {
	const [selectedRole, setSelectedRole] = useState<
		"seeker" | "recruiter" | null
	>(null);
	const router = useRouter();

	const handleConfirm = () => {
		if (selectedRole) {
			router.push(`/register/${selectedRole}`);
		}
	};

	return (
		<section className={styles.section}>
			<div className={styles.heading}>
				<p className={styles.brief}>Welcome! This won’t take long...</p>
				<p className={styles.title}>
					What are you joining QueueHire as?
				</p>
			</div>

			<div className={styles.selectionContainer}>
				<div
					className={clsx(
						styles.card,
						selectedRole === "recruiter" && styles.selected
					)}
					onClick={() => setSelectedRole("recruiter")}
				>
					<h2>Recruiter</h2>
					<p>
						I am here to hire someone to get the job done or for the
						long term
					</p>
				</div>
				<div
					className={clsx(
						styles.card,
						selectedRole === "seeker" && styles.selected
					)}
					onClick={() => setSelectedRole("seeker")}
				>
					<h2>Seeker</h2>
					<p>
						I am here to freelance, work as a contractor, or find a
						full-time job
					</p>
				</div>
			</div>

			<div className={styles.buttonContainer}>
				<button
					disabled={!selectedRole}
					onClick={handleConfirm}
					className={clsx(styles.confirmButton, {
						[styles.disabled]: !selectedRole,
					})}
				>
					Confirm →
				</button>
			</div>
		</section>
	);
}

export default RegisterPage;
