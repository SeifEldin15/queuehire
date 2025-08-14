"use client";
import type React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import styles from "./layout.module.css";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProtectedRoute>
			<div className={styles.dashboardLayout}>
				<Sidebar />
				<main className={styles.mainContent}>{children}</main>
			</div>
		</ProtectedRoute>
	);
}
