"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";


export default function HomePage() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const faqItems = [
        {
            question: "How does this work exactly?",
            answer: "QueueHire connects job seekers and recruiters instantly through our smart matching algorithm. Simply sign up, select your skills, and get matched with relevant opportunities in minutes.",
        },
        {
            question: "What are the fees involved?",
            answer: "Unlike other platforms, QueueHire charges no commission fees. You keep 100% of what you earn. We operate on a simple subscription model with transparent pricing.",
        },
        {
            question: "How long does the matching process take?",
            answer: "Our matching process is designed to be instant. Once you're in the queue, you can expect to be matched with relevant opportunities within 5 minutes during peak hours.",
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes, absolutely! You can cancel your subscription at any time with no hidden fees or cancellation charges. Your access will continue until the end of your billing period.",
        },
        {
            question: "Do you offer customer support?",
            answer: "Yes, we provide dedicated customer support through multiple channels including live chat, email, and our Discord community. Our team is here to help you succeed.",
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className={styles.container}>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        <h1 className={styles.heroTitle}>
                            Screw the fees.
                            <br />
                            Queue. Match.
                            <br />
                            <span className={styles.highlight}>
                                Interview Instantly
                            </span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Upwork and Fiverr are slow, expensive solutions, and
                            frankly quite different. No service fees. No endless 
                            waiting. Find your match in a call instantly — 5 minutes 
                            free, every day.
                        </p>
                        <div className={styles.heroButtons}>
                            <Link href="/register/seeker">
                                <button className={styles.primaryBtn}>
                                    Find Work Instantly
                                </button>
                            </Link>
                            <Link href="/register/recruiter">
                                <button className={styles.secondaryBtn}>
                                    Hire Someone Now
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroRight}>
                        <div className={styles.heroIllustration}>
                            <div className={styles.illustrationCard}>
                                <div className={styles.cardHeader}></div>
                                <div className={styles.cardContent}>
                                    <div className={styles.contentLine}></div>
                                    <div className={styles.contentLine}></div>
                                    <div className={styles.contentLine}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className={styles.howItWorks}>
                <div className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle}>{`Here's How it Works`}</h2>
                    <p className={styles.sectionSubtitle}>
                        Find out what QueueHire is and all that buzz is about
                    </p>

                    <div className={styles.stepsGrid}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>1</div>
                            <h3 className={styles.stepTitle}>Sign Up</h3>
                            <p className={styles.stepDescription}>
                                Join our platform in less than 2 minutes. Quick,
                                simple, and straightforward registration
                                process.
                            </p>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>2</div>
                            <h3 className={styles.stepTitle}>Choose Skills</h3>
                            <p className={styles.stepDescription}>
                                Select from a wide range of skills of the
                                desired candidate or showcase your own
                                expertise.
                            </p>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>3</div>
                            <h3 className={styles.stepTitle}>Queue Up!</h3>
                            <p className={styles.stepDescription}>
                                Wait to see best fit according to the skills you
                                selected. Get matched instantly with perfect
                                candidates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why We Are Better Section */}
            <section className={styles.whyBetter}>
                <div className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle}>
                        Why We Are{" "}
                        <span className={styles.highlight}>Much</span> Better
                    </h2>

                    <div className={styles.newComparisonGrid}>
                        <div className={styles.newComparisonCard}>
                            <div className={styles.cardIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="2"
                                        y="3"
                                        width="20"
                                        height="14"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <circle
                                        cx="8"
                                        cy="10"
                                        r="2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M14 10h4M14 13h2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            <h3 className={styles.newComparisonTitle}>
                                Instant Matching, No Endless Scrolling
                            </h3>
                            <div className={styles.newComparisonContent}>
                                <div className={styles.queuehireSection}>
                                    <h4 className={styles.queuehireLabel}>
                                        With QueueHire
                                    </h4>
                                    <p>
                                        {`Click on that 'Queue' button and
                                        instantly find yourself in an interview
                                        on the platform itself.`}
                                    </p>
                                    <p>
                                        No need to schedule. No text based chat.
                                    </p>
                                </div>
                                <div className={styles.competitorSection}>
                                    <h4 className={styles.competitorLabel}>
                                        With Fiverr/Upwork
                                    </h4>
                                    <p>
                                        You spend hours scrolling, filtering,
                                        messaging, and still might not find the
                                        right fit.
                                    </p>
                                    <p>
                                        Fake profiles. Primarily text based
                                        communication.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.newComparisonCard}>
                            <div className={styles.cardIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M12 6v6l4 2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M8 12h8"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            <h3 className={styles.newComparisonTitle}>
                                0% Commission, No Hidden Fees
                            </h3>
                            <div className={styles.newComparisonContent}>
                                <div className={styles.queuehireSection}>
                                    <h4 className={styles.queuehireLabel}>
                                        With QueueHire
                                    </h4>
                                    <p>
                                        We do not charge any fees to use
                                        QueueHire.
                                    </p>
                                    <p>
                                        We make our money only from pro users
                                        that love our service and constantly
                                        hiring or seeking clients!
                                    </p>
                                </div>
                                <div className={styles.competitorSection}>
                                    <h4 className={styles.competitorLabel}>
                                        With Fiverr/Upwork
                                    </h4>
                                    <p>
                                        Both clients and freelancers must pay a
                                        fee. Moving to another platform will get
                                        you banned.
                                    </p>
                                    <p>
                                        Connects in Upwork charge for sending
                                        proposals alone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.newComparisonCard}>
                            <div className={styles.cardIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </svg>
                            </div>
                            <h3 className={styles.newComparisonTitle}>
                                Lightning Fast Responses
                            </h3>
                            <div className={styles.newComparisonContent}>
                                <div className={styles.queuehireSection}>
                                    <h4 className={styles.queuehireLabel}>
                                        With QueueHire
                                    </h4>
                                    <p>
                                        Get matched and start interviewing
                                        within 5 minutes of joining the queue.
                                    </p>
                                    <p>
                                        Real-time notifications and instant
                                        connections.
                                    </p>
                                </div>
                                <div className={styles.competitorSection}>
                                    <h4 className={styles.competitorLabel}>
                                        With Fiverr/Upwork
                                    </h4>
                                    <p>
                                        Wait days or weeks for responses to
                                        proposals and applications.
                                    </p>
                                    <p>
                                        Slow approval processes and delayed
                                        communications.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.newComparisonCard}>
                            <div className={styles.cardIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9 12l2 2 4-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            <h3 className={styles.newComparisonTitle}>
                                Quality Over Quantity
                            </h3>
                            <div className={styles.newComparisonContent}>
                                <div className={styles.queuehireSection}>
                                    <h4 className={styles.queuehireLabel}>
                                        With QueueHire
                                    </h4>
                                    <p>
                                        Smart algorithm ensures you only see
                                        relevant, high-quality matches.
                                    </p>
                                    <p>
                                        Verified profiles and skill-based
                                        matching system.
                                    </p>
                                </div>
                                <div className={styles.competitorSection}>
                                    <h4 className={styles.competitorLabel}>
                                        With Fiverr/Upwork
                                    </h4>
                                    <p>
                                        Overwhelmed with thousands of irrelevant
                                        profiles and fake accounts.
                                    </p>
                                    <p>
                                        Difficult to filter through low-quality
                                        submissions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.comparisonCTA}>
                        <p className={styles.comparisonQuestion}>
                            Want to see a full detailed comparison?
                        </p>
                        <Link href="/comparison">
                            <button className={styles.comparisonBtn}>
                                See Comparison
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.faq}>
                <div className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle}>
                        Frequently Asked Questions
                    </h2>
                    <div className={styles.faqList}>
                        {faqItems.map((item, index) => (
                            <div key={index} className={styles.faqItem}>
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span>{item.question}</span>
                                    <ChevronDown
                                        size={20}
                                        className={`${styles.faqIcon} ${
                                            openFAQ === index
                                                ? styles.faqIconOpen
                                                : ""
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`${styles.faqAnswer} ${
                                        openFAQ === index
                                            ? styles.faqAnswerOpen
                                            : ""
                                    }`}
                                >
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className={styles.community}>
                <div className={styles.sectionContainer}>
                    <div className={styles.communityCard}>
                        <div className={styles.communityLeft}>
                            <div className={styles.communityIllustration}></div>
                        </div>
                        <div className={styles.communityRight}>
                            <h2 className={styles.communityTitle}>
                                Join the Community!
                            </h2>
                            <p className={styles.communityText}>
                                Make sure you join our Discord server to connect
                                with others and join the journey as we build and
                                grow QueueHire together!
                            </p>
                            <p className={styles.communitySubtext}>
                                This software is built by one person, and not a
                                team!
                            </p>
                            <Link href="/register">
                                <button className={styles.communityBtn}>
                                    Join Now!
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
