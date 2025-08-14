import ClientLayout from "@/components/ClientLayout";
import "./globals.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
	weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={outfit.className}>
				<ClientLayout>
					{children}
				</ClientLayout>
			</body>
		</html>
	);
}
