import { useState, useEffect, useRef } from 'react';
import { VirtualSocket } from '../services/mockBackend';

export const useWebSocket = <T>(url: string, onMessage?: (data: T) => void) => {
    const [data, setData] = useState<T | null>(null);
    const socketRef = useRef<VirtualSocket | null>(null);
    
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