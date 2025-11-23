// widgets/log-modal - シナリオログを表示するモーダル

import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import type { ExperimentScenario } from '../../entities/scenario';
import { Modal } from '../../shared/ui/Modal';
import { LogViewer } from '../../shared/ui/LogViewer';

interface LogModalProps {
  scenario: ExperimentScenario | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({ scenario, isOpen, onClose }) => {
  if (!scenario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl w-full h-[75vh] flex flex-col p-0 rounded-3xl ring-4 ring-white/50"
    >
      <div className="flex flex-col h-full">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
          <div className="flex items-center">
            <div className="mr-4">
              {scenario.status === 'RUNNING' ? (
                <Loader2 className="w-8 h-8 text-status-process animate-spin" />
              ) : scenario.status === 'COMPLETE' ? (
                <CheckCircle className="w-8 h-8 text-status-success" />
              ) : scenario.status === 'FAIL' ? (
                <AlertCircle className="w-8 h-8 text-status-fail" />
              ) : (
                <Clock className="w-8 h-8 text-status-ready" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">実行詳細ログ</h3>
              <p className="text-sm text-gray-400 font-mono mt-1 font-medium">
                {scenario.uniqueId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-bold text-gray-500">進捗</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
                scenario.status === 'FAIL' ? 'bg-status-fail' : 'bg-primary-indigo'
              }`}
              style={{
                width:
                  scenario.status === 'COMPLETE'
                    ? '100%'
                    : ['READY', 'PENDING', 'CALCULATING'].includes(scenario.status)
                      ? '0%'
                      : scenario.status === 'FAIL'
                        ? '80%'
                        : scenario.status === 'RUNNING'
                          ? '45%'
                          : '0%',
              }}
            ></div>
          </div>
        </div>
        <LogViewer
          logs={scenario.logs || []}
          className="flex-1 m-0 rounded-none border-x-0 bg-gray-900 font-mono text-sm text-gray-300 leading-relaxed"
        />
        <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-600 font-bold rounded-xl transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </Modal>
  );
};
