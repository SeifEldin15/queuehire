"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Clock,
    Zap,
    Star,
    Settings,
    Edit3,
    ArrowRight,
    Sparkles,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
    id: string;
    role: "seeker" | "recruiter";
    full_name: string;
    skills?: string;
    skills_needed?: string;
    bio?: string;
    profile_image?: string;
    minutes_last_reset?: string;
    minutes_remaining?: number;
    plan?: string;
};

type QueueStage = "idle" | "searching" | "found" | "connecting";

export default function DashboardPage() {
    const [queueStage, setQueueStage] = useState<QueueStage>("idle");
    const [searchTime, setSearchTime] = useState(0);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
    
    // Auth and profile fetch effect
    useEffect(() => {
        const checkAuthAndProfile = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    console.log("No user found, showing guest view");
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                console.log("User authenticated in dashboard:", user.id);
                console.log("Full user object:", user);

                // Check for pendingProfile in localStorage
                const pendingProfileStr = localStorage.getItem("pendingProfile");
                console.log("Dashboard - pendingProfile in localStorage:", pendingProfileStr);

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();
                    
                console.log("Profile data in dashboard:", data);
                console.log("Profile error in dashboard:", error);
                
                if (!data) {
                    // Try to create a basic profile if no profile exists
                    console.log("No profile found, attempting to create one");
                    const pendingProfile = JSON.parse(localStorage.getItem("pendingProfile") || "{}");
                    
                    if (pendingProfile.fullName) {
                        const { error: upsertError } = await supabase.from("profiles").upsert({
                            id: user.id,
                            role: pendingProfile.role || "seeker",
                            full_name: pendingProfile.fullName,
                            skills: pendingProfile.role === "seeker" ? pendingProfile.skills : null,
                            skills_needed: pendingProfile.role === "recruiter" ? pendingProfile.skills_needed : null,
                            bio: pendingProfile.bio || "",
                            profile_image: pendingProfile.profile_image || "",
                            minutes_remaining: 15,
                            plan: "free",
                            minutes_last_reset: new Date().toISOString()
                        });
                        
                        if (upsertError) {
                            console.error("Failed to create profile:", upsertError);
                            // Don't redirect, just show guest view
                            setProfile(null);
                            setLoading(false);
                            return;
                        }
                        
                        // Fetch the newly created profile
                        const { data: newProfile } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("id", user.id)
                            .maybeSingle();
                            
                        if (newProfile) {
                            setProfile(newProfile);
                            localStorage.removeItem("pendingProfile");
                        } else {
                            // Don't redirect, just show guest view
                            setProfile(null);
                        }
                    } else {
                        // No profile data available, show guest view
                        setProfile(null);
                    }
                } else {
                    setProfile(data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                // Don't redirect on error, just show guest view
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndProfile();
    }, [router]);

        // Add this after you setProfile(data) in your useEffect
        // useEffect(() => {
        //     if (!profile) return;

        //     const now = new Date();
        //     const lastReset = profile.minutes_last_reset
        //         ? new Date(profile.minutes_last_reset)
        //         : null;

        //     // Plan minutes mapping
        //     const planMinutes: Record<string, number> = {
        //         free: 15,
        //         essential: 60,
        //         power: 180,
        //         pro: 9999, // or whatever you want for unlimited
        //     };

        //     // If more than 24 hours since last reset, reset minutes
        //     if (
        //         !lastReset ||
        //         now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000
        //     ) {
        //         const newMinutes =
        //             planMinutes[profile.plan?.toLowerCase() || "free"] || 15;
        //         supabase
        //             .from("profiles")
        //             .update({
        //                 minutes_remaining: newMinutes,
        //                 minutes_last_reset: now.toISOString(),
        //             })
        //             .eq("id", profile.id)
        //             .then(() => {
        //                 setProfile((prev) =>
        //                     prev
        //                         ? {
        //                             ...prev,
        //                             minutes_remaining: newMinutes,
        //                             minutes_last_reset: now.toISOString(),
        //                         }
        //                         : prev
        //                 );
        //             });
        //     }
        //     // eslint-disable-next-line
        // }, [profile]);


    // Queue timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (queueStage === "searching") {
            interval = setInterval(() => {
                setSearchTime((prev) => prev + 1);
            }, 1000);

            // Simulate matchmaking stages
            const foundTimeout = setTimeout(() => setQueueStage("found"), 8000);
            const connectingTimeout = setTimeout(() => setQueueStage("connecting"), 10000);
            const redirectTimeout = setTimeout(() => {
                // Generate unique meeting ID and redirect
                const meetingId = Math.random().toString(36).substring(2, 15);
                router.push(`/meeting/${meetingId}`);
            }, 12000);

            // Cleanup function to clear all timeouts
            return () => {
                clearInterval(interval);
                clearTimeout(foundTimeout);
                clearTimeout(connectingTimeout);
                clearTimeout(redirectTimeout);
            };
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [queueStage, router]);

    // ✅ NOW it's safe to do conditional rendering AFTER all hooks
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner}></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // If no profile after loading, show guest/unauthenticated view
    if (!profile) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.greeting}>
                        <h1 className={styles.welcomeText}>
                            Welcome to QueueHire!
                        </h1>
                        <p className={styles.subtitle}>
                            The fastest way to connect job seekers with recruiters
                        </p>
                    </div>
                </div>

                <div className={styles.guestContent}>
                    <div className={styles.guestMessage}>
                        <h2>Join QueueHire Today</h2>
                        <p>Sign up or log in to access the full dashboard experience and start connecting with opportunities or candidates.</p>
                        
                        <div className={styles.guestActions}>
                            <Link href="/login" className={styles.loginButton}>
                                Log In
                            </Link>
                            <Link href="/register" className={styles.signupButton}>
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    <div className={styles.featuresPreview}>
                        <h3>What you'll get access to:</h3>
                        <div className={styles.featuresList}>
                            <div className={styles.featureItem}>
                                <Star size={20} />
                                <span>Save favorite contacts</span>
                            </div>
                            <div className={styles.featureItem}>
                                <Settings size={20} />
                                <span>Customize your profile & skills</span>
                            </div>
                            <div className={styles.featureItem}>
                                <Zap size={20} />
                                <span>Instant matching with AI</span>
                            </div>
                            <div className={styles.featureItem}>
                                <Clock size={20} />
                                <span>Quick video interviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Helper functions
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) return "Good Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        if (hour < 22) return "Good Evening";
        return "Good Night";
    };

    const handleQueueUp = () => {
        // Only allow queue functionality for authenticated users with profiles
        if (!profile) {
            // Redirect to login if not authenticated
            router.push("/login");
            return;
        }
        
        setQueueStage("searching");
        setSearchTime(0);
    };

    const handleCancelQueue = () => {
        setQueueStage("idle");
        setSearchTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // Dynamic name
    const userName = profile.full_name || "User";

    // Dynamic skills (for seeker or recruiter)
    let skills: string[] = [];
    if (profile.role === "seeker" && profile.skills) {
        skills = profile.skills.split(",").map((s: string) => s.trim());
    } else if (profile.role === "recruiter" && profile.skills_needed) {
        skills = profile.skills_needed.split(",").map((s: string) => s.trim());
    }

    // Show queue overlay when searching
    if (queueStage !== "idle") {
        return (
            <div className={styles.queueOverlay}>
                <div className={styles.queueContent}>
                    <div className={styles.queueAnimation}>
                        <div className={styles.pulseRing}></div>
                        <div className={styles.pulseRing}></div>
                        <div className={styles.pulseRing}></div>
                        <div className={styles.centerIcon}>
                            <User size={48} />
                        </div>
                    </div>

                    <div className={styles.queueText}>
                        {queueStage === "searching" && (
                            <>
                                <h2>Finding your perfect match...</h2>
                                <p>Searching for candidates with matching skills</p>
                            </>
                        )}
                        {queueStage === "found" && (
                            <>
                                <h2>Match found!</h2>
                                <p>Found a perfect candidate for you</p>
                            </>
                        )}
                        {queueStage === "connecting" && (
                            <>
                                <h2>Connecting...</h2>
                                <p>Setting up your meeting</p>
                            </>
                        )}
                    </div>

                    <div className={styles.queueTimer}>
                        <Clock size={20} />
                        <span>{formatTime(searchTime)}</span>
                    </div>

                    <div className={styles.queueSteps}>
                        <div
                            className={`${styles.step} ${
                                queueStage === "searching"
                                    ? styles.active
                                    : styles.completed
                            }`}
                        >
                            <div className={styles.stepNumber}>1</div>
                            <span>Searching</span>
                        </div>
                        <div
                            className={`${styles.step} ${
                                queueStage === "found"
                                    ? styles.active
                                    : queueStage === "connecting"
                                    ? styles.completed
                                    : ""
                            }`}
                        >
                            <div className={styles.stepNumber}>2</div>
                            <span>Match Found</span>
                        </div>
                        <div
                            className={`${styles.step} ${
                                queueStage === "connecting" ? styles.active : ""
                            }`}
                        >
                            <div className={styles.stepNumber}>3</div>
                            <span>Connecting</span>
                        </div>
                    </div>

                    <button
                        className={styles.cancelQueueBtn}
                        onClick={handleCancelQueue}
                    >
                        Cancel Queue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.greeting}>
                    <h1 className={styles.welcomeText}>
                        {getGreeting()} {userName}!
                    </h1>
                    <p className={styles.subtitle}>
                        {profile.role === "seeker"
                            ? "Ready to find your next opportunity?"
                            : "Ready to find your next great hire?"}
                    </p>
                </div>
                <div className={styles.timeRemaining}>
                    <div className={styles.timeCard}>
                        <Clock size={20} className={styles.timeIcon} />
                        <div>
                            <p className={styles.timeLabel}>
                                Minutes Remaining Today:
                            </p>
                            <p className={styles.timeValue}>{profile.minutes_remaining} Minutes Left</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.quickActions}>
                <Link href="/dashboard/favorites" className={styles.actionCard}>
                    <div className={`${styles.card} ${styles.favorites}`}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>Favorites</h3>
                                <Star size={24} className={styles.cardIcon} />
                            </div>
                            <p>See your saved contacts</p>
                            <div className={styles.cardStats}>
                                <span className={styles.statNumber}>3</span>
                                <span className={styles.statLabel}>
                                    saved contacts
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/settings" className={styles.actionCard}>
                    <div className={`${styles.card} ${styles.settings}`}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>Settings</h3>
                                <Settings size={24} className={styles.cardIcon} />
                            </div>
                            <p>Adjust your profile & skills</p>
                            <div className={styles.cardStats}>
                                <span className={styles.statNumber}>{skills.length}</span>
                                <span className={styles.statLabel}>
                                    skills selected
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/upgrade" className={styles.actionCard}>
                    <div className={`${styles.card} ${styles.upgrade}`}>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>Upgrade</h3>
                                <Zap size={24} className={styles.cardIcon} />
                            </div>
                            <p>Unlock more of QueueHire</p>
                            <div className={styles.cardStats}>
                            <span className={styles.statNumber}>
                            {profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Free"}
                            </span>
                            <span className={styles.statLabel}>
                            current plan
                            </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className={styles.skillsSection}>
                <div className={styles.skillsHeader}>
                    <div>
                        <h2>
                            {profile.role === "seeker"
                                ? "Your Skills:"
                                : "Skills You're Looking For:"}
                        </h2>
                        <p className={styles.skillsSubtext}>
                            {profile.role === "seeker"
                                ? "You may select up to 8 skills to help you match faster"
                                : "List the skills you need in candidates"}
                        </p>
                    </div>
                    <Link href={"/dashboard/settings"}>
                        <button className={styles.editButton}>
                            Edit
                            <Edit3 size={14} />
                        </button>
                    </Link>
                </div>

                <div className={styles.skillsTags}>
                    {skills.length > 0 ? (
                        skills.map((skill, idx) => (
                            <span key={idx} className={styles.skillTag}>
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className={styles.skillTag}>No skills added yet</span>
                    )}
                </div>
            </div>

            <div className={styles.queueSection}>
                <div className={styles.queueSectionContent}>
                    <div className={styles.queueIcon}>
                        <Sparkles size={48} />
                    </div>
                    <h2 className={styles.queueTitle}>
                        {profile.role === "seeker" 
                            ? "Ready to find the perfect job?"
                            : "Ready to find the perfect candidate?"}
                    </h2>
                    <p className={styles.queueDescription}>
                        {profile.role === "seeker"
                            ? "Join the queue and get matched with opportunities that fit your skills perfectly. Our AI will connect you with the best matches in seconds."
                            : "Join the queue and get matched with candidates that fit your requirements perfectly. Our AI will connect you with the best matches in seconds."}
                    </p>
                    <button
                        className={styles.queueUpButton}
                        onClick={handleQueueUp}
                    >
                        Queue Up Now
                        <ArrowRight size={20} className={styles.buttonIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}