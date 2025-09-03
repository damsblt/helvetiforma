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
  editable?: boolean;
  selectable?: boolean;
}

const FormationCalendar: React.FC<FormationCalendarProps> = ({
  formations = [],
  onEventClick,
  onDateSelect,
  height = '600px',
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
                    return { bg: '#2563EB', border: '#1D4ED8' }; // Blue
                  case 'Assurances sociales':
                    return { bg: '#16A34A', border: '#15803D' }; // Green
                  case 'Impôt à la source':
                    return { bg: '#9333EA', border: '#7C3AED' }; // Purple
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
      {/* Custom CSS for FullCalendar mobile responsiveness */}
      <style jsx global>{`
        /* Mobile-responsive FullCalendar styling */
        @media (max-width: 768px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 12px;
            padding: 12px 16px;
          }
          
          .fc-toolbar-chunk {
            justify-content: center;
          }
          
          .fc-toolbar-title {
            font-size: 1rem !important;
            text-align: center;
          }
          
          /* Mobile-optimized buttons */
          .fc-button {
            padding: 8px 12px !important;
            font-size: 0.875rem !important;
            min-height: 44px !important;
          }
          
          /* Mobile calendar grid */
          .fc-timegrid-axis {
            min-width: 60px !important;
            font-size: 0.75rem !important;
          }
          
          .fc-timegrid-slot-label {
            font-size: 0.75rem !important;
            padding: 4px 8px !important;
          }
          
          .fc-col-header-cell {
            min-width: 80px !important;
            font-size: 0.75rem !important;
          }
          
          .fc-col-header-cell-cushion {
            font-size: 0.75rem !important;
            padding: 8px 4px !important;
          }
          
          /* Mobile event styling */
          .fc-event {
            font-size: 0.75rem !important;
            padding: 2px 4px !important;
            margin: 1px !important;
          }
          
          .fc-event-title {
            font-size: 0.75rem !important;
            line-height: 1.2 !important;
          }
          
          .fc-event-time {
            font-size: 0.625rem !important;
          }
          
          /* Mobile month view */
          .fc-daygrid-day {
            min-height: 60px !important;
          }
          
          .fc-daygrid-day-number {
            font-size: 0.875rem !important;
            padding: 4px !important;
          }
          
          /* Mobile list view */
          .fc-list-event {
            padding: 8px 12px !important;
          }
          
          .fc-list-event-title {
            font-size: 0.875rem !important;
          }
        }
        
        /* Extra small mobile devices */
        @media (max-width: 480px) {
          .fc-toolbar {
            padding: 8px 12px;
          }
          
          .fc-toolbar-title {
            font-size: 0.875rem !important;
          }
          
          .fc-button {
            padding: 6px 8px !important;
            font-size: 0.75rem !important;
            min-height: 40px !important;
          }
          
          .fc-timegrid-axis {
            min-width: 50px !important;
          }
          
          .fc-col-header-cell {
            min-width: 70px !important;
          }
          
          .fc-event {
            font-size: 0.625rem !important;
            padding: 1px 2px !important;
          }
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        initialView="listWeek"
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
        /* Mobile optimizations */
        aspectRatio={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1.35}
        handleWindowResize={true}
        windowResizeDelay={100}
      />
    </div>
  );
};

export default FormationCalendar;
