import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationContainer from '../components/NotificationContainer';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	duration?: number;
}

interface NotificationContextValue {
	notify: (type: NotificationType, message: string, duration?: number) => void;
	success: (message: string, duration?: number) => void;
	error: (message: string, duration?: number) => void;
	info: (message: string, duration?: number) => void;
	warning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const remove = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	const notify = useCallback((type: NotificationType, message: string, duration = 5000) => {
		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		const n: Notification = { id, type, message, duration };
		setNotifications((prev) => [n, ...prev]);
		if (duration && duration > 0) {
			setTimeout(() => remove(id), duration);
		}
	}, [remove]);

	const value: NotificationContextValue = {
		notify,
		success: (message: string, duration?: number) => notify('success', message, duration),
		error: (message: string, duration?: number) => notify('error', message, duration),
		info: (message: string, duration?: number) => notify('info', message, duration),
		warning: (message: string, duration?: number) => notify('warning', message, duration),
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
			<NotificationContainer notifications={notifications} onRemove={remove} />
		</NotificationContext.Provider>
	);
};

export const useNotification = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
	return ctx;
};

