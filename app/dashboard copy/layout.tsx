import type React from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className={styles.dashboardLayout}>
			<Sidebar />
			<main className={styles.mainContent}>{children}</main>
		</div>
	);
}
