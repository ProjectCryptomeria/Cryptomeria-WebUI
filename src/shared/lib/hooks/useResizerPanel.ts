// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/hooks/useResizerPanel.ts

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * リサイズ可能なパネルの制御Hook
 * * 【パフォーマンス & UX改善版 v2】
 * 1. DOM直接操作による再レンダリング回避（ラグ排除）
 * 2. ドラッグ中のCSS transition無効化（追従性向上）
 * 3. ドラッグ状態(isDragging)の公開（子コンポーネントの描画抑制用）
 * 4. [NEW] 開閉アニメーション中(isTransitioning)の検知と公開
 */
export const useResizerPanel = (
  initialHeight: number = 320,
  minHeight: number = 100,
  maxHeightRatio: number = 0.8
) => {
  const [isOpen, setIsOpenState] = useState(false);
  const [height, setHeight] = useState(initialHeight);

  // ドラッグ中フラグ
  const [isDragging, setIsDragging] = useState(false);
  // [NEW] アニメーション中フラグ
  const [isTransitioning, setIsTransitioning] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // [NEW] 開閉操作をラップしてアニメーションフラグを制御
  const setIsOpen = useCallback((nextIsOpen: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState(prev => {
      const nextValue = typeof nextIsOpen === 'function' ? nextIsOpen(prev) : nextIsOpen;

      // 状態が変わる場合のみアニメーションフラグを立てる
      if (prev !== nextValue) {
        setIsTransitioning(true);
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

        // CSSのtransition: 0.3s に合わせてフラグを下ろす (+マージン)
        transitionTimerRef.current = setTimeout(() => {
          setIsTransitioning(false);
          transitionTimerRef.current = null;
        }, 350);
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    // クリーンアップ
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);

      if (panelRef.current) {
        panelRef.current.style.transition = 'none';
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !panelRef.current) return;

      const newHeight = window.innerHeight - e.clientY;
      const maxHeight = window.innerHeight * maxHeightRatio;

      if (newHeight > 80 && newHeight < maxHeight) {
        panelRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (panelRef.current) {
        panelRef.current.style.transition = '';

        const currentHeight = panelRef.current.clientHeight;

        if (currentHeight < 120) {
          // ここは内部ロジックなので直接State更新でも良いが、
          // 一貫性のためラッパー経由で閉じる（アニメーションフラグも立つ）
          setIsOpen(false);
          setHeight(initialHeight);
          panelRef.current.style.removeProperty('height');
        } else {
          setHeight(currentHeight);
          // ドラッグ終了後に自動で開く場合はアニメーション不要なので直接State更新
          if (!isOpen) setIsOpenState(true);
        }
      }
    };

    resizer.addEventListener('mousedown', handleMouseDown);
    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, minHeight, maxHeightRatio, initialHeight, setIsOpen]);

  // isTransitioning も返すように変更
  return { isOpen, setIsOpen, height, panelRef, resizerRef, isDragging, isTransitioning };
};
