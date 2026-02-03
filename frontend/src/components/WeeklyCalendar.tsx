import { useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { Interview } from '../types';

interface WeeklyCalendarProps {
  interviews: Interview[];
  onEventClick: (interview: Interview) => void;
  onEventDrop: (id: number, start: Date, end: Date) => void;
}

const getEventColor = (interview: Interview): string => {
  if (interview.status === 'CANCELLED') {
    return '#9ca3af'; // gray
  }
  if (interview.status === 'SCHEDULED') {
    return '#3b82f6'; // blue
  }
  // FINISHED - check application status
  if (interview.application?.current_status === 'REJECTED') {
    return '#ef4444'; // red
  }
  if (interview.application?.current_status === 'OFFER') {
    return '#22c55e'; // green
  }
  return '#22c55e'; // default green for finished
};

export default function WeeklyCalendar({
  interviews,
  onEventClick,
  onEventDrop,
}: WeeklyCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  const events = interviews.map((interview) => ({
    id: String(interview.id),
    title: `${interview.application?.company_name || 'Unknown'} - ${interview.application?.job_title || ''} - ${interview.round_name}`,
    start: interview.start_time,
    end: interview.end_time,
    backgroundColor: getEventColor(interview),
    borderColor: getEventColor(interview),
    extendedProps: { interview },
  }));

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const interview = info.event.extendedProps.interview as Interview;
      onEventClick(interview);
    },
    [onEventClick]
  );

  const handleEventDrop = useCallback(
    (info: EventDropArg | EventResizeDoneArg) => {
      const id = parseInt(info.event.id, 10);
      const start = info.event.start;
      const end = info.event.end;
      if (start && end) {
        onEventDrop(id, start, end);
      }
    },
    [onEventDrop]
  );

  return (
    <div className="p-4" ref={calendarRef}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={true}
        selectable={false}
        eventStartEditable={true}
        eventDurationEditable={true}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        nowIndicator={true}
        allDaySlot={false}
        displayEventTime={false}
        height="auto"
        locale="zh-cn"
        buttonText={{
          month: '月',
          week: '周',
          day: '日',
        }}
      />
    </div>
  );
}
