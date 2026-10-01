import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Lock, Building2, Home } from 'lucide-react';
import { toast } from 'sonner';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  initialWorkMode?: 'IN_OFFICE' | 'REMOTE';
  initialHalfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  isEditMode?: boolean;
  onSubmitAttendance: (attendanceData: {
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    workMode: 'IN_OFFICE' | 'REMOTE';
    isEdit?: boolean;
  }) => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  initialStatus = 'PRESENT',
  initialWorkMode = 'IN_OFFICE',
  initialHalfDayType = 'FIRST_HALF',
  isEditMode = false,
  onSubmitAttendance,
}) => {
  const [status, setStatus] = useState<'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'>(initialStatus);
  const [halfDayType, setHalfDayType] = useState<'FIRST_HALF' | 'SECOND_HALF'>(initialHalfDayType);
  const [workMode, setWorkMode] = useState<'IN_OFFICE' | 'REMOTE'>(initialWorkMode);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus);
      setWorkMode(initialWorkMode);
      setHalfDayType(initialHalfDayType);
      setShowConfirmStep(false);
      setCurrentDate(new Date());
    }
  }, [isOpen, initialStatus, initialWorkMode, initialHalfDayType]);

  if (!isOpen) return null;

  const formattedDate = currentDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmStep(true);
  };

  const handleFinalConfirm = () => {
    onSubmitAttendance({
      status,
      halfDayType: status === 'HALF_DAY' ? halfDayType : undefined,
      workMode,
      isEdit: isEditMode,
    });
    setShowConfirmStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header (Date only, time removed as requested) */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {isEditMode ? "Edit Today's Attendance" : 'Mark Attendance Today'}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showConfirmStep ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4 text-left">
            {/* Status Options */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Attendance Status *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('PRESENT')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    status === 'PRESENT'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 font-semibold hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <div>
                    <span className="text-xs block">Present</span>
                    <span className="text-[10px] text-gray-400 font-medium block">Full Working Day</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('HALF_DAY')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    status === 'HALF_DAY'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 font-semibold hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                  <div>
                    <span className="text-xs block">Half Day</span>
                    <span className="text-[10px] text-gray-400 font-medium block">4 Working Hours</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('ABSENT')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    status === 'ABSENT'
                      ? 'bg-red-50 border-red-400 ring-2 ring-red-500/20 text-red-900 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 font-semibold hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                  <div>
                    <span className="text-xs block">Absent</span>
                    <span className="text-[10px] text-gray-400 font-medium block">Not Working Today</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('LEAVE')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    status === 'LEAVE'
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 text-purple-900 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 font-semibold hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
                  <div>
                    <span className="text-xs block">On Leave</span>
                    <span className="text-[10px] text-gray-400 font-medium block">Approved Leave</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Half Day Sub-options */}
            {status === 'HALF_DAY' && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3 animate-in fade-in duration-150">
                <span className="text-[11px] font-bold text-blue-900 block mb-2">Select Half-Day Shift:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    halfDayType === 'FIRST_HALF'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-blue-900 border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="halfDayType"
                      checked={halfDayType === 'FIRST_HALF'}
                      onChange={() => setHalfDayType('FIRST_HALF')}
                      className="hidden"
                    />
                    <span>First Half (Morning)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    halfDayType === 'SECOND_HALF'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-blue-900 border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="halfDayType"
                      checked={halfDayType === 'SECOND_HALF'}
                      onChange={() => setHalfDayType('SECOND_HALF')}
                      className="hidden"
                    />
                    <span>Second Half (Afternoon)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Work Location Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkMode('IN_OFFICE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                    workMode === 'IN_OFFICE'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>In Office</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkMode('REMOTE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                    workMode === 'REMOTE'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Work From Home</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isEditMode ? 'Proceed to Update →' : 'Submit Attendance →'}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation & Locking Prompt */
          <div className="space-y-4 text-center py-2 animate-in fade-in duration-200 select-none">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900">
                {isEditMode ? 'Confirm 1-Time Attendance Update' : 'Are you sure you want to submit?'}
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {isEditMode ? (
                  <span>
                    This is your <strong className="text-amber-800">1-time edit</strong> for today. Once updated, your attendance will be permanently locked.
                  </span>
                ) : (
                  <span>
                    You will have an option to edit your attendance <strong className="text-emerald-800">only one time</strong> if needed.
                  </span>
                )}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-2xl text-xs space-y-1 text-left">
              <p><span className="text-gray-400 font-medium">Status:</span> <strong className="text-emerald-700">{status} {status === 'HALF_DAY' ? `(${halfDayType.replace('_', ' ')})` : ''}</strong></p>
              <p><span className="text-gray-400 font-medium">Location:</span> <strong className="text-gray-800">{workMode.replace('_', ' ')}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmStep(false)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Confirm & Finalize' : 'Confirm Attendance'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendanceModal;
