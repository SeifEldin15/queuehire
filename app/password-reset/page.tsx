"use client";
import styles from "../register/confirm/page.module.css";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMessage("Password reset email sent! Please check your inbox.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <h1 className={styles.heading}>
                    Reset Your Password <span className={styles.emoji}>🔑</span>
                </h1>
                <p className={styles.subtext}>
                    Enter your email and we’ll send you a link to reset your password.
                </p>
            </div>
            <div className={styles.right}>
                <form className={styles.form} onSubmit={handleReset}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {error && <div className={styles.error}>{error}</div>}
                    {message && <div className={styles.success}>{message}</div>}
                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            className={styles.completeBtn}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </div>
                </form>
                <div className={styles.switchAuth}>
                    <span>Remembered your password?</span>
                    <Link href="/login" className={styles.switchLink}>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}