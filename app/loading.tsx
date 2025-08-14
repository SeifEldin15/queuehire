import styles from "./loading.module.css";

export const metadata = {
	title: "Loading...",
	description: "Loading...",
};

export default function Loading() {
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.logo}>
					<h1>QueueHire</h1>
				</div>

				<div className={styles.spinner}>
					<div className={styles.spinnerRing}></div>
					<div className={styles.spinnerRing}></div>
					<div className={styles.spinnerRing}></div>
				</div>

				<div className={styles.loadingText}>
					<p>Finding your perfect match...</p>
					<div className={styles.dots}>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		</div>
	);
}
