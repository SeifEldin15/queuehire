"use client";
import styles from "./Footer.module.css";
import Link from "next/link";

function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.top}>
					<div className={styles.logoSection}>
						<h2>QueueHire</h2>
						<p>
							The future of recruitment and job seeking. Find a
							job or the right person for it in 5 minutes
						</p>
					</div>
					<div className={styles.linksSection}>
						<div className={styles.navigate}>
							<h2>Navigate</h2>
							<ul>
								<li>
									<Link href={"/about"}>About</Link>
								</li>
								<li>
									<Link href={"/comparison"}>Comparison</Link>
								</li>
								<li>
									<Link href={"/pricing"}>Pricing</Link>
								</li>
							</ul>
						</div>
						<div className={styles.legals}>
							<h2>Legals</h2>
							<ul>
								<li>
									<Link href={"/privacy-policy"}>
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link href={"/terms-and-conditions"}>
										Terms & Conditions
									</Link>
								</li>
								<li>
									<Link href={"/cookie-policy"}>
										Cookie Policy
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div className={styles.copyright}>
					<p>Copyright © 2025 QueueHire - All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
