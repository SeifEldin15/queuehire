/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Home, Search } from "lucide-react";
import styles from "./not-found.module.css";

export const metadata = {
	title: "404 Not Found",
	description: "This page does not exist on the QueueHire site!",
};

export default function NotFound() {
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.illustration}>
					<div className={styles.errorCode}>404</div>
					<div className={styles.errorIcon}>
						<Search size={64} />
					</div>
				</div>

				<div className={styles.textContent}>
					<h1 className={styles.title}>Page Not Found</h1>
					<p className={styles.description}>
						Oops! The page you're looking for seems to have wandered
						off. Don't worry, even the best algorithms sometimes
						miss a match.
					</p>
					<p className={styles.subdescription}>
						Let's get you back to finding your perfect opportunity.
					</p>
				</div>

				<div className={styles.actions}>
					<Link href="/" className={styles.primaryAction}>
						<Home size={20} />
						<span>Back to Home</span>
					</Link>
					<Link href="/register" className={styles.secondaryAction}>
						<span>Join QueueHire</span>
					</Link>
				</div>

				<div className={styles.suggestions}>
					<h3>Popular Pages:</h3>
					<div className={styles.suggestionLinks}>
						<Link href="/about">About</Link>
						<Link href="/comparison">Comparison</Link>
						<Link href="/register">Sign Up</Link>
						<Link href="/dashboard">Dashboard</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
