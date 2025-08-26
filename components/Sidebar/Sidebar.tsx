"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Star, Settings, Zap, ExternalLink, Menu, X } from "lucide-react";
import styles from "./Sidebar.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";


export default function Sidebar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [userEmail, setUserEmail] = useState<string>("");
	const pathname = usePathname();
	const router = useRouter();
	const { user, profile, loading: authLoading } = useAuth();

	useEffect(() => {
		if (user?.email) {
			setUserEmail(user.email);
		}
	}, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
    };

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	// Automatically determine current page from pathname
	const getCurrentPage = () => {
		if (pathname === "/dashboard") return "Dashboard";
		if (pathname === "/dashboard/favorites") return "Favorites";
		if (pathname === "/dashboard/settings") return "Settings";
		if (pathname === "/dashboard/upgrade") return "Upgrade";
		return "Dashboard"; // default fallback
	};

	const currentPage = getCurrentPage();

	const menuItems = [
		{ name: "Dashboard", icon: Home, href: "/dashboard" },
		{ name: "Favorites", icon: Star, href: "/dashboard/favorites" },
		{ name: "Settings", icon: Settings, href: "/dashboard/settings" },
		{ name: "Upgrade", icon: Zap, href: "/dashboard/upgrade" },
	];

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				className={styles.mobileMenuButton}
				onClick={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
			</button>

			{/* Mobile Overlay */}
			{isMobileMenuOpen && (
				<div
					className={styles.mobileOverlay}
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`${styles.sidebar} ${
					isMobileMenuOpen ? styles.mobileOpen : ""
				}`}
			>
				<div className={styles.sidebarContent}>
					{/* Logo Section */}
					<div className={styles.logoSection}>
						<h1 className={styles.logo}>QueueHire</h1>
						<p className={styles.tagline}>
							Find your perfect match. In seconds
						</p>
						<div className={styles.divider}></div>
					</div>

					{/* User Profile Section */}
					<div className={styles.profileSection}>
						<div className={styles.avatar}>
                            {authLoading ? (
                                <span>•••</span>
                            ) : profile?.profile_image ? (
                                <img 
                                    src={profile.profile_image} 
                                    alt="Profile" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <span>
                                    {profile?.full_name
                                        ? profile.full_name[0].toUpperCase()
                                        : userEmail ? userEmail[0].toUpperCase() : "U"}
                                </span>
                            )}						
						</div>
						<div className={styles.userInfo}>
							<h3 className={styles.userName}>
                                {authLoading 
                                    ? "Loading..." 
                                    : profile?.full_name || userEmail?.split('@')[0] || "User"}
                            </h3>
							<p className={styles.userEmail}>
								{authLoading ? "Loading..." : userEmail || "user@email.com"}
							</p>
							<Link
								href="/profile"
								className={styles.profileLink}
							>
								{authLoading 
                                    ? "Profile" 
                                    : profile?.user_type === 'hiring' ? 'Recruiter Profile' : 'Seeker Profile'}
							</Link>
						</div>
					</div>

					<div className={styles.divider}></div>

					{/* Navigation Menu */}
					<nav className={styles.navigation}>
						<ul className={styles.navList}>
							{menuItems.map((item) => {
								const Icon = item.icon;
								const isActive = currentPage === item.name;

								return (
									<li key={item.name}>
										<Link
											href={item.href}
											className={`${styles.navItem} ${
												isActive ? styles.active : ""
											}`}
											onClick={() =>
												setIsMobileMenuOpen(false)
											}
										>
											<Icon
												size={20}
												className={styles.navIcon}
											/>
											<span>{item.name}</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* Action Buttons */}
					<div className={styles.actionButtons}>
						<Link href="/dashboard">
							<button
								className={styles.queueButton}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Queue Now
							</button>
						</Link>
							<button
								className={styles.signOutButton}
								onClick={handleSignOut}
							>
								Sign Out
								<ExternalLink
									size={16}
									className={styles.externalIcon}
								/>
							</button>
					</div>
				</div>
			</aside>
		</>
	);
}
