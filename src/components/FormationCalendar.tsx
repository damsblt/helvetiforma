'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';

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

interface FormationCalendarProps {
  formations?: Formation[];
  onEventClick?: (eventInfo: EventClickArg) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  height?: string;
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  editable?: boolean;
  selectable?: boolean;
}

const FormationCalendar: React.FC<FormationCalendarProps> = ({
  formations = [],
  onEventClick,
  onDateSelect,
  height = '600px',
  view = 'dayGridMonth',
  editable = false,
  selectable = false,
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

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView={view}
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
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
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}

        eventDidMount={(info) => {
          // Add tooltip with formation details
          const event = info.event;
          const theme = event.extendedProps.theme;
          const type = event.extendedProps.type;
          const difficulty = event.extendedProps.difficulty;
          
          info.el.title = `${event.title}\nThème: ${theme}\nType: ${type}\nDifficulté: ${difficulty}`;
        }}
      />
    </div>
  );
};

export default FormationCalendar;
