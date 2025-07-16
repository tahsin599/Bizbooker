import React from 'react';
import './List.css';
import { Calendar, Clock } from 'lucide-react';

const ScheduleList = ({ schedules = [] }) => {
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (schedules.length === 0) {
    return (
      <div className="schedule-list">
        <div className="no-schedule">
          <div className="no-schedule-icon">
            <Calendar size={48} />
          </div>
          <p>No schedule available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-list">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="schedule-item">
          <div className="schedule-time">
            <Clock size={16} className="time-icon" />
            <span className="time">{schedule.time}</span>
            <span className="date">{formatDate(schedule.date)}</span>
          </div>
          <div className="schedule-details">
            <h4 className="schedule-name">{schedule.name}</h4>
            <p className="schedule-date-full">{schedule.date}</p>
          </div>
          <div className="schedule-status">
            <div className="status-dot"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;