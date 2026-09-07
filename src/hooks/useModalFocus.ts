import { useEffect, type RefObject } from 'react';

export function useModalFocus(
	isOpen: boolean,
	panelRef: RefObject<HTMLElement | null>,
	onClose: () => void
) {
	useEffect(() => {
		if (!isOpen) return;

		const previouslyFocused = document.activeElement as HTMLElement | null;

		const panel = panelRef.current;
		if (!panel) return;

		const focusableSelector = [
			'button',
			'input',
			'select',
			'textarea',
			'a[href]',
			'[tabindex]:not([tabindex="-1"])',
		].join(',');

		const getFocusable = () =>
			Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
				el => {
					const input = el as HTMLInputElement;
					return (!input.disabled && el.offsetParent !== null);
				}
			);

		const focusable = getFocusable();
		if (focusable.length > 0) {
			focusable[0].focus();
		} else {
			panel.focus();
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
				return;
			}

			if (e.key === 'Tab') {
				const items = getFocusable();
				if (items.length === 0) return;

				const first = items[0];
				const last = items[items.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		};

		panel.addEventListener('keydown', handleKeyDown);

		return () => {
			panel.removeEventListener('keydown', handleKeyDown);
			if (previouslyFocused) {
				previouslyFocused.focus();
			}
		};
	}, [isOpen, panelRef, onClose]);
}