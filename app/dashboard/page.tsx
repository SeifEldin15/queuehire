"use client";
import { useState, useEffect, useRef } from "react";
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
import { DatabaseService } from "@/lib/database";
import { UserProfile } from "@/lib/types";

type QueueStage = "idle" | "searching" | "found" | "connecting";

export default function DashboardPage() {
    const [queueStage, setQueueStage] = useState<QueueStage>("idle");
    const [searchTime, setSearchTime] = useState(0);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [savedContactsCount, setSavedContactsCount] = useState(0);
    const router = useRouter();
    
    // Use refs to store timeouts so they don't get cleared by re-renders
    const timeoutsRef = useRef<{
        found?: NodeJS.Timeout;
        connecting?: NodeJS.Timeout;
        redirect?: NodeJS.Timeout;
        interval?: NodeJS.Timeout;
    }>({});

    // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
    
    // Function to fetch saved contacts count
    const fetchSavedContactsCount = async (userId: string) => {
        const count = await DatabaseService.getSavedContactsCount(userId);
        setSavedContactsCount(count);
    };
    
    // Auth and profile fetch effect
    useEffect(() => {
        const checkAuthAndProfile = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    // // console.log("No user found, redirecting to login");
                    router.replace("/login");
                    return;
                }

                // // console.log("User authenticated in dashboard:", user.id);
                // // console.log("Full user object:", user);  // Let's see the complete user object

                // Check for pendingProfile in localStorage
                const pendingProfileStr = localStorage.getItem("pendingProfile");
                // // console.log("Dashboard - pendingProfile in localStorage:", pendingProfileStr);

                const data = await DatabaseService.getUserProfile(user.id);
                // // console.log("Profile data in dashboard:", data);
                
                if (!data) {
                    // Try to create a basic profile if no profile exists
                    // // console.log("No profile found, attempting to create one");
                    const pendingProfile = JSON.parse(localStorage.getItem("pendingProfile") || "{}");
                    
                    if (pendingProfile.fullName) {
                        const { error: upsertError } = await supabase.from("users").upsert({
                            id: user.id,
                            email: user.email,
                            user_type: pendingProfile.role || "job_seeker",
                            full_name: pendingProfile.fullName,
                            skills_expertise: pendingProfile.role === "job_seeker" ? pendingProfile.skills : null,
                            required_skills: pendingProfile.role === "hiring" ? pendingProfile.skills_needed : null,
                            professional_bio: pendingProfile.bio || "",
                            profile_image: pendingProfile.profile_image || "",
                            plan_type: "Free"
                        });
                        
                        if (upsertError) {
                            console.error("Failed to create profile:", upsertError);
                            router.replace("/register");
                            return;
                        }
                        
                        // Fetch the newly created profile
                        const { data: newProfile } = await supabase
                            .from("users")
                            .select("*")
                            .eq("id", user.id)
                            .maybeSingle();
                            
                        if (newProfile) {
                            setProfile(newProfile);
                            fetchSavedContactsCount(user.id);
                            localStorage.removeItem("pendingProfile");
                        } else {
                            router.replace("/register");
                            return;
                        }
                    } else {
                        // No profile data available
                        router.replace("/register");
                        return;
                    }
                } else {
                    setProfile(data);
                    // Fetch saved contacts count
                    fetchSavedContactsCount(user.id);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                router.replace("/login");
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
        // Clear any existing timeouts
        const clearAllTimeouts = () => {
            if (timeoutsRef.current.interval) clearInterval(timeoutsRef.current.interval);
            if (timeoutsRef.current.found) clearTimeout(timeoutsRef.current.found);
            if (timeoutsRef.current.connecting) clearTimeout(timeoutsRef.current.connecting);
            if (timeoutsRef.current.redirect) clearTimeout(timeoutsRef.current.redirect);
            timeoutsRef.current = {};
        };

        if (queueStage === "searching") {
            // Clear any existing timeouts first
            clearAllTimeouts();
            
            // Start the timer
            timeoutsRef.current.interval = setInterval(() => {
                setSearchTime((prev) => prev + 1);
            }, 1000);

            // Set stage transitions
            timeoutsRef.current.found = setTimeout(() => {
                // // console.log("Setting stage to found");
                setQueueStage("found");
            }, 8000);
            
            timeoutsRef.current.connecting = setTimeout(() => {
                // // console.log("Setting stage to connecting");
                setQueueStage("connecting");
            }, 8500);
            
            timeoutsRef.current.redirect = setTimeout(() => {
                // // console.log("Redirecting to meeting");
                router.push("/meeting/cxriq7kifsi");
            }, 9500);
        } else if (queueStage === "idle") {
            clearAllTimeouts();
        }

        return () => {
            // Only clear if we're unmounting, not on stage changes
            if (queueStage === "idle") {
                clearAllTimeouts();
            }
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

    // If no profile after loading, show error (this shouldn't happen due to redirects)
    if (!profile) {
        return (
            <div className={styles.container}>
                <div className={styles.errorWrapper}>
                    <p>Unable to load profile. Please try refreshing.</p>
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
        // // console.log("Starting queue");
        setQueueStage("searching");
        setSearchTime(0);
    };

    const handleCancelQueue = () => {
        // // console.log("Cancelling queue");
        // Clear all timeouts when cancelling
        if (timeoutsRef.current.interval) clearInterval(timeoutsRef.current.interval);
        if (timeoutsRef.current.found) clearTimeout(timeoutsRef.current.found);
        if (timeoutsRef.current.connecting) clearTimeout(timeoutsRef.current.connecting);
        if (timeoutsRef.current.redirect) clearTimeout(timeoutsRef.current.redirect);
        timeoutsRef.current = {};
        
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
    if (profile.user_type === "job_seeker" && profile.skills_expertise) {
        skills = profile.skills_expertise.split(",").map((s: string) => s.trim());
    } else if (profile.user_type === "hiring" && profile.required_skills) {
        skills = profile.required_skills.split(",").map((s: string) => s.trim());
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
                        {profile.user_type === "job_seeker"
                            ? "Ready to find your next opportunity?"
                            : "Ready to find your next great hire?"}
                    </p>
                </div>
                <div className={styles.timeRemaining}>
                    <div className={styles.timeCard}>
                        <Clock size={20} className={styles.timeIcon} />
                        <div>
                            <p className={styles.timeLabel}>
                                Your Plan:
                            </p>
                            <p className={styles.timeValue}>{profile.plan_type} Plan</p>
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
                                <span className={styles.statNumber}>{savedContactsCount}</span>
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
                            {profile.plan_type}
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
                            {profile.user_type === "job_seeker"
                                ? "Your Skills:"
                                : "Skills You're Looking For:"}
                        </h2>
                        <p className={styles.skillsSubtext}>
                            {profile.user_type === "job_seeker"
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
                        {profile.user_type === "job_seeker" 
                            ? "Ready to find the perfect job?"
                            : "Ready to find the perfect candidate?"}
                    </h2>
                    <p className={styles.queueDescription}>
                        {profile.user_type === "job_seeker"
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