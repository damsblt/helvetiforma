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
      
      {/* Custom CSS for FullCalendar styling */}
      <style jsx global>{`
        /* Custom FullCalendar styling to match website design */
        .fc {
          font-family: inherit;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Header toolbar styling */
        .fc-toolbar {
          background: white;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
        }
        
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }
        
        /* Button styling */
        .fc-button {
          border-radius: 8px !important;
          border: 1px solid #d1d5db !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        
        .fc-button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        .fc-button-primary {
          background-color: #6b7280 !important;
          border-color: #6b7280 !important;
          color: white !important;
        }
        
        .fc-button-primary:hover {
          background-color: #4b5563 !important;
          border-color: #4b5563 !important;
        }
        
        .fc-button-active {
          background-color: #374151 !important;
          border-color: #374151 !important;
        }
        
        /* Today button special styling */
        .fc-today-button {
          background-color: #6b7280 !important;
          border-color: #6b7280 !important;
        }
        
        /* Calendar grid styling */
        .fc-daygrid-day {
          border-color: #f3f4f6 !important;
        }
        
        .fc-timegrid-col {
          border-color: #f3f4f6 !important;
        }
        
        .fc-timegrid-slot {
          border-color: #f9fafb !important;
        }
        
        /* Month view specific styling */
        .fc-dayGridMonth-view .fc-daygrid-day {
          border-radius: 8px !important;
          margin: 2px !important;
          overflow: hidden !important;
        }
        
        .fc-dayGridMonth-view .fc-daygrid-day-frame {
          border-radius: 8px !important;
          border: 1px solid #f3f4f6 !important;
          background: white !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-dayGridMonth-view .fc-daygrid-day:hover .fc-daygrid-day-frame {
          border-color: #d1d5db !important;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1) !important;
        }
        
        .fc-dayGridMonth-view .fc-daygrid-day-number {
          border-radius: 6px !important;
          padding: 4px 8px !important;
          font-weight: 500 !important;
          color: #374151 !important;
        }
        
        .fc-dayGridMonth-view .fc-day-today .fc-daygrid-day-frame {
          border-color: #3b82f6 !important;
          background-color: #eff6ff !important;
        }
        
        .fc-dayGridMonth-view .fc-day-today .fc-daygrid-day-number {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        /* Weekend styling */
        .fc-day-sun {
          background-color: #fef3c7 !important;
        }
        
        .fc-day-sat {
          background-color: #fef3c7 !important;
        }
        
        .fc-day-sun .fc-daygrid-day-frame,
        .fc-day-sat .fc-daygrid-day-frame {
          background-color: #fef3c7 !important;
        }
        
        /* Event styling with rounded corners */
        .fc-event {
          border-radius: 8px !important;
          border: none !important;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1) !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Session colors based on formation themes */
        .fc-event[data-formation="1"] {
          background-color: #2563eb !important; /* Blue for Salaires */
          border-color: #1d4ed8 !important;
        }
        
        .fc-event[data-formation="2"] {
          background-color: #16a34a !important; /* Green for Charges Sociales */
          border-color: #15803d !important;
        }
        
        .fc-event[data-formation="3"] {
          background-color: #9333ea !important; /* Purple for Impôt à la Source */
          border-color: #7c3aed !important;
        }
        
        /* Event text styling */
        .fc-event-title {
          font-weight: 500 !important;
          font-size: 0.875rem !important;
        }
        
        .fc-event-time {
          font-weight: 400 !important;
          font-size: 0.75rem !important;
        }
        
        /* Time column styling */
        .fc-timegrid-axis {
          background-color: #f9fafb !important;
          border-color: #e5e7eb !important;
        }
        
        .fc-timegrid-slot-label {
          color: #6b7280 !important;
          font-weight: 500 !important;
        }
        
        /* Day header styling */
        .fc-col-header-cell {
          background-color: #f9fafb !important;
          border-color: #e5e7eb !important;
        }
        
        .fc-col-header-cell-cushion {
          color: #374151 !important;
          font-weight: 600 !important;
          text-decoration: none !important;
        }
        
        /* List view styling */
        .fc-list-event {
          border-radius: 8px !important;
          margin: 4px 0 !important;
          border: 1px solid #e5e7eb !important;
        }
        
        .fc-list-event:hover {
          background-color: #f9fafb !important;
        }
        
        /* Responsive adjustments */
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
            min-height: 44px !important; /* Better touch target */
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
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="timeGridWeek"
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
        /* Mobile optimizations */
        aspectRatio={window.innerWidth < 768 ? 0.8 : 1.35}
        handleWindowResize={true}
        windowResizeDelay={100}

        eventDidMount={(info) => {
          // Add tooltip with formation details
          const event = info.event;
          const theme = event.extendedProps.theme;
          const type = event.extendedProps.type;
          const difficulty = event.extendedProps.difficulty;
          
          // Add data-formation attribute for CSS styling
          const formationId = event.extendedProps.formation;
          if (formationId) {
            info.el.setAttribute('data-formation', formationId.toString());
          }
          
          info.el.title = `${event.extendedProps.originalTitle || event.title}\nThème: ${theme}\nType: ${type}\nDifficulté: ${difficulty}`;
        }}
      />
    </div>
  );
};

export default AdminCalendar;
