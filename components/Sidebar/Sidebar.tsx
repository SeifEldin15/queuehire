"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Star, Settings, Zap, ExternalLink, Menu, X } from "lucide-react";
import styles from "./Sidebar.module.css";
import { supabase } from "@/lib/supabaseClient";


export default function Sidebar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
	const [userEmail, setUserEmail] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const pathname = usePathname();
	const router = useRouter();

	    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setProfile(null);
				setUserEmail("");
                setIsLoading(false);
                return;
            }
		    setUserEmail(user.email || ""); // <-- Get email from Auth
            
            // Fetch from 'users' table (not 'profiles')
            const { data, error } = await supabase
                .from("users")
                .select("id, full_name, profile_image, professional_bio, skills_expertise, user_type")
                .eq("id", user.id)
                .single();
            
            if (error) {
                console.error('Error fetching user profile:', error);
                setProfile(null);
            } else {
                console.log('User profile loaded:', data);
                setProfile(data);
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

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
                            {isLoading ? (
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
                                {isLoading 
                                    ? "Loading..." 
                                    : profile?.full_name || userEmail?.split('@')[0] || "User"}
                            </h3>
							<p className={styles.userEmail}>
								{isLoading ? "Loading..." : userEmail || "user@email.com"}
							</p>
							<Link
								href="/profile"
								className={styles.profileLink}
							>
								{isLoading 
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
