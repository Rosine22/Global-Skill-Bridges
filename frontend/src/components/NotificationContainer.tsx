import { X } from 'lucide-react';

interface NotificationItem {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
}

export default function NotificationContainer({
	notifications,
	onRemove,
}: {
	notifications: NotificationItem[];
	onRemove: (id: string) => void;
}) {
	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
			{notifications.map((n) => (
				<div
					key={n.id}
					className={`max-w-sm w-full px-4 py-3 rounded-md shadow-md text-sm text-white flex items-start justify-between space-x-3 ${
						n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : n.type === 'warning' ? 'bg-yellow-600 text-black' : 'bg-blue-600'
					}`}
				>
					<div className="flex-1">{n.message}</div>
					<button onClick={() => onRemove(n.id)} className="ml-3 opacity-80 hover:opacity-100">
						<X className="h-4 w-4" />
					</button>
				</div>
			))}
		</div>
	);
}
