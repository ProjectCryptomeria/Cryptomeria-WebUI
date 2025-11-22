import { useState, useEffect, useRef } from 'react';

/**
 * リサイズ可能なパネルの制御Hook
 * マウスドラッグでパネルの高さを調整できる機能を提供します
 */
export const useResizerPanel = (initialHeight: number = 320, minHeight: number = 100, maxHeightRatio: number = 0.8) => {
	const [isOpen, setIsOpen] = useState(false);
	const [height, setHeight] = useState(initialHeight);
	const panelRef = useRef<HTMLDivElement>(null);
	const resizerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const resizer = resizerRef.current;
		if (!resizer) return;

		const handleMouseDown = (e: MouseEvent) => {
			e.preventDefault();
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'row-resize';
		};

		const handleMouseMove = (e: MouseEvent) => {
			const newHeight = window.innerHeight - e.clientY;
			if (newHeight > 80 && newHeight < window.innerHeight * maxHeightRatio) {
				setHeight(newHeight);
				if (!isOpen && newHeight > minHeight) setIsOpen(true);
			}
		};

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			if (panelRef.current && panelRef.current.clientHeight < 120) setIsOpen(false);
		};

		resizer.addEventListener('mousedown', handleMouseDown);
		return () => { resizer.removeEventListener('mousedown', handleMouseDown); };
	}, [isOpen, minHeight, maxHeightRatio]);

	return { isOpen, setIsOpen, height, panelRef, resizerRef };
};
