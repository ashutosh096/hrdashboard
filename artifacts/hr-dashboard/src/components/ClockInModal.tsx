import React, { useState } from 'react';
import { X, Clock, MapPin, Laptop, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({ isOpen, onClose }) => {
  const [workMode, setWorkMode] = useState<'IN_OFFICE' | 'REMOTE' | 'HYBRID'>('IN_OFFICE');
  const [isClockedIn, setIsClockedIn] = useState(false);

  if (!isOpen) return null;

  const handleToggleClock = () => {
    setIsClockedIn(!isClockedIn);
    toast.success(isClockedIn ? 'Clocked out successfully!' : `Clocked in successfully (${workMode})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Attendance Clock In</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Select Work Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWorkMode('IN_OFFICE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  workMode === 'IN_OFFICE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>In Office</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkMode('REMOTE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  workMode === 'REMOTE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Remote</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkMode('HYBRID')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  workMode === 'HYBRID'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Hybrid</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleToggleClock}
            className={`w-full py-3 rounded-lg text-sm font-bold text-white shadow-sm transition-all ${
              isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isClockedIn ? 'Clock Out Now' : '1-Click Clock In'}
          </button>
        </div>
      </div>
    </div>
  );
};
