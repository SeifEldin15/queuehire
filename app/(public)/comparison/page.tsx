import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
	title: "QueueHire vs Fiverr vs Upwork",
	description:
		"Find out why QueueHire is much better than the competition. Why Upwork and Fiverr are no-match!",
};


export default function ComparisonPage() {
    const comparisonData = [
        {
            feature: "Platform Fees",
            queuehire: "No fees at all - keep 100% of what you earn",
            fiverr: "Up to 20% for freelancers, extra for clients",
            upwork: "Up to 20% for freelancers, extra for clients",
        },
        {
            feature: "Pricing",
            queuehire: "No algorithm interference. Visibility is equal.",
            fiverr: "Algorithm decides who gets seen",
            upwork: "Pay-for-rank plus promoted",
        },
        {
            feature: "Speed",
            queuehire: "Instant matches, no fluff",
            fiverr: "Delays, waiting, approvals",
            upwork: "Lengthy proposals and bidding",
        },
        {
            feature: "Escrow & Delays",
            queuehire: "None. No negotiation directly, fast.",
            fiverr: "Escrow delays and review cycles",
            upwork: "Payment held, approval, milestone delays",
        },
        {
            feature: "Communication",
            queuehire: "Direct chat immediately upon match",
            fiverr: "Mostly text based and depends on user's response time",
            upwork: "Slow unlock after proposal",
        },
        {
            feature: "Freedom",
            queuehire: "Yes this, that, negotiate - your call",
            fiverr: "Everything enforced via Fiverr rules",
            upwork: "Terms must follow Upwork guidelines",
        },
        {
            feature: "Payout Speed",
            queuehire: "You get paid when you get paid. Instantly",
            fiverr: "Can take 7-30 days",
            upwork: "Up to 10 days holding",
        },
    ];

    return (
        <div className={styles.container}>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Detailed Comparison</h1>
                </div>
            </section>

            {/* Main Content */}
            <section className={styles.mainContent}>
                <div className={styles.contentContainer}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Return to Home</span>
                    </Link>

                    <div className={styles.introSection}>
                        <h2 className={styles.sectionTitle}>
                            QueueHire is just better...
                        </h2>
                        <p className={styles.paragraph}>
                            Built with one goal in mind - Connect job seekers
                            and recruiters blazingly fast. And without fees.
                        </p>
                    </div>

                    <div className={styles.reasonSection}>
                        <h3 className={styles.subsectionTitle}>
                            Every Reason Why
                        </h3>
                        <p className={styles.paragraph}>
                            At QueueHire we do not charge any fees. We give you
                            the platform. You sort out everything together. No
                            escrow. Forget nonsense or long delays.
                        </p>
                        <p className={styles.paragraph}>
                            No algorithm system that blesses the lucky few. We
                            prioritise getting to the right person. No hiding
                            behind a screen.
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div className={styles.comparisonSection}>
                        <h3 className={styles.subsectionTitle}>
                            QueueHire vs Fiverr vs Upwork
                        </h3>
                        <p className={styles.tableSubtitle}>
                            Complete yet quick feature and capabilities
                            comparison
                        </p>

                        <div className={styles.tableContainer}>
                            <div className={styles.comparisonTable}>
                                <div className={styles.tableHeader}>
                                    <div className={styles.headerCell}>
                                        Feature
                                    </div>
                                    <div className={styles.headerCell}>
                                        <div className={styles.platformBadge}>
                                            <Check
                                                size={16}
                                                className={styles.checkIcon}
                                            />
                                            QueueHire
                                        </div>
                                    </div>
                                    <div className={styles.headerCell}>
                                        <div className={styles.competitorBadge}>
                                            <X
                                                size={16}
                                                className={styles.xIcon}
                                            />
                                            Fiverr
                                        </div>
                                    </div>
                                    <div className={styles.headerCell}>
                                        <div className={styles.competitorBadge}>
                                            <X
                                                size={16}
                                                className={styles.xIcon}
                                            />
                                            Upwork
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.tableBody}>
                                    {comparisonData.map((row, index) => (
                                        <div
                                            key={index}
                                            className={styles.tableRow}
                                        >
                                            <div className={styles.featureCell}>
                                                <strong>{row.feature}</strong>
                                            </div>
                                            <div className={styles.dataCell}>
                                                <div
                                                    className={
                                                        styles.cellContent
                                                    }
                                                >
                                                    <Check
                                                        size={16}
                                                        className={
                                                            styles.checkIcon
                                                        }
                                                    />
                                                    <span>{row.queuehire}</span>
                                                </div>
                                            </div>
                                            <div className={styles.dataCell}>
                                                <div
                                                    className={
                                                        styles.cellContent
                                                    }
                                                >
                                                    <X
                                                        size={16}
                                                        className={styles.xIcon}
                                                    />
                                                    <span>{row.fiverr}</span>
                                                </div>
                                            </div>
                                            <div className={styles.dataCell}>
                                                <div
                                                    className={
                                                        styles.cellContent
                                                    }
                                                >
                                                    <X
                                                        size={16}
                                                        className={styles.xIcon}
                                                    />
                                                    <span>{row.upwork}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why You'll Feel the Difference */}
                    <div className={styles.differenceSection}>
                        <h3 className={styles.subsectionTitle}>
                            {`Why You'll Feel the Difference`}
                        </h3>
                        <p className={styles.paragraph}>
                            {`QueueHire is not just a platform. It's freedom.
                            Freedom to be seen. To connect instantly. To earn
                            fairly. To build your work life without gatekeepers,
                            fees, or algorithms getting in your way.`}
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
                            Skip the rules - and finally get matched like you
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
