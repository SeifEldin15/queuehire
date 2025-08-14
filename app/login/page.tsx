"use client";
import styles from "../register/confirm/page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { PendingProfile } from "@/lib/types";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    
    const { signIn, user, profile, updateProfile } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (user && profile) {
            router.push("/dashboard");
        }
    }, [user, profile, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setShowVerifyModal(false);
        
        try {
            const { error: signInError } = await signIn(email, password);
            
            if (signInError) {
                console.log("Login error:", signInError);
                if (
                    signInError.message?.toLowerCase().includes("email not confirmed") ||
                    signInError.message?.toLowerCase().includes("confirm") ||
                    signInError.message?.toLowerCase().includes("verify")
                ) {
                    setShowVerifyModal(true);
                } else {
                    setError(signInError.message);
                }
                setLoading(false);
                return;
            }

            // Check if there's a pending profile to complete
            const pendingProfileStr = localStorage.getItem("pendingProfile");
            if (pendingProfileStr) {
                try {
                    const pendingProfile: PendingProfile = JSON.parse(pendingProfileStr);
                    
                    if (pendingProfile.fullName) {
                        console.log("Completing profile with pending data");
                        
                        await updateProfile({
                            user_type: pendingProfile.role,
                            full_name: pendingProfile.fullName,
                            skills_expertise: pendingProfile.role === "job_seeker" ? pendingProfile.skills : undefined,
                            required_skills: pendingProfile.role === "hiring" ? pendingProfile.skills_needed : undefined,
                            professional_bio: pendingProfile.bio || "",
                            profile_image: pendingProfile.profile_image || "",
                        });
                        
                        localStorage.removeItem("pendingProfile");
                    }
                } catch (e) {
                    console.error("Error parsing pendingProfile:", e);
                }
            }

            // Will redirect via useEffect once user/profile are set
        } catch (err) {
            console.error("Unexpected error during login:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Resend verification email
    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendMessage("");
        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
        });
        setResendLoading(false);
        if (error) {
            setResendMessage("Failed to resend email. Try again later.");
        } else {
            setResendMessage("Verification email sent! Please check your inbox.");
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className={styles.container}>
            {/* Add the modal here, inside the return */}
            {showVerifyModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <span className={styles.modalClose} onClick={() => setShowVerifyModal(false)}>&times;</span>
                        <h2 className={styles.modalTitle}>Verify Your Email</h2>
                        <p className={styles.modalText}>
                            You need to verify your email address before logging in.<br />
                            Please check your inbox for a confirmation email.
                        </p>
                        <button
                            className={styles.completeBtn}
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            style={{ marginBottom: "1rem" }}
                        >
                            {resendLoading ? "Resending..." : "Resend Verification Email"}
                        </button>
                        {resendMessage && (
                            <div className={styles.modalMessage}>{resendMessage}</div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Rest of your existing return content */}
            <div className={styles.left}>
                <h1 className={styles.heading}>
                    Welcome Back <span className={styles.emoji}>👋</span>
                    <br />
                    <span className={styles.brand}>QueueHire</span>
                </h1>
                <p className={styles.subtext}>
                    Log in to your account to continue your journey.
                </p>
            </div>
            <div className={styles.right}>
                <form className={styles.form} onSubmit={handleLogin}>
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
                    <div className={styles.forgotPassword}>
                        <Link href="/password-reset" className={styles.switchLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            className={styles.completeBtn}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <button
                            type="button"
                            className={styles.googleBtn}
                            onClick={handleGoogleLogin}
                        >
                            Login with Google
                        </button>
                    </div>
                </form>
                <div className={styles.switchAuth}>
                    <span>Don't have an account?</span>
                    <Link href="/register/confirm" className={styles.switchLink}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}