import type React from "react";
export default function MeetingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div style={{ height: "100vh", overflow: "hidden" }}>{children}</div>
	);
}
