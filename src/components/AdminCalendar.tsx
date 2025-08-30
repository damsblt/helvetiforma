'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, DateSelectArg, EventInput, EventChangeArg, EventDropArg } from '@fullcalendar/core';

interface Formation {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Type: 'Présentiel' | 'En ligne';
    Theme: 'Salaire' | 'Assurances sociales' | 'Impôt à la source';
    difficulty: string;
    estimatedDuration: number;
    sessions?: Session[];
  };
}

interface Session {
  id: number;
  attributes: {
    date: string;
    formation?: Formation;
  };
}

interface AdminCalendarProps {
  formations?: Formation[];
  onEventClick?: (eventInfo: EventClickArg) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventChange?: (changeInfo: EventChangeArg) => void;
  onEventDrop?: (dropInfo: EventDropArg) => void;
  height?: string;
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({
  formations = [],
  onEventClick,
  onDateSelect,
  onEventChange,
  onEventDrop,
  height = '700px',
  view = 'timeGridWeek',
}) => {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    if (formations) {
      const calendarEvents: EventInput[] = [];
      
      formations.forEach((formation) => {
        if (formation.attributes.sessions) {
          formation.attributes.sessions.forEach((session) => {
            if (session.attributes.date) {
              const sessionDate = new Date(session.attributes.date);
              const endDate = new Date(sessionDate);
              endDate.setHours(endDate.getHours() + (formation.attributes.estimatedDuration || 2));
              
              // Get category color
              const getCategoryColor = (theme: string) => {
                switch (theme) {
                  case 'Salaire':
                    return { bg: '#10B981', border: '#059669' }; // Green
                  case 'Assurances sociales':
                    return { bg: '#8B5CF6', border: '#7C3AED' }; // Purple
                  case 'Impôt à la source':
                    return { bg: '#F59E0B', border: '#D97706' }; // Orange
                  default:
                    return { bg: '#6B7280', border: '#4B5563' }; // Gray
                }
              };

              const colors = getCategoryColor(formation.attributes.Theme);
              
              calendarEvents.push({
                id: `session-${session.id}`,
                title: `${formation.attributes.Title} (${formation.attributes.Theme})`,
                start: sessionDate,
                end: endDate,
                backgroundColor: formation.attributes.Type === 'Présentiel' ? colors.bg : '#6B7280',
                borderColor: formation.attributes.Type === 'Présentiel' ? colors.border : '#4B5563',
                textColor: '#FFFFFF',
                editable: true,
                extendedProps: {
                  formationId: formation.id,
                  sessionId: session.id,
                  type: formation.attributes.Type,
                  theme: formation.attributes.Theme,
                  difficulty: formation.attributes.difficulty,
                  duration: formation.attributes.estimatedDuration,
                  originalTitle: formation.attributes.Title,
                },
              });
            }
          });
        }
      });
      
      setEvents(calendarEvents);
    }
  }, [formations]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      onEventClick(clickInfo);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  const handleEventChange = (changeInfo: EventChangeArg) => {
    if (onEventChange) {
      onEventChange(changeInfo);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (onEventDrop) {
      onEventDrop(dropInfo);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Calendrier Administrateur</h3>
        <p className="text-blue-700 text-sm">
          Glissez-déposez les sessions pour modifier leurs horaires. Cliquez sur une session pour la modifier.
        </p>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView={view}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventChange={handleEventChange}
        eventDrop={handleEventDrop}
        height={height}
        locale="fr"
        buttonText={{
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          list: 'Liste',
        }}
        dayHeaderFormat={{ weekday: 'long' }}

        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        selectConstraint={{
          startTime: '08:00',
          endTime: '20:00',
          dows: [1, 2, 3, 4, 5], // Monday to Friday
        }}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          startTime: '08:00',
          endTime: '20:00',
        }}

        eventDidMount={(info) => {
          // Add tooltip with formation details
          const event = info.event;
          const theme = event.extendedProps.theme;
          const type = event.extendedProps.type;
          const difficulty = event.extendedProps.difficulty;
          
          info.el.title = `${event.extendedProps.originalTitle || event.title}\nThème: ${theme}\nType: ${type}\nDifficulté: ${difficulty}`;
        }}
      />
    </div>
  );
};

export default AdminCalendar;
