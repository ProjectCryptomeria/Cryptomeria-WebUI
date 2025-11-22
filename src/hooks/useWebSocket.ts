import { useState, useEffect, useRef } from 'react';
import { VirtualSocket } from '../backend_mock/MockServer';

/**
 * WebSocket接続を管理するHook
 * VirtualSocketを使用してモックWebSocketに接続し、リアルタイムデータを受信します
 */
export const useWebSocket = <T>(url: string, onMessage?: (data: T) => void) => {
	const [data, setData] = useState<T | null>(null);
	const socketRef = useRef<VirtualSocket | null>(null);

	// Use a ref to store the latest onMessage callback.
	// This prevents the socket subscription from being recreated when the callback changes,
	// while ensuring that the latest callback (with fresh closure variables) is always invoked.
	const onMessageRef = useRef(onMessage);
	useEffect(() => {
		onMessageRef.current = onMessage;
	}, [onMessage]);

	useEffect(() => {
		const socket = new VirtualSocket(url);
		socketRef.current = socket;

		socket.onmessage = (event) => {
			const parsed = JSON.parse(event.data);
			setData(parsed);
			if (onMessageRef.current) onMessageRef.current(parsed);
		};

		return () => {
			socket.close();
		};
	}, [url]);

	return { data, socket: socketRef.current };
};
