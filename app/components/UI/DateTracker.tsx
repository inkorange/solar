'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/app/store/useStore';
import styles from './DateTracker.module.scss';

export default function DateTracker() {
  const { simulationTime, setSimulationTime, timeSpeed } = useStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Capture the start date once when component mounts
  const startDateRef = useRef<Date>(new Date());

  // Calculate current simulation date based on simulation time
  const getSimulationDate = (simTime: number): Date => {
    // simulationTime is in seconds since app started
    // Use the fixed start date from when component mounted
    const date = new Date(startDateRef.current.getTime() + simTime * 1000);
    return date;
  };

  const currentDate = getSimulationDate(simulationTime);

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize selected date when picker opens
  useEffect(() => {
    if (showDatePicker) {
      setSelectedDate(formatDateForInput(currentDate));
    }
  }, [showDatePicker]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleApplyDate = () => {
    if (!selectedDate) return;

    const targetDate = new Date(selectedDate);
    const now = new Date();
    const timeDiffSeconds = (targetDate.getTime() - now.getTime()) / 1000;

    setSimulationTime(timeDiffSeconds);
    setShowDatePicker(false);
  };

  const handleResetToNow = () => {
    setSimulationTime(0); // Reset to current time
    setShowDatePicker(false);
  };

  const getTimeSpeedLabel = (): string => {
    if (timeSpeed >= 1000000) return `${(timeSpeed / 1000000).toFixed(0)}Mx`;
    if (timeSpeed >= 1000) return `${(timeSpeed / 1000).toFixed(0)}kx`;
    return `${timeSpeed}x`;
  };

  return (
    <div className={styles.dateTracker}>
      <div className={styles.dateDisplay}>
        <div className={styles.date}>{formatDate(currentDate)}</div>
        <div className={styles.time}>{formatTime(currentDate)}</div>
        <div className={styles.speed}>Speed: {getTimeSpeedLabel()}</div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={() => setShowDatePicker(!showDatePicker)}
          title="Pick a date"
        >
          📅
        </button>
        <button
          className={styles.button}
          onClick={handleResetToNow}
          title="Reset to current time"
        >
          ↻
        </button>
      </div>

      {showDatePicker && (
        <div className={styles.datePicker}>
          <div className={styles.pickerHeader}>
            <h4>Select Date</h4>
            <button
              className={styles.closeButton}
              onClick={() => setShowDatePicker(false)}
            >
              ×
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className={styles.dateInput}
            min="1900-01-01"
            max="2100-12-31"
          />
          <div className={styles.pickerActions}>
            <button onClick={handleApplyDate} className={styles.applyButton}>
              Apply
            </button>
            <button onClick={handleResetToNow} className={styles.resetButton}>
              Reset to Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
