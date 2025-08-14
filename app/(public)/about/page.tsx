import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "About QueueHire",
	description:
		"Find a job in seconds. Recruit the right person today. All in one platform",
};

export default function AboutPage() {
	return (
		<div className={styles.container}>
			{/* Hero Section */}
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>About QueueHire</h1>
				</div>
			</section>

			{/* Main Content */}
			<section className={styles.mainContent}>
				<div className={styles.contentContainer}>
					<Link href="/" className={styles.backLink}>
						<ArrowLeft size={20} />
						<span>Return to Home</span>
					</Link>

					<div className={styles.contentSection}>
						<h2 className={styles.sectionTitle}>
							Built by Hustlers, for Hustlers.
						</h2>
						<p className={styles.paragraph}>
							{`QueueHire wasn't born in a boardroom or backed by
							Silicon Valley investors. It was born out of
							frustration — with platforms that overcharge,
							overcomplicate, and often underdeliver.`}
						</p>
						<p className={styles.paragraph}>
							{`We're a small but passionate team of developers,
							creatives, and freelancers who've lived the pain of
							trying to find work — and talent — through platforms
							like Fiverr and Upwork. From endless profile setups
							to approval delays to getting ghosted after applying
							for 40+ jobs, we've been there.`}
						</p>
						<p className={styles.paragraph}>
							<strong>So we built something better.</strong>
						</p>
						<p className={styles.paragraph}>
							QueueHire is the faster, simpler, and smarter
							alternative to traditional freelance platforms.
							<br />A place where job seekers and recruiters
							connect instantly — no friction, no noise, no
							middleman tax.
						</p>
					</div>

					<div className={styles.divider}></div>

					<div className={styles.contentSection}>
						<h2 className={styles.sectionTitle}>Why We Exist</h2>
						<p className={styles.paragraph}>
							<strong>Our mission is simple:</strong>
							<br />
							To make hiring and getting hired effortless,
							transparent, and insanely fast.
						</p>
						<p className={styles.paragraph}>
							<strong>{`We're building a world where:`}</strong>
						</p>
						<ul className={styles.bulletList}>
							<li>
								A freelancer does not have to wait weeks for an
								algorithm to bless them.
							</li>
							<li>
								A recruiter can fill a role today, not next
								month.
							</li>
							<li>
								And both sides can skip the games and just get
								stuff done.
							</li>
						</ul>
					</div>

					<div className={styles.divider}></div>

					<div className={styles.contentSection}>
						<h2 className={styles.sectionTitle}>{`What's Next?`}</h2>
						<p className={styles.paragraph}>
							<strong>{`We're just getting started.`}</strong>
							<br />
							Expect more features, smarter matching, and tighter
							tools — all focused on one goal:
						</p>
						<p className={styles.paragraph}>
							Helping you find work or talent, faster than
							anywhere else.
						</p>
						<p className={styles.paragraph}>
							We believe the future of hiring is simple, human,
							and instant.
							<br />
							{`That's what we're building. And we'd love for you to
							be part of it`}.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className={styles.ctaSection}>
				<div className={styles.ctaContainer}>
					<div className={styles.ctaContent}>
						<h2 className={styles.ctaTitle}>Join the Queue</h2>
						<p className={styles.ctaSubtitle}>
							Skip the noise — and finally get matched like you
							deserve.
						</p>
						<Link href="/register">
							<button className={styles.ctaButton}>
								Start Now
							</button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
