import type { ReactNode } from 'react';

import Sidebar from './sidebar';

type LayoutProps = {
	children: ReactNode;
};

export default function Layout({
	children
}: LayoutProps) {
	return (
		<div className="app-layout">
			<Sidebar />

			<main className="app-layout__content">
				{children}
			</main>
		</div>
	);
}