
import React, { useState } from 'react';
import { UserAccount, SystemAccount } from '../types';
import { Wallet, Plus, ShieldCheck, Key, History, Trash2, Server, Coins, ChevronDown, ChevronUp, Copy, AlertTriangle } from 'lucide-react';
import { Card, Modal, ModalHeader } from '../components/Shared';

interface EconomyLayerProps {
    users: UserAccount[];
    systemAccounts: SystemAccount[];
    onCreateUser: () => void;
    onDeleteUser: (id: string) => void;
    onFaucet: (id: string) => void;
}

const EconomyLayer: React.FC<EconomyLayerProps> = ({ users, systemAccounts, onCreateUser, onDeleteUser, onFaucet }) => {
  const [watchdogEnabled, setWatchdogEnabled] = useState(true);
  const [isSystemExpanded, setIsSystemExpanded] = useState(true);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [viewPrivateKeyUser, setViewPrivateKeyUser] = useState<UserAccount | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const confirmDelete = () => {
      if (deleteConfirmId) {
          onDeleteUser(deleteConfirmId);
          setDeleteConfirmId(null);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Private Key Modal */}
        <Modal isOpen={!!viewPrivateKeyUser} onClose={() => setViewPrivateKeyUser(null)} className="w-full max-w-lg p-6">
             <ModalHeader title="秘密鍵 (Mnemonic) 表示" icon={Key} iconColor="text-orange-500" onClose={() => setViewPrivateKeyUser(null)} />
             <div className="mb-4">
                 <div className="text-xs text-slate-500 mb-1">対象アドレス</div>
                 <div className="font-mono text-xs bg-slate-100 p-2 rounded break-all border border-slate-200">{viewPrivateKeyUser?.address}</div>
             </div>
             <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 relative group">
                 <div className="font-mono text-emerald-400 text-sm leading-relaxed break-words">
                    witch collapse practice feed shame open despair creek road again ice least monster budget hero
                 </div>
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="text-slate-400 hover:text-white p-1"><Copy className="w-4 h-4" /></button>
                 </div>
             </div>
             <div className="mt-6 flex justify-end">
                 <button onClick={() => setViewPrivateKeyUser(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors">閉じる</button>
             </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} className="max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">ユーザーを削除しますか？</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    このアカウントに関連する残高情報は失われます。
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                    >
                        キャンセル
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-red-200"
                    >
                        削除
                    </button>
                </div>
            </div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-600"><ShieldCheck className="w-5 h-5" /><span className="font-bold">Relayer Watchdog (自動給付)</span></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={watchdogEnabled} onChange={() => setWatchdogEnabled(!watchdogEnabled)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
                <div className="text-sm text-slate-500 mt-2">{watchdogEnabled ? "Relayerの残高監視中。残高が10TKN未満になると自動的に補充されます。" : "Watchdogは無効です。ガス欠によりRelayerが停止する可能性があります。"}</div>
            </Card>

            <Card onClick={onCreateUser} className="p-6 flex flex-col justify-center items-center hover:bg-slate-50 border-dashed border-2">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2"><Plus className="w-6 h-6" /></div>
                <div className="font-bold text-blue-600">新規アカウント作成</div>
            </Card>
        </div>

        <Card className="overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => setIsSystemExpanded(!isSystemExpanded)}>
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Server className="w-5 h-5 text-indigo-500" />システムアカウント (Infra & Pool)</h3>
                {isSystemExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
            {isSystemExpanded && (
                <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr><th className="px-6 py-3 whitespace-nowrap">名前 / 役割</th><th className="px-6 py-3 whitespace-nowrap">アドレス</th><th className="px-6 py-3 text-right whitespace-nowrap">残高 (TKN)</th><th className="px-6 py-3 text-right whitespace-nowrap">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {systemAccounts.map(acc => (
                                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2 whitespace-nowrap">
                                        {acc.type === 'faucet_source' ? <Coins className="w-4 h-4 text-yellow-500" /> : <Server className="w-4 h-4 text-slate-400" />}{acc.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs break-all max-w-xs">{acc.address}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">{acc.balance.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {acc.type !== 'faucet_source' ? (
                                            <button onClick={() => onFaucet(acc.id)} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded font-medium border border-emerald-200 transition-colors">+ Faucet</button>
                                        ) : <span className="text-xs text-slate-400 italic px-2">System Pool</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>

        <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors select-none" onClick={() => setIsUsersExpanded(!isUsersExpanded)}>
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Wallet className="w-5 h-5 text-slate-500" />ユーザーアカウント管理</h3>
                <div className="flex items-center gap-3"><span className="text-sm text-slate-500">{users.length} アカウント</span>{isUsersExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
            </div>
            {isUsersExpanded && (
                <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr><th className="px-6 py-3 whitespace-nowrap">アドレス</th><th className="px-6 py-3 text-right whitespace-nowrap">残高 (TKN)</th><th className="px-6 py-3 text-right whitespace-nowrap">操作</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-600 break-all max-w-lg">
                                        <div className="flex items-center gap-2">{user.address}
                                            <button className="text-slate-300 hover:text-orange-500 p-1 rounded hover:bg-orange-50 transition-colors" title="秘密鍵を表示" onClick={() => setViewPrivateKeyUser(user)}><Key className="w-3 h-3" /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">{user.balance.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2 whitespace-nowrap">
                                        <button onClick={() => onFaucet(user.id)} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded font-medium border border-emerald-200 transition-colors">+ Faucet</button>
                                        <button onClick={() => setDeleteConfirmId(user.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded font-medium border border-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><History className="w-4 h-4" />Watchdog 実行履歴</h4>
            <div className="space-y-2">
                <div className="text-xs font-mono text-slate-500 border-l-2 border-emerald-400 pl-3 py-1">[10:42:15] Relayer (Chain-0) の残高不足を検知 (2.4 TKN). 100 TKNを送金しました。</div>
                <div className="text-xs font-mono text-slate-500 border-l-2 border-emerald-400 pl-3 py-1">[09:15:00] Relayer (Chain-2) の残高不足を検知 (1.8 TKN). 100 TKNを送金しました。</div>
            </div>
        </div>
    </div>
  );
};

export default EconomyLayer;
