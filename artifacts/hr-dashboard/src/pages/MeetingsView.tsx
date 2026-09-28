import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Video,
  Plus,
  CheckSquare,
  RefreshCw,
  Chrome,
  Building2,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  ExternalLink,
  X,
  MapPin,
  AlignLeft,
  Search,
  Settings,
  HelpCircle,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  Edit2,
  Mail,
  FileText,
  Bell,
  ChevronDown,
  Upload,
  Download,
  Paperclip,
  Sparkles,
  File
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useEntity } from '../contexts/EntityContext';
import { fetchApi } from '@workspace/api-client-react';
import { getAvatarByName } from '../utils/avatars';
import { matchesEntityFilter, getEntityBadge } from '../utils/entityUtils';

type CalendarViewMode = 'WEEK' | 'DAY' | 'MONTH' | 'SCHEDULE';

const HOURS = Array.from({ length: 24 }, (_, i) => i); // Full 24 Hours: 0 to 23 (12 AM to 11 PM)
const HOUR_HEIGHT = 48; // 48px per hour matching Google Calendar style

export const MeetingsView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'AVAILABILITY'>('CALENDAR');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('WEEK');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Search filter for people / events
  const [searchPeopleQuery, setSearchPeopleQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSlotData, setCreateSlotData] = useState<{ date: string; time: string; endHour?: string }>({
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    endHour: '12:00',
  });
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  // MoM (Minutes of Meeting) State
  const [detailModalTab, setDetailModalTab] = useState<'DETAILS' | 'MOM'>('DETAILS');
  const [currentMomNotes, setCurrentMomNotes] = useState('');
  const [currentMomActionItems, setCurrentMomActionItems] = useState('');
  const [currentMomDecisions, setCurrentMomDecisions] = useState('');
  const [currentMomFiles, setCurrentMomFiles] = useState<any[]>([]);
  const [isSavingMom, setIsSavingMom] = useState(false);

  // Form State for Image 3 Create Modal
  const [eventTitle, setEventTitle] = useState('');
  const [eventMode, setEventMode] = useState<'EVENT' | 'TASK' | 'APPOINTMENT'>('EVENT');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('11:00');
  const [eventEndTime, setEventEndTime] = useState('12:00');
  const [eventGuests, setEventGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState('');
  const [hasGoogleMeet, setHasGoogleMeet] = useState(true);
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const [meetings, setMeetings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const isJustConnected = searchParams.get('calendarConnected') === 'true';

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const [meetingsData, employeesData, availabilityData] = await Promise.all([
        fetchApi<any[]>('/api/meetings'),
        fetchApi<any[]>('/api/employees'),
        fetchApi<any[]>('/api/meetings/availability').catch(() => []),
      ]);
      const cutoffDate = new Date(Date.now() - 3 * 86400000);
      cutoffDate.setHours(0, 0, 0, 0);

      const activeMeetings = (Array.isArray(meetingsData) ? meetingsData : []).filter((m) => {
        const mEnd = new Date(m.endTime || m.startTime);
        return mEnd >= cutoffDate;
      });

      setMeetings(activeMeetings);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
    } catch (err) {
      console.error('[MEETINGS FETCH ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const data = await fetchApi<any[]>('/api/meetings/availability');
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[AVAILABILITY FETCH ERROR]:', err);
    }
  };

  // Explicit user-triggered Sync button handler
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetchApi<any>('/api/meetings/sync');
      setIsConnected(true);
      toast.success(`${res.message || 'Synced successfully'} (${res.created || 0} imported, ${res.updated || 0} updated)`);
      await loadMeetings();
      await loadAvailability();
    } catch (err: any) {
      if (err.needsOAuth || err.message?.includes('not connected')) {
        setIsConnected(false);
        toast.error('Google Calendar not connected. Click "Connect Google Calendar" to grant permission.');
      } else {
        toast.error('Sync failed');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadMeetings();
      await loadAvailability();

      if (isJustConnected) {
        setIsConnected(true);
        toast.success('Google Calendar connected successfully!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        try {
          const res = await fetchApi<any>('/api/meetings/sync');
          setIsConnected(true);
          if (res.created > 0 || res.updated > 0 || res.cancelled > 0) {
            await loadMeetings();
            await loadAvailability();
          }
        } catch {
          // Silent background load
        }
      }
    };
    init();
  }, []);

  const handleConnectGoogle = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    const returnPath = encodeURIComponent(window.location.pathname || '/meetings');
    window.location.href = `/api/auth/google?userId=${user?.id || ''}&returnPath=${returnPath}`;
  };

  const handleConvertToTask = (m: any) => {
    toast.success(`Converted meeting "${m.title}" into a Task!`);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel / remove this meeting?')) return;
    try {
      await fetchApi(`/api/meetings/${meetingId}`, { method: 'DELETE' });
      toast.success('Meeting cancelled successfully');
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      setSelectedMeeting(null);
      await loadAvailability();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel meeting');
    }
  };

  const handleCopyMeetLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Google Meet link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Open Create Modal for specific slot
  const openCreateModal = (dateStr?: string, hour?: number) => {
    const d = dateStr || currentDate.toISOString().split('T')[0];
    const h = hour !== undefined ? Math.max(0, Math.min(23, hour)) : 11;
    const startStr = `${h < 10 ? '0' : ''}${h}:00`;
    const nextH = h === 23 ? 23 : h + 1;
    const nextMin = h === 23 ? '59' : '00';
    const endStr = `${nextH < 10 ? '0' : ''}${nextH}:${nextMin}`;

    setEventTitle('');
    setEventDate(d);
    setEventStartTime(startStr);
    setEventEndTime(endStr);
    setEventGuests([]);
    setEventLocation('');
    setEventDescription('');
    setHasGoogleMeet(true);
    setEventMode('EVENT');
    setIsCreateModalOpen(true);
  };

  const handleSaveCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    setIsSaving(true);
    try {
      const startDateTime = new Date(`${eventDate}T${eventStartTime}:00`);
      const endDateTime = new Date(`${eventDate}T${eventEndTime}:00`);

      const payload = {
        title: eventTitle.trim(),
        description: eventDescription,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: eventLocation,
        invitees: eventGuests,
        createGoogleMeet: hasGoogleMeet,
        source: 'GOOGLE_CALENDAR',
        isGoogleCalendar: true,
      };

      await fetchApi('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Meeting scheduled & Google Meet link generated!');
      setIsCreateModalOpen(false);
      await loadMeetings();
      await loadAvailability();
    } catch (err: any) {
      if (err.needsOAuth || err.message?.includes('not connected')) {
        toast.error('Google Calendar is not connected. Please connect Google Calendar first.');
        setIsConnected(false);
      } else {
        toast.error(err.message || 'Failed to schedule meeting');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Synchronize MoM details whenever a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      setDetailModalTab('DETAILS');
      const desc = selectedMeeting.description || '';
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object') {
          setCurrentMomNotes(parsed.momNotes || '');
          setCurrentMomActionItems(parsed.momActionItems || '');
          setCurrentMomDecisions(parsed.momDecisions || '');
          setCurrentMomFiles(Array.isArray(parsed.momFiles) ? parsed.momFiles : []);
          return;
        }
      } catch (e) {
        // Plain text fallback
      }
      setCurrentMomNotes(desc);
      setCurrentMomActionItems('');
      setCurrentMomDecisions('');
      setCurrentMomFiles([]);
    }
  }, [selectedMeeting]);

  // Handle MoM File Upload (PDF, Docs, Images, Notes)
  const handleMomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const fileDataUrl = uploadEvent.target?.result as string;
      const newFileObj = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        url: fileDataUrl,
        uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
      setCurrentMomFiles((prev) => [...prev, newFileObj]);
      toast.success(`Attached "${file.name}". Click "Save MoM" to persist.`);
    };
    reader.readAsDataURL(file);
  };

  // Save MoM to database
  const handleSaveMom = async () => {
    if (!selectedMeeting) return;
    setIsSavingMom(true);
    try {
      const payload = JSON.stringify({
        momNotes: currentMomNotes,
        momActionItems: currentMomActionItems,
        momDecisions: currentMomDecisions,
        momFiles: currentMomFiles,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.name || user?.email,
      });

      const updated = await fetchApi<any>(`/api/meetings/${selectedMeeting.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ description: payload }),
      });

      setMeetings((prev) =>
        prev.map((m) => (m.id === selectedMeeting.id ? { ...m, description: payload } : m))
      );
      setSelectedMeeting((prev: any) => (prev ? { ...prev, description: payload } : null));
      toast.success('Minutes of Meeting (MoM) saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save MoM');
    } finally {
      setIsSavingMom(false);
    }
  };

  // Add guest to list
  const handleAddGuest = (emailOrName: string) => {
    const val = emailOrName.trim();
    if (!val) return;
    if (!eventGuests.includes(val)) {
      setEventGuests([...eventGuests, val]);
    }
    setGuestInput('');
  };

  // Date Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'MONTH') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'WEEK') {
      next.setDate(next.getDate() - 7);
    } else if (viewMode === 'DAY') {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'MONTH') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'WEEK') {
      next.setDate(next.getDate() + 7);
    } else if (viewMode === 'DAY') {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatISTTime = (d: Date | string): string => {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatISTTimeShort = (d: Date | string): string => {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase().replace(' ', '');
  };

  const getKolkataDateString = (d: Date): string => {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(d);
    } catch {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const isSameCalendarDay = (d1: Date, d2: Date): boolean => {
    return getKolkataDateString(d1) === getKolkataDateString(d2);
  };

  const formatLocalDateString = (d: Date): string => {
    return getKolkataDateString(d);
  };

  const [miniNavMonth, setMiniNavMonth] = useState<Date>(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });

  const todayDateStr = useMemo(() => formatLocalDateString(new Date()), []);
  const selectedDateStr = useMemo(() => formatLocalDateString(currentDate), [currentDate]);

  // Header Title for main view
  const calendarHeaderTitle = useMemo(() => {
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${monthName} ${year}`;
  }, [currentDate]);

  // Mini Calendar Header Title
  const miniCalendarHeaderTitle = useMemo(() => {
    const monthName = miniNavMonth.toLocaleString('default', { month: 'long' });
    const year = miniNavMonth.getFullYear();
    return `${monthName} ${year}`;
  }, [miniNavMonth]);

  // Valid Google Calendar synced meetings (user's full personal calendar)
  const validMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const isCalendarSynced =
        m.source === 'GOOGLE_CALENDAR' ||
        m.source === 'GOOGLE_CALENDAR_IMPORTED' ||
        Boolean(m.googleEventId) ||
        Boolean(m.googleMeetUrl) ||
        Boolean(m.isGoogleCalendar);
      if (!isCalendarSynced) return false;
      return true;
    });
  }, [meetings]);

  // Week View Days (Sunday to Saturday) with timezone-safe local dates
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(12, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days: { date: Date; dateStr: string; dayName: string; dayNum: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d,
        dateStr: formatLocalDateString(d),
        dayName: d.toLocaleString('default', { weekday: 'short' }).toUpperCase(),
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

  // Mini Calendar Month Matrix for Sidebar
  const miniCalendarDays = useMemo(() => {
    const year = miniNavMonth.getFullYear();
    const month = miniNavMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
    const prevMonthDays = new Date(year, month, 0, 12, 0, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string; dayNum: number }[] = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatLocalDateString(d), dayNum: d.getDate() });
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: true, dateStr: formatLocalDateString(d), dayNum: i });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i, 12, 0, 0);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatLocalDateString(d), dayNum: i });
    }
    return days;
  }, [miniNavMonth]);

  // Month View Days for main Month grid
  const monthViewDays = miniCalendarDays;

  const [availDateFilter, setAvailDateFilter] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  const [cardDateFilters, setCardDateFilters] = useState<Record<string, 'TODAY' | 'TOMORROW'>>({});

  const getAvailTargetDate = (filter: 'TODAY' | 'TOMORROW') => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (filter === 'TOMORROW') d.setDate(d.getDate() + 1);
    return d;
  };

  // Selected date for availability tab
  const availTargetDate = useMemo(() => getAvailTargetDate(availDateFilter), [availDateFilter]);
  const availTargetDateStr = formatLocalDateString(availTargetDate);
  const availDateLabel = availDateFilter === 'TOMORROW' ? "Tomorrow's" : "Today's";

  // Map meetings by date string
  const meetingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    validMeetings.forEach((m) => {
      if (!m.startTime) return;
      const d = new Date(m.startTime);
      if (isNaN(d.getTime())) return;
      const key = formatLocalDateString(d);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [validMeetings]);

  // Office Today & Availability list with chronological time sorting and privacy protection
  const livePresenceList = useMemo(() => {
    const now = new Date();

    return employees.map((emp, idx) => {
      const entity = emp.entityCode || emp.entity || 'EHM';
      const entityName = entity === 'CAG' ? 'CLIMAGRO' : entity === 'COMMON' ? 'EHM & CLIMAGRO' : 'EHM';

      const isSelf =
        (user?.employeeId && emp.id === user.employeeId) ||
        (user?.id && emp.id === user.id) ||
        (user?.email && (emp.email || '').toLowerCase() === (user.email || '').toLowerCase());

      const empAvail = availability.find((a: any) => a.employeeId === emp.id || (a.email && a.email.toLowerCase() === (emp.email || '').toLowerCase()));
      const availBusySlots = empAvail?.busy || empAvail?.busySlots || [];

      // Determine active date filter for this employee card (individual override or global)
      const empDateFilter = cardDateFilters[emp.id] || availDateFilter;
      const targetDate = getAvailTargetDate(empDateFilter);

      // Determine if employee has an all-day Office or WFH status
      const hasOfficeStatus = availBusySlots.some((slot: any) => {
        const slotStart = new Date(slot.start || slot.startTime);
        const titleLower = (slot.meetingTitle || slot.title || '').toLowerCase();
        return isSameCalendarDay(slotStart, now) && (titleLower.includes('office') || titleLower.includes('present'));
      });

      // Filter slots strictly matching target day, excluding full-day status notes (like 24h "Office" entries)
      const dateSlots = availBusySlots.filter((slot: any) => {
        const slotStart = new Date(slot.start || slot.startTime);
        let slotEnd = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(slotStart.getTime() + 30 * 60000);
        if (slotEnd.getTime() <= slotStart.getTime()) slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const durationHours = (slotEnd.getTime() - slotStart.getTime()) / 3600000;
        const titleLower = (slot.meetingTitle || slot.title || '').toLowerCase();
        const isAllDayStatus = slot.isAllDay || durationHours >= 12 || titleLower === 'office' || titleLower === 'wfh';

        // Exclude full-day status notes from actual meeting list
        if (isAllDayStatus) return false;
        return !isNaN(slotStart.getTime()) && isSameCalendarDay(slotStart, targetDate);
      });

      // Sort chronologically ascending by start time: morning (e.g. 9 AM) -> noon (12 PM) -> evening (4 PM)
      dateSlots.sort((a: any, b: any) => {
        const timeA = new Date(a.start || a.startTime).getTime();
        const timeB = new Date(b.start || b.startTime).getTime();
        return timeA - timeB;
      });

      const dayMeetings = dateSlots.map((slot: any, sIdx: number) => {
        const start = new Date(slot.start || slot.startTime);
        let end = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(start.getTime() + 30 * 60000);
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getTime() + 30 * 60000);
        }

        const active = isSameCalendarDay(now, targetDate) && now >= start && now <= end;

        // Anonymize title in correct chronological number order (Meeting 1, Meeting 2, Meeting 3...)
        const displayTitle = isSelf || !slot.isPrivate
          ? (slot.meetingTitle || slot.title || `Meeting ${sIdx + 1}`)
          : `Meeting ${sIdx + 1}`;

        return {
          title: displayTitle,
          isPrivate: !isSelf && slot.isPrivate,
          time: `${formatISTTime(start)} - ${formatISTTime(end)}`,
          active,
          rawStart: start,
        };
      });

      // Live presence is checked against real active meetings TODAY
      const todaySlots = availBusySlots.filter((slot: any) => {
        const slotStart = new Date(slot.start || slot.startTime);
        let slotEnd = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(slotStart.getTime() + 30 * 60000);
        if (slotEnd.getTime() <= slotStart.getTime()) slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const durationHours = (slotEnd.getTime() - slotStart.getTime()) / 3600000;
        const titleLower = (slot.meetingTitle || slot.title || '').toLowerCase();
        const isAllDayStatus = slot.isAllDay || durationHours >= 12 || titleLower === 'office' || titleLower === 'wfh';

        if (isAllDayStatus) return false;
        return !isNaN(slotStart.getTime()) && isSameCalendarDay(slotStart, now);
      });
      const isCurrentlyInMeeting = todaySlots.some((slot: any) => {
        const start = new Date(slot.start || slot.startTime);
        let end = slot.end || slot.endTime ? new Date(slot.end || slot.endTime) : new Date(start.getTime() + 30 * 60000);
        if (end.getTime() <= start.getTime()) {
          end = new Date(start.getTime() + 30 * 60000);
        }
        return now >= start && now <= end;
      });

      const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email;

      return {
        id: emp.id,
        name: empName,
        employeeCode: emp.employeeCode || '-',
        entity,
        entityCode: entity,
        entityId: emp.entityId,
        entityName,
        dept: emp.departmentName || 'Product & Tech',
        role: emp.designation || 'Team Specialist',
        avatar: getAvatarByName(empName),
        status: isCurrentlyInMeeting ? 'Busy in Meeting' : 'In Office (Present)',
        isMeeting: isCurrentlyInMeeting,
        workMode: 'IN_OFFICE',
        dayMeetings,
        currentFilter: empDateFilter,
        targetDateStr: formatLocalDateString(targetDate),
      };
    });
  }, [employees, availability, user, availDateFilter, cardDateFilters]);


  const todayIso = new Date().toISOString().split('T')[0];
  const nowHour = new Date().getHours();
  const nowMin = new Date().getMinutes();
  const currentMinutesFromMidnight = nowHour * 60 + nowMin;
  const currentRedLineTopPx = (currentMinutesFromMidnight / 60) * HOUR_HEIGHT;

  // Calendar Scroll container ref for smooth positioning to business/current hours
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'WEEK' && activeTab === 'CALENDAR') {
      const timer = setTimeout(() => {
        if (calendarScrollRef.current) {
          const currentH = new Date().getHours();
          const targetH = Math.max(0, Math.min(18, currentH >= 8 && currentH <= 21 ? currentH - 1 : 8));
          calendarScrollRef.current.scrollTop = targetH * HOUR_HEIGHT;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, activeTab, currentDate]);

  // Filtered employees for search people in sidebar
  const filteredSearchPeople = useMemo(() => {
    if (!searchPeopleQuery.trim()) return [];
    return employees.filter((e) => {
      const full = `${e.firstName || ''} ${e.lastName || ''} ${e.email || ''}`.toLowerCase();
      return full.includes(searchPeopleQuery.toLowerCase());
    });
  }, [employees, searchPeopleQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] bg-white select-none overflow-hidden font-sans">
      {/* 1. TOP GOOGLE CALENDAR NAVBAR (Matches Image 2) */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0 relative z-40">
        {/* Left Section: Logo + Today + Navigation + Month */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 mr-2">
            {/* Google Calendar Icon with live date */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-xs">
              <span className="text-[10px] uppercase font-extrabold leading-none">
                {new Date().toLocaleString('default', { month: 'short' })}
              </span>
              <span className="text-base font-black leading-none mt-0.5">
                {new Date().getDate()}
              </span>
            </div>
            <span className="text-xl font-bold text-gray-700 tracking-tight">Calendar</span>
          </div>

          <button
            onClick={handleToday}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 tracking-tight ml-1">
            {calendarHeaderTitle}
          </h2>
        </div>

        {/* Right Section: Sync, Tab Switch, View Dropdown, Settings */}
        <div className="flex items-center gap-3">
          {/* Main Tab Toggle: Calendar vs Availability */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'CALENDAR' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Calendar
            </button>
            <button
              onClick={() => setActiveTab('AVAILABILITY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'AVAILABILITY' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Availability
            </button>
          </div>

          {/* Connect Google Calendar Button */}
          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 cursor-pointer shadow-2xs transition-all"
            title="Connect Google Calendar Account"
          >
            <Chrome className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Connecting...' : isConnected ? 'Re-Connect Google' : 'Connect Google'}</span>
          </button>

          {/* Sync Google Calendar Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 cursor-pointer shadow-2xs transition-all"
            title="Fetch and sync latest events from Google Calendar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
          </button>

          {/* View Mode Dropdown (Day / Week / Month) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewDropdownOpen(!viewDropdownOpen);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl cursor-pointer bg-white"
            >
              <span className="capitalize">{viewMode.toLowerCase()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {viewDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {(['DAY', 'WEEK', 'MONTH'] as CalendarViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setViewDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold capitalize hover:bg-gray-100 cursor-pointer ${
                      viewMode === mode ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {mode.toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 2. MAIN BODY AREA */}
      {activeTab === 'CALENDAR' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR (Google Calendar Layout - Matches Image 2) */}
          <div className="w-64 border-r border-gray-200 p-4 flex flex-col gap-5 overflow-y-auto shrink-0 bg-white">
            {/* + Create Button (Image 2 style) */}
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] hover:shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_6px_10px_4px_rgba(60,64,67,0.3)] transition-all cursor-pointer w-fit"
            >
              <Plus className="w-5 h-5 text-blue-600 stroke-[2.5]" />
              <span>Create</span>
            </button>

            {/* Mini Month Picker (Matches Image 2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
                <span>{miniCalendarHeaderTitle}</span>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const next = new Date(miniNavMonth);
                      next.setMonth(next.getMonth() - 1);
                      setMiniNavMonth(next);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      const next = new Date(miniNavMonth);
                      next.setMonth(next.getMonth() + 1);
                      setMiniNavMonth(next);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Mini Grid */}
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 gap-y-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
                {miniCalendarDays.map((d, idx) => {
                  const isToday = d.dateStr === todayDateStr;
                  const isSelected = d.dateStr === selectedDateStr;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentDate(d.date);
                        setMiniNavMonth(new Date(d.date));
                      }}
                      className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-semibold transition-all cursor-pointer ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold'
                          : isSelected
                          ? 'bg-blue-100 text-blue-800 font-bold border border-blue-300'
                          : d.isCurrentMonth
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {d.dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search For People Box */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search for people"
                  value={searchPeopleQuery}
                  onChange={(e) => setSearchPeopleQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100/80 hover:bg-gray-100 focus:bg-white text-xs font-semibold rounded-xl border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {filteredSearchPeople.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  {filteredSearchPeople.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => openCreateModal()}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-xs"
                    >
                      <img
                        src={getAvatarByName(`${emp.firstName || ''} ${emp.lastName || ''}`)}
                        alt={emp.firstName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-gray-700 truncate">{emp.firstName} {emp.lastName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CALENDAR TIME GRID (Full 24-Hour Scrollable View matching Google Calendar in Image 2 & 3) */}
          <div ref={calendarScrollRef} className="flex-1 flex flex-col overflow-y-auto bg-white select-none custom-scrollbar">
            {/* WEEK VIEW */}
            {viewMode === 'WEEK' && (
              <div className="flex flex-col min-w-[750px]">
                {/* Day Header Row */}
                <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-gray-200 sticky top-0 bg-white z-20 shadow-2xs">
                  <div className="p-2 border-r border-gray-200 flex flex-col items-end justify-end pr-2 pb-1.5 select-none bg-white">
                    <span className="text-[10px] text-gray-400 font-medium">GMT+05:30</span>
                  </div>
                  {weekDays.map((dayItem) => {
                    const isToday = dayItem.dateStr === todayDateStr;
                    const isSelected = dayItem.dateStr === selectedDateStr;

                    return (
                      <div
                        key={dayItem.dateStr}
                        className="p-2 text-center border-r border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 bg-white"
                        onClick={() => {
                          setCurrentDate(dayItem.date);
                          setMiniNavMonth(new Date(dayItem.date));
                          setViewMode('DAY');
                        }}
                      >
                        <span className={`text-[11px] font-extrabold uppercase tracking-wide ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                          {dayItem.dayName}
                        </span>
                        <span
                          className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                            isToday
                              ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                              : isSelected
                              ? 'border-2 border-blue-600 text-blue-700 font-bold bg-blue-50/40'
                              : 'text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {dayItem.dayNum}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Full 24-Hour Time Grid (48px/hour) */}
                <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
                  {/* Hours Label Column (Aligned with grid line, Google Calendar styling) */}
                  <div className="border-r border-gray-200 select-none bg-white relative">
                    {HOURS.map((hour) => {
                      const hourStr = hour === 0 ? '' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                      return (
                        <div
                          key={hour}
                          className="h-[48px] relative"
                        >
                          {hourStr && (
                            <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-gray-400 text-right select-none">
                              {hourStr}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 7 Days Columns */}
                  {weekDays.map((dayItem) => {
                    const dayMeetings = meetingsByDate[dayItem.dateStr] || [];
                    const isToday = dayItem.dateStr === todayIso;

                    return (
                      <div
                        key={dayItem.dateStr}
                        className={`relative border-r border-gray-200 bg-white ${
                          isToday ? 'bg-blue-50/15' : ''
                        }`}
                      >
                        {/* 48px Hour Slots across all 24 hours */}
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            onClick={() => openCreateModal(dayItem.dateStr, hour)}
                            className="h-[48px] border-b border-gray-100 hover:bg-amber-50/20 cursor-pointer transition-colors"
                          />
                        ))}

                        {/* Live Current Time Red Line Indicator (IST time indicator across 24h) */}
                        {isToday && (
                          <div
                            className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                            style={{ top: `${currentRedLineTopPx}px` }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1.25" />
                            <div className="w-full h-0.5 bg-red-600" />
                          </div>
                        )}

                        {/* Meeting Events Overlay (Matches Google Calendar styling in Image 2 & 3) */}
                        {dayMeetings.map((m: any, mIdx: number) => {
                          const start = m.startTime ? new Date(m.startTime) : new Date();
                          const end = m.endTime ? new Date(m.endTime) : new Date(start.getTime() + 30 * 60000);

                          const startHours = start.getHours() + start.getMinutes() / 60;
                          const endHours = end.getHours() + end.getMinutes() / 60;

                          const durationHours = Math.max(0.35, endHours - startHours);
                          const topPx = startHours * HOUR_HEIGHT;
                          const heightPx = Math.max(22, durationHours * HOUR_HEIGHT - 3);

                          const timeFormatted = formatISTTimeShort(start);
                          const isSolidCard = m.title?.toLowerCase().includes('discovery');

                          return (
                            <div
                              key={m.id || mIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMeeting(m);
                              }}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                              }}
                              className={`absolute left-1 right-1 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium overflow-hidden shadow-2xs cursor-pointer transition-all hover:shadow-xs flex items-center justify-between ${
                                isSolidCard
                                  ? 'bg-[#e09800] text-white border border-[#c68a00] font-semibold'
                                  : 'bg-white hover:bg-amber-50/50 text-[#b07200] border border-[#c68a00] hover:border-[#a35e00]'
                              }`}
                              title={`${m.title} (${formatISTTime(start)} - ${formatISTTime(end)})`}
                            >
                              <div className="truncate font-semibold text-[11px] leading-tight">
                                {m.title}, {timeFormatted}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {viewMode === 'MONTH' && (
              <div className="flex flex-col flex-1">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-white text-center text-[11px] font-extrabold text-gray-500 uppercase py-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px flex-1 min-h-[550px]">
                  {monthViewDays.map((d, idx) => {
                    const dayMeetings = meetingsByDate[d.dateStr] || [];
                    const isToday = d.dateStr === todayIso;

                    return (
                      <div
                        key={idx}
                        onClick={() => openCreateModal(d.dateStr)}
                        className={`min-h-[110px] p-2 bg-white flex flex-col justify-between hover:bg-blue-50/20 cursor-pointer transition-colors ${
                          !d.isCurrentMonth ? 'bg-gray-50/60 text-gray-400' : 'text-gray-800'
                        } ${isToday ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold inline-flex items-center justify-center ${
                              isToday
                                ? 'w-6 h-6 rounded-full bg-blue-600 text-white font-black shadow-2xs'
                                : 'text-gray-700'
                            }`}
                          >
                            {d.dayNum}
                          </span>
                        </div>

                        <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px] custom-scrollbar mt-1">
                          {dayMeetings.slice(0, 3).map((m: any, mIdx: number) => (
                            <div
                              key={m.id || mIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMeeting(m);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-bold truncate bg-[#F6BF26] hover:bg-[#E5AC15] text-[#3c4043] border border-[#d8a313] shadow-2xs"
                            >
                              {m.title}
                            </div>
                          ))}
                          {dayMeetings.length > 3 && (
                            <span className="text-[10px] font-bold text-blue-600 block pl-1">
                              +{dayMeetings.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === 'DAY' && (
              <div className="p-6 max-w-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-800">
                    {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => openCreateModal(currentDate.toISOString().split('T')[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Event</span>
                  </button>
                </div>

                {(meetingsByDate[currentDate.toISOString().split('T')[0]] || []).length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-700">No meetings scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(meetingsByDate[currentDate.toISOString().split('T')[0]] || []).map((m: any, mIdx: number) => (
                      <div
                        key={m.id || mIdx}
                        onClick={() => setSelectedMeeting(m)}
                        className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                          <p className="text-xs text-gray-500 font-medium">
                            {formatISTTime(m.startTime)} – {formatISTTime(m.endTime)}
                          </p>
                        </div>
                        {m.googleMeetUrl && (
                          <a
                            href={m.googleMeetUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCHEDULE / AGENDA VIEW */}
            {viewMode === 'SCHEDULE' && (
              <div className="p-6 max-w-3xl mx-auto w-full space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Scheduled Feed</h3>
                {validMeetings.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => setSelectedMeeting(m)}
                    className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                      <div className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(m.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    {m.googleMeetUrl && (
                      <a
                        href={m.googleMeetUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AVAILABILITY TAB (Clean cards with single status pill & chronological time ordering) */
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Team Availability & Schedule</h3>
              <p className="text-xs text-gray-500 font-medium">Real-time status and chronological meeting slots (Morning → Noon → Evening). Colleague private details are securely anonymized.</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Office
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> In Meeting
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {livePresenceList.map((item) => {
              const cardLabel = item.currentFilter === 'TOMORROW' ? "Tomorrow's" : "Today's";
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Top Bar: Avatar + Name + Entity */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-2xs"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              item.isMeeting ? 'bg-amber-500 ring-2 ring-amber-400 animate-ping' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.name}</h3>
                          <span className="text-xs font-semibold text-emerald-700 block">{item.role}</span>
                          <span className="text-[10px] font-mono text-gray-400 font-bold block">{item.employeeCode}</span>
                        </div>
                      </div>

                      {(() => {
                        const badge = getEntityBadge(item);
                        return (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wide border ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Single Clean Presence Status Pill */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        item.isMeeting
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isMeeting ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="truncate">{item.status}</span>
                    </div>

                    {/* Department */}
                    <div className="text-[11px] font-semibold text-gray-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span>Department:</span>
                      <span className="font-bold text-gray-800">{item.dept}</span>
                    </div>

                    {/* Dynamic Timeline Schedule (Morning -> Noon -> Evening Order) */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> {cardLabel} Meetings
                        </span>
                        <span className="text-blue-700 font-extrabold">({item.dayMeetings.length})</span>
                      </div>

                      {/* Per-Card Quick Date Filter Switcher */}
                      <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-200/60 text-[10px] font-bold">
                        {(['TODAY', 'TOMORROW'] as const).map((filterOpt) => (
                          <button
                            key={filterOpt}
                            onClick={() => setCardDateFilters(prev => ({ ...prev, [item.id]: filterOpt }))}
                            className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                              item.currentFilter === filterOpt
                                ? 'bg-white text-blue-700 shadow-2xs font-extrabold border border-gray-200/50'
                                : 'text-gray-400 hover:text-gray-700'
                            }`}
                          >
                            {filterOpt === 'TODAY' ? 'Today' : 'Tomorrow'}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {item.dayMeetings.length === 0 ? (
                          <div className="p-2.5 rounded-xl border border-dashed border-gray-200 text-center text-[11px] font-medium text-gray-400 bg-gray-50/50">
                            No meetings scheduled for this day. Available for focus work.
                          </div>
                        ) : (
                          item.dayMeetings.map((m: any, mIdx: number) => (
                            <div
                              key={m.title + mIdx}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                                m.active
                                  ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20'
                                  : 'bg-gray-50/60 border-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900 line-clamp-1">{m.title}</span>
                                {m.active && (
                                  <span className="text-[9px] font-extrabold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded uppercase shrink-0">
                                    Active Now
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>{m.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Button */}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEventGuests([item.name]);
                        openCreateModal(item.targetDateStr);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Schedule Meeting with {item.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* 3. GOOGLE CALENDAR CREATE EVENT MODAL (EXACT 1:1 REPLICA OF IMAGE 3) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Bar with Grab handle & Close (Image 3) */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 text-gray-400">
              <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto" />
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 text-gray-500 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateMeeting} className="px-6 pb-6 space-y-4">
              {/* Title Input with Blue Underline (Image 3) */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Add title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-1.5 outline-none placeholder:text-gray-400 focus:border-blue-700"
                />
              </div>

              {/* Event / Task / Appointment schedule Tabs (Image 3) */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEventMode('EVENT')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    eventMode === 'EVENT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Event
                </button>
                <button
                  type="button"
                  onClick={() => setEventMode('TASK')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    eventMode === 'TASK'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Task
                </button>
                <button
                  type="button"
                  onClick={() => setEventMode('APPOINTMENT')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    eventMode === 'APPOINTMENT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Appointment schedule
                </button>
              </div>

              {/* Date & Time Row (Image 3 Clock icon) */}
              <div className="flex items-start gap-3.5 pt-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-800">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 outline-none text-xs font-bold"
                    />
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 outline-none text-xs font-bold"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 outline-none text-xs font-bold"
                    />
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Indian Standard Time (Kolkata, GMT+05:30) • Does not repeat</span>
                  </div>
                </div>
              </div>

              {/* Guests Row (Image 3 Users icon) */}
              <div className="flex items-start gap-3.5 pt-1">
                <Users className="w-5 h-5 text-gray-500 mt-1.5 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add guests (email or name)"
                      value={guestInput}
                      onChange={(e) => setGuestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGuest(guestInput);
                        }
                      }}
                      className="w-full text-xs font-medium text-gray-800 bg-transparent placeholder:text-gray-500 outline-none border-b border-gray-200 focus:border-blue-500 pb-1"
                    />
                    {guestInput.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddGuest(guestInput)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg shrink-0"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {eventGuests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {eventGuests.map((g, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold"
                        >
                          {g}
                          <button
                            type="button"
                            onClick={() => setEventGuests(eventGuests.filter((_, i) => i !== idx))}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Google Meet Video Conferencing (Image 3 Yellow Camera Icon) */}
              <div className="flex items-center gap-3.5 pt-1">
                <div className="w-5 h-5 rounded-md bg-[#FBBC04] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Video className="w-3.5 h-3.5 fill-current" />
                </div>
                <button
                  type="button"
                  onClick={() => setHasGoogleMeet(!hasGoogleMeet)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-2"
                >
                  <span>{hasGoogleMeet ? '✓ Google Meet video conferencing added' : 'Add Google Meet video conferencing'}</span>
                </button>
              </div>

              {/* Location Row (Image 3 MapPin icon) */}
              <div className="flex items-center gap-3.5 pt-1">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Add location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent placeholder:text-gray-500 outline-none border-b border-transparent focus:border-blue-500 pb-0.5"
                />
              </div>

              {/* Description Row (Image 3 AlignLeft icon) */}
              <div className="flex items-center gap-3.5 pt-1">
                <AlignLeft className="w-5 h-5 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Add description or meeting agenda"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent placeholder:text-gray-500 outline-none border-b border-transparent focus:border-blue-500 pb-0.5"
                />
              </div>

              {/* Calendar & Owner Row (Image 3 Calendar icon with yellow circle) */}
              <div className="flex items-start gap-3.5 pt-1">
                <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>{user?.name || user?.email || 'Ashutosh Mishra'}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F6BF26]" />
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    Busy • Kolkata (GMT+05:30) • Notify 30 minutes before
                  </div>
                </div>
              </div>

              {/* Bottom Footer with More Options & Save Button (Image 3) */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-md transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. GOOGLE CALENDAR EVENT DETAIL MODAL WITH INTEGRATED MoM UPLOAD & VIEWER */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Top Header Icons (Image 4) */}
            <div className="flex items-center justify-between p-3.5 px-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#c68a00]" />
                {/* Tabs Switcher: Event Details / Minutes of Meeting (MoM) */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/80">
                  <button
                    onClick={() => setDetailModalTab('DETAILS')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      detailModalTab === 'DETAILS'
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Event Details
                  </button>
                  <button
                    onClick={() => setDetailModalTab('MOM')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailModalTab === 'MOM'
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>MoM / Notes</span>
                    {currentMomFiles.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {currentMomFiles.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <button
                  onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                  title="Cancel / Delete Meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleConvertToTask(selectedMeeting)}
                  className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
                  title="Convert to Task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: STANDARD EVENT DETAILS (Image 4 replica) */}
            {detailModalTab === 'DETAILS' && (
              <div className="p-6 space-y-4.5 overflow-y-auto custom-scrollbar">
                {/* Title & Date */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {selectedMeeting.title}
                    </h3>
                    {new Date() > new Date(selectedMeeting.endTime || selectedMeeting.startTime) ? (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                        Past Meeting
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {selectedMeeting.startTime
                      ? `${new Date(selectedMeeting.startTime).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })} • ${formatISTTime(selectedMeeting.startTime)} – ${
                          selectedMeeting.endTime ? formatISTTime(selectedMeeting.endTime) : ''
                        } (IST)`
                      : 'Scheduled'}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Indian Standard Time (Kolkata, GMT+05:30)
                  </div>
                </div>

                {/* Google Meet Block (Image 4) */}
                {selectedMeeting.googleMeetUrl && (
                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="w-6 h-6 rounded-md bg-[#FBBC04] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                      <Video className="w-4 h-4 fill-current" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <a
                        href={selectedMeeting.googleMeetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-700 hover:underline block"
                      >
                        Join with Google Meet
                      </a>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-500 font-mono truncate">
                          {selectedMeeting.googleMeetUrl.replace(/^https?:\/\//, '')}
                        </span>
                        <button
                          onClick={() => handleCopyMeetLink(selectedMeeting.googleMeetUrl)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors cursor-pointer shrink-0"
                          title="Copy link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick MoM Banner (Click to jump to MoM & Uploads) */}
                <div
                  onClick={() => setDetailModalTab('MOM')}
                  className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">Minutes of Meeting (MoM)</h4>
                      <p className="text-[11px] text-amber-700 font-medium">
                        {currentMomFiles.length > 0 || currentMomNotes
                          ? `${currentMomFiles.length} file(s) attached • View or edit notes`
                          : 'Upload documents or add meeting summary & action items'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 underline">Open MoM →</span>
                </div>

                {/* Guests Count & List (Image 4) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>
                        {Array.isArray(selectedMeeting.invitees) && selectedMeeting.invitees.length > 0
                          ? `${selectedMeeting.invitees.length} guests`
                          : '1 guest'}
                      </span>
                    </div>
                    <Mail className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </div>

                  {/* Attendee Avatars */}
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <span className="font-bold text-gray-800">
                        {user?.name || 'Organizer'} (Organizer)
                      </span>
                    </div>
                    {Array.isArray(selectedMeeting.invitees) &&
                      selectedMeeting.invitees.map((inv: any, i: number) => {
                        const nameOrEmail = typeof inv === 'string' ? inv : inv.name || inv.email;
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <img
                              src={getAvatarByName(nameOrEmail)}
                              alt={nameOrEmail}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                            <span className="font-medium text-gray-700">{nameOrEmail}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Notification info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span>30 minutes before (IST)</span>
                </div>

                {/* Bottom Going Response (Image 4: Going? Yes No Maybe) */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">Going?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        toast.success('Response saved: Yes');
                        setSelectedMeeting(null);
                      }}
                      className="px-3.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Response saved: No');
                        setSelectedMeeting(null);
                      }}
                      className="px-3.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      No
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Response saved: Maybe');
                        setSelectedMeeting(null);
                      }}
                      className="px-3.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Maybe
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MINUTES OF MEETING (MoM) UPLOAD & VIEWER */}
            {detailModalTab === 'MOM' && (
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Minutes of Meeting (MoM)</h4>
                    <p className="text-[11px] text-gray-500">Record discussion notes, decisions, action items, and upload MoM files for past or future reference.</p>
                  </div>
                </div>

                {/* Discussion Summary Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Meeting Summary & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter key discussion topics, meeting notes, or agenda highlights..."
                    value={currentMomNotes}
                    onChange={(e) => setCurrentMomNotes(e.target.value)}
                    className="w-full p-2.5 text-xs text-gray-800 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                {/* Key Decisions Made */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Key Decisions Taken
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g., Approved design sprint roadmap, finalized API specifications..."
                    value={currentMomDecisions}
                    onChange={(e) => setCurrentMomDecisions(e.target.value)}
                    className="w-full p-2.5 text-xs text-gray-800 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                {/* Action Items & Next Steps */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Action Items & Assigned Owners
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g., [Pranshu] Update documentation by Friday, [Ashutosh] Deploy release v2.1..."
                    value={currentMomActionItems}
                    onChange={(e) => setCurrentMomActionItems(e.target.value)}
                    className="w-full p-2.5 text-xs text-gray-800 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                {/* MoM Document Upload Zone */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-gray-500" /> Uploaded MoM Documents ({currentMomFiles.length})
                    </label>
                    <label className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload MoM File</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={handleMomFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {currentMomFiles.length === 0 ? (
                    <div className="p-3 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400 bg-gray-50/50">
                      No documents attached. You can upload PDF, Word docs, notes, or screenshots.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {currentMomFiles.map((fileObj, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <File className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-gray-800 block truncate">{fileObj.name}</span>
                              <span className="text-[10px] text-gray-400">{fileObj.size} • {fileObj.uploadedAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {fileObj.url && (
                              <a
                                href={fileObj.url}
                                download={fileObj.name}
                                className="p-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-gray-200 rounded-lg cursor-pointer"
                                title="Download MoM File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentMomFiles(currentMomFiles.filter((_, i) => i !== idx))}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions for MoM */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDetailModalTab('DETAILS')}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1.5"
                  >
                    ← Back to Details
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMom}
                    disabled={isSavingMom}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingMom ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving MoM...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save MoM</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


