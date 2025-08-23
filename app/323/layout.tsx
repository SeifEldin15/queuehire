"use client";
import type React from "react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			setIsAuthenticated(!!user);
		};
		
		checkAuth();

		// Listen for auth state changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			setIsAuthenticated(!!session);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Show a minimal layout for unauthenticated users
	if (isAuthenticated === false) {
		return (
			<div className={styles.guestLayout}>
				<main className={styles.guestMainContent}>{children}</main>
			</div>
		);
	}

	// Show full layout with sidebar for authenticated users
	return (
		<div className={styles.dashboardLayout}>
			<Sidebar />
			<main className={styles.mainContent}>{children}</main>
		</div>
	);
}
