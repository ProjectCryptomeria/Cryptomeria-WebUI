// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/hooks/useResizerPanel.ts

import { useState, useEffect, useRef } from 'react';

/**
 * リサイズ可能なパネルの制御Hook
 * requestAnimationFrameとステップ単位の更新により、
 * チャートなどの重いコンポーネントが含まれていても軽快に動作するように最適化しています。
 */
export const useResizerPanel = (
	initialHeight: number = 320,
	minHeight: number = 100,
	maxHeightRatio: number = 0.8,
	step: number = 15 // 15px単位でスナップさせることで再レンダリング回数を抑制
) => {
	const [isOpen, setIsOpen] = useState(false);
	const [height, setHeight] = useState(initialHeight);

	// イベントハンドラ内で最新の値を参照するためのRef
	const heightRef = useRef(height);
	const panelRef = useRef<HTMLDivElement>(null);
	const resizerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		heightRef.current = height;
	}, [height]);

	useEffect(() => {
		const resizer = resizerRef.current;
		if (!resizer) return;

		let rafId: number | null = null;

		const handleMouseDown = (e: MouseEvent) => {
			e.preventDefault();
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'row-resize';
			document.body.style.userSelect = 'none'; // ドラッグ中のテキスト選択を防止
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (rafId !== null) return;

			const clientY = e.clientY;
			rafId = requestAnimationFrame(() => {
				const rawHeight = window.innerHeight - clientY;

				// 指定ステップ単位に丸める（離散化）
				// これにより、1pxごとの微細な更新による過剰な再レンダリングを防ぐ
				const discreteHeight = Math.round(rawHeight / step) * step;

				// 前回の値と異なる場合のみ更新
				if (discreteHeight !== heightRef.current) {
					if (discreteHeight > 80 && discreteHeight < window.innerHeight * maxHeightRatio) {
						setHeight(discreteHeight);
						if (!isOpen && discreteHeight > minHeight) setIsOpen(true);
					}
				}
				rafId = null;
			});
		};

		const handleMouseUp = () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';

			if (panelRef.current && panelRef.current.clientHeight < 120) setIsOpen(false);
		};

		resizer.addEventListener('mousedown', handleMouseDown);
		return () => {
			resizer.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	}, [isOpen, minHeight, maxHeightRatio, step]);

	return { isOpen, setIsOpen, height, panelRef, resizerRef };
};