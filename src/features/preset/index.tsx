import React, { useState } from 'react';
import { ExperimentPreset } from '../../types';
import { AlertTriangle, FileText, Bookmark } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { PresetCard } from './components/PresetCard';
import { PresetDetailsPanel } from './components/PresetDetailsPanel';
import { useGlobalStore } from '../../stores/useGlobalStore';

/**
 * Preset Layer
 *
 * 実験設定のテンプレート（プリセット）を管理する画面。
 * 保存された設定を視覚的にわかりやすくカード形式で表示し、ワンクリックで詳細確認や削除を行えます。
 */
const PresetLayer: React.FC = () => {
  const { presets, deletePreset } = useGlobalStore();
  const [selectedPreset, setSelectedPreset] = useState<ExperimentPreset | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deletePreset(deleteTargetId);
      if (selectedPreset?.id === deleteTargetId) {
        setSelectedPreset(null);
      }
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="h-full flex flex-col pb-10">
      <PageHeader
        title="Experiment Presets"
        description="保存された実験設定のテンプレート管理"
        icon={Bookmark}
        iconColor="text-orange-500"
        action={
          <Badge color="slate" className="text-sm py-2 px-4">
            {presets.length} Presets
          </Badge>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        className="max-w-sm w-full p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">プリセット削除</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
          保存された設定は完全に削除されます。
          <br />
          本当によろしいですか？
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => setDeleteTargetId(null)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            削除する
          </Button>
        </div>
      </Modal>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
        {presets.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <FileText className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-bold">保存されたプリセットはありません</p>
            <p className="text-sm mt-1">Experiment画面から新しいプリセットを保存してください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {presets.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={selectedPreset?.id === preset.id}
                onClick={() => setSelectedPreset(preset)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* 抽出した詳細パネルコンポーネントを使用 */}
      <PresetDetailsPanel preset={selectedPreset} onClose={() => setSelectedPreset(null)} />
    </div>
  );
};

export default PresetLayer;
