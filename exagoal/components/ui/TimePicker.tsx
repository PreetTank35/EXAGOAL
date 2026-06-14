'use client';

import React from 'react';

interface TimePickerProps {
  date: string;
  hour: number;
  minute: number;
  ampm: 'AM' | 'PM';
  onDateChange: (val: string) => void;
  onHourChange: (val: number) => void;
  onMinuteChange: (val: number) => void;
  onAmPmChange: (val: 'AM' | 'PM') => void;
  label?: string;
}

export default function TimePicker({
  date,
  hour,
  minute,
  ampm,
  onDateChange,
  onHourChange,
  onMinuteChange,
  onAmPmChange,
  label
}: TimePickerProps) {
  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate minutes 0-59
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 w-full sm:w-auto"
        />
        <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-1 w-full sm:w-auto">
          <select
            value={hour}
            onChange={(e) => onHourChange(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm py-1 pl-2 pr-6 appearance-none cursor-pointer hover:text-white text-zinc-300"
          >
            {hours.map(h => (
              <option key={h} value={h} className="bg-zinc-900">{h.toString().padStart(2, '0')}</option>
            ))}
          </select>
          <span className="text-zinc-500 font-bold">:</span>
          <select
            value={minute}
            onChange={(e) => onMinuteChange(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm py-1 pl-2 pr-6 appearance-none cursor-pointer hover:text-white text-zinc-300"
          >
            {minutes.map(m => (
              <option key={m} value={m} className="bg-zinc-900">{m.toString().padStart(2, '0')}</option>
            ))}
          </select>
          <div className="flex items-center ml-2 bg-zinc-800/50 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => onAmPmChange('AM')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                ampm === 'AM' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => onAmPmChange('PM')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                ampm === 'PM' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
