"use client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Clock,
    Zap,
    Star,
    Settings,
    ArrowRight,
    User,
} from "lucide-react";
import styles from "./page.module.css";

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    // Don't redirect here - let middleware handle auth
    // If we reach this point, middleware has already verified authentication
    if (!user || !profile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div className={styles.welcome}>
                    <h1>Welcome back, {profile.full_name || profile.email?.split('@')[0] || 'User'}!</h1>
                    <p>Here's your QueueHire dashboard</p>
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userType}>
                        {profile.user_type === 'job_seeker' ? 'Job Seeker' : 'Hiring Manager'}
                    </div>
                    <div className={styles.plan}>
                        Plan: {profile.plan_type}
                    </div>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <User size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>Profile</h3>
                        <p>{profile.full_name || profile.email ? 'Complete' : 'Incomplete'}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Star size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>Plan</h3>
                        <p>{profile.plan_type}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3>Member Since</h3>
                        <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className={styles.actionsGrid}>
                <Link href="/dashboard/settings" className={styles.actionCard}>
                    <Settings size={32} />
                    <h3>Settings</h3>
                    <p>Manage your profile and preferences</p>
                    <ArrowRight size={20} />
                </Link>

                <Link href="/dashboard/favorites" className={styles.actionCard}>
                    <Star size={32} />
                    <h3>Favorites</h3>
                    <p>View your saved contacts</p>
                    <ArrowRight size={20} />
                </Link>

                <Link href="/dashboard/upgrade" className={styles.actionCard}>
                    <Zap size={32} />
                    <h3>Upgrade</h3>
                    <p>Enhance your QueueHire experience</p>
                    <ArrowRight size={20} />
                </Link>
            </div>

            {profile.user_type === 'job_seeker' && profile.skills_expertise && (
                <div className={styles.skillsSection}>
                    <h2>Your Skills</h2>
                    <div className={styles.skillsTags}>
                        {profile.skills_expertise.split(',').map((skill, index) => (
                            <span key={index} className={styles.skillTag}>
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {profile.user_type === 'hiring' && profile.required_skills && (
                <div className={styles.skillsSection}>
                    <h2>Skills You're Looking For</h2>
                    <div className={styles.skillsTags}>
                        {profile.required_skills.split(',').map((skill, index) => (
                            <span key={index} className={styles.skillTag}>
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.profileSection}>
                <h2>Profile Information</h2>
                <div className={styles.profileDetails}>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>User Type:</strong> {profile.user_type === 'job_seeker' ? 'Job Seeker' : 'Hiring Manager'}</p>
                    <p><strong>Plan:</strong> {profile.plan_type}</p>
                    {profile.professional_bio && (
                        <p><strong>Bio:</strong> {profile.professional_bio}</p>
                    )}
                    {profile.phone && (
                        <p><strong>Phone:</strong> {profile.phone}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
