import { useState } from 'react';

export default function PromptDialog({
  open,
  title,
  defaultValue,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  title?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue || '');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          rows={4}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button onClick={() => onSubmit(value)} className="px-4 py-2 rounded bg-primary-600 text-white">Submit</button>
        </div>
      </div>
    </div>
  );
}
