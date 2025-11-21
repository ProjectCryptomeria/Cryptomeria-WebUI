import { useState, useRef } from 'react';

export const useFileUploadTree = (notify: (type: 'success' | 'error', title: string, message: string) => void) => {
    const [uploadStats, setUploadStats] = useState<{ count: number, sizeMB: number, tree: any, treeOpen: boolean }>({ count: 0, sizeMB: 0, tree: null, treeOpen: true });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const buildTreeFromProcessedFiles = (files: any[], fileCount: number, totalSize: number) => {
        const root: any = { name: 'root', children: {}, type: 'folder', size: 0 };
        files.forEach(file => {
            const parts = file.path.split('/').filter((p: string) => p.length > 0);
            let current = root;
            parts.forEach((part: string, index: number) => {
                if (index === parts.length - 1) current.children[part] = { name: part, type: 'file', size: file.size };
                else {
                    if (!current.children[part]) current.children[part] = { name: part, children: {}, type: 'folder', size: 0 };
                    current = current.children[part];
                }
            });
        });
        const sizeMB = parseFloat((totalSize / (1024 * 1024)).toFixed(2));
        setUploadStats({ count: fileCount, sizeMB, tree: root, treeOpen: true });
        notify('success', 'Files Parsed', `${fileCount} files processed locally (${sizeMB}MB).`);
        return sizeMB;
    };

    const processFiles = async (fileList: File[]) => {
        const processedFiles: any[] = [];
        let totalSize = 0;
        let fileCount = 0;
        const JSZip = (window as any).JSZip;

        for (const file of fileList) {
            if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
                try {
                    const zip = await JSZip.loadAsync(file);
                    const entries = Object.keys(zip.files).map(name => zip.files[name]);
                    for (const zipEntry of entries) {
                        if (!zipEntry.dir) {
                            const path = zipEntry.name;
                            const name = path.split('/').pop() || path;
                            let size = 0;
                            try {
                                const blob = await zipEntry.async("blob");
                                size = blob.size;
                            } catch (e) {
                                console.warn("Failed to read zip entry size", e);
                            }
                            processedFiles.push({ path: path, name: name, size: size });
                            fileCount++;
                            totalSize += size;
                        }
                    }
                } catch (e) {
                    console.error("Zip error:", e);
                    notify('error', 'Zip Extraction Failed', `Could not extract ${file.name}`);
                }
            } else {
                processedFiles.push({ path: file.webkitRelativePath || file.name, name: file.name, size: file.size });
                totalSize += file.size;
                fileCount++;
            }
        }
        return buildTreeFromProcessedFiles(processedFiles, fileCount, totalSize);
    };

    return { uploadStats, setUploadStats, fileInputRef, processFiles };
};