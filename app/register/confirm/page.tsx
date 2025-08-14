// pages/page.tsx\
"use client"
import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { PendingProfile } from "@/lib/types";

export default function FinalRegistrationPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const { signUp } = useAuth();

    // Extract profile data from query params
    const fullName = searchParams.get("fullName") || "";
    const skills = searchParams.get("skills") || "";
    const skills_needed = searchParams.get("skills_needed") || "";
    const bio = searchParams.get("bio") || "";
    const profile_image = searchParams.get("profile_image") || "";
    const role = searchParams.get("role") || "job_seeker";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        
        setLoading(true);
        
        try {
            // Save profile data to localStorage for after email verification
            const pendingProfile: PendingProfile = {
                fullName,
                role: role as 'job_seeker' | 'hiring',
                skills: skills || undefined,
                skills_needed: skills_needed || undefined,
                bio: bio || undefined,
                profile_image: profile_image || undefined,
            };
            localStorage.setItem("pendingProfile", JSON.stringify(pendingProfile));

            const { error } = await signUp(email, password, {
                full_name: fullName,
                user_type: role,
            });
            
            if (error) {
                setError(error.message);
            } else {
                setShowVerificationMessage(true);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            // Save profile data for Google OAuth
            const pendingProfile: PendingProfile = {
                fullName,
                role: role as 'job_seeker' | 'hiring',
                skills: skills || undefined,
                skills_needed: skills_needed || undefined,
                bio: bio || undefined,
                profile_image: profile_image || undefined,
            };
            localStorage.setItem("pendingProfile", JSON.stringify(pendingProfile));

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            
            if (error) setError(error.message);
        } catch (err) {
            console.error("Google signup error:", err);
            setError("Failed to sign up with Google. Please try again.");
        }
    };
	return (
		<div className={styles.container}>
			<div className={styles.left}>
				<h1 className={styles.heading}>
					You are this <span className={styles.emoji}>👈</span>
					close to joining{" "}
					<span className={styles.brand}>QueueHire!</span>
				</h1>
				<p className={styles.subtext}>
					You will have found your perfect match today. That’s our
					guarantee…
				</p>
			</div>
			<div className={styles.right}>
                <form className={styles.form} onSubmit={handleRegister}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <label className={styles.label}>Confirm Password</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && <div className={styles.error}>{error}</div>}
                    {showVerificationMessage && (
                        <div className={styles.verificationMessage}>
                            Check your email for the verification link.
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            className={styles.completeBtn}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Complete Registration"}
                        </button>
                        <button
                            type="button"
                            className={styles.googleBtn}
                            onClick={handleGoogleSignUp}
                        >
                            Sign Up with Google
                        </button>
                    </div>
                </form>
				<div className={styles.switchAuth}>
					<span>Already have an account?</span>
					<Link href="/login" className={styles.switchLink}>
						Login
					</Link>
				</div>
			</div>
            {showVerificationMessage && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Verify Your Email</h2>
                        <p className={styles.modalText}>
                            We&apos;ve sent a verification link to <strong>{email}</strong>.<br/>
                            Please check your inbox and verify your email before logging in.
                        </p>
                        <p className={styles.modalNote}>
                            Once verified, you can log in with your email and password.
                        </p>
                        <button
                            className={styles.completeBtn}
                            onClick={() => router.replace("/login")}
                            style={{ marginTop: "1rem" }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
		</div>
	);
}
