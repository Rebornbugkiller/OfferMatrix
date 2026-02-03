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
    // 判断面试时间是否已过
    const now = new Date();
    const endTime = new Date(interview.end_time);
    if (endTime < now) {
      return '#f97316'; // orange - 已过期但未更新状态
    }
    return '#3b82f6'; // blue - 待进行
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
    title: `${interview.application?.company_name || 'Unknown'} - ${interview.round_name}`,
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
        eventDidMount={(info) => {
          const interview = info.event.extendedProps.interview as Interview;
          const tooltipText = `${interview.application?.company_name}\n${interview.application?.job_title}\n${interview.round_name}`;
          info.el.setAttribute('title', tooltipText);
        }}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
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
