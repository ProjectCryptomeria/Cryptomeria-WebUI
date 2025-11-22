import React from 'react';
import { X } from 'lucide-react';

/**
 * スライドオーバー（ドロワー）コンポーネント
 * 
 * @why: 画面遷移せずに詳細情報を表示するため。メインのコンテキストを維持したまま作業できます。
 */
export const SlideOver: React.FC<{ isOpen: boolean; title: string; onClose?: () => void; children: React.ReactNode; width?: string }> = ({ isOpen, title, onClose, children, width = "w-96" }) => (
	<>
		{/* Overlay for closing */}
		{isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity" onClick={onClose}></div>}

		<div className={`fixed right-0 top-0 bottom-0 ${width} bg-white shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
			<div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 z-10">
				<h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
				{onClose && (
					<button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
						<X className="w-5 h-5" />
					</button>
				)}
			</div>
			<div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
				{children}
			</div>
		</div>
	</>
);
