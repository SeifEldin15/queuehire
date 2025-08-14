"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import styles from "./Navbar.module.css";

function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const { user, profile, signOut } = useAuth();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleUserMenu = () => {
		setIsUserMenuOpen(!isUserMenuOpen);
	};

	const handleSignOut = async () => {
		await signOut();
		setIsUserMenuOpen(false);
	};

	return (
		<nav className={styles.nav}>
			<div className={styles.container}>
				<div className={styles.logoText}>
					<Link href="/">
						<p>QueueHire</p>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<ul className={styles.navList}>
					<li>
						<Link href="/about">About</Link>
					</li>
					<li>
						<Link href="/comparison">Comparison</Link>
					</li>
					<li>
						<Link href="/pricing">Pricing</Link>
					</li>
					<li>
						<Link href="/contact">Contact</Link>
					</li>
				</ul>

				{/* Desktop CTA/User Menu */}
				<div className={styles.buttonContainer}>
					{user ? (
						<div className={styles.userMenuContainer}>
							<button
								className={styles.userMenuBtn}
								onClick={toggleUserMenu}
								aria-label="User menu"
							>
								<User size={20} />
								<span>{profile?.full_name || user.email}</span>
							</button>
							
							{isUserMenuOpen && (
								<div className={styles.userDropdown}>
									<Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
										<div className={styles.dropdownItem}>
											<User size={16} />
											Dashboard
										</div>
									</Link>
									<button 
										className={styles.dropdownItem}
										onClick={handleSignOut}
									>
										<LogOut size={16} />
										Sign Out
									</button>
								</div>
							)}
						</div>
					) : (
						<>
							<Link href="/login">
								<button className={styles.loginBtn}>Login</button>
							</Link>
							<Link href="/register">
								<button>Join in 2 Minutes</button>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Button */}
				<button
					className={styles.mobileMenuBtn}
					onClick={toggleMenu}
					aria-label="Toggle mobile menu"
				>
					{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>

				{/* Mobile Navigation */}
				<div
					className={`${styles.mobileMenu} ${
						isMenuOpen ? styles.open : ""
					}`}
				>
					<ul className={styles.mobileNavList}>
						<li>
							<Link
								href="/about"
								onClick={() => setIsMenuOpen(false)}
							>
								About
							</Link>
						</li>
						<li>
							<Link
								href="/comparison"
								onClick={() => setIsMenuOpen(false)}
							>
								Comparison
							</Link>
						</li>
						<li>
							<Link
								href="/pricing"
								onClick={() => setIsMenuOpen(false)}
							>
								Pricing
							</Link>
						</li>
						<li>
							<Link
								href="/contact"
								onClick={() => setIsMenuOpen(false)}
							>
								Contact
							</Link>
						</li>
						{user && (
							<li>
								<Link
									href="/dashboard"
									onClick={() => setIsMenuOpen(false)}
								>
									Dashboard
								</Link>
							</li>
						)}
					</ul>
					<div className={styles.mobileCTA}>
						{user ? (
							<>
								<div className={styles.mobileUserInfo}>
									{profile?.full_name || user.email}
								</div>
								<button onClick={handleSignOut} className={styles.signOutBtn}>
									Sign Out
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									onClick={() => setIsMenuOpen(false)}
								>
									<button className={styles.loginBtn}>Login</button>
								</Link>
								<Link
									href="/register"
									onClick={() => setIsMenuOpen(false)}
								>
									<button>Join in 2 Minutes</button>
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Mobile Menu Overlay */}
				{isMenuOpen && (
					<div
						className={styles.overlay}
						onClick={() => setIsMenuOpen(false)}
					></div>
				)}
			</div>
		</nav>
	);
}

export default Navbar;
