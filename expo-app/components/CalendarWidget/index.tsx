import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";

// Calendar setup
type AttendanceData = {
  [key: number]: { classesAttended: number }; // Number of classes attended out of 6
};

type CalendarWidgetProps = {
  attendanceData?: AttendanceData;
};

const defaultAttendanceData: AttendanceData = {
  3: { classesAttended: 6 }, // Full attendance
  4: { classesAttended: 5 },
  7: { classesAttended: 0 }, // Absent
  8: { classesAttended: 4 },
  9: { classesAttended: 3 },
  10: { classesAttended: 2 },
  11: { classesAttended: 1 },
  12: { classesAttended: 6 },
  15: { classesAttended: 0 }, // Absent
  16: { classesAttended: 5 },
  18: { classesAttended: 4 },
  22: { classesAttended: 3 },
  23: { classesAttended: 0 }, // Absent
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,

    margin: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // border-border-300
  },
  calendarTitle: {
    fontSize: 16,
    fontFamily: "BGSB",
    color: "#000000", // text-typography-950
  },
  calendarMonthSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarMonthText: {
    fontSize: 16,
    fontFamily: "BGSB",
    color: "#6b7280", // text-typography-500
    marginHorizontal: 12,
  },
  weekdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 8,
  },
  weekdayText: {
    fontSize: 14,
    fontFamily: "BGSB",
    color: "#6b7280", // text-typography-500
    flex: 1,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  calendarDay: {
    width: "14%", // 7 days in a week, so roughly 14% each
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCalendarDay: {
    backgroundColor: "#e0f7fa", // Light cyan for selected day
    borderColor: "#21CBF3", // Blue border for selected day
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: "BGSB",
    color: "#111827", // text-typography-950
  },
  presentAbsentDayText: {
    color: "#fff", // White text for better contrast on green/red background
  },
  selectedCalendarDayText: {
    fontFamily: "BGSB",
    color: "#21CBF3", // Blue text for selected day
  },
  calendarLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: "BGSB",
    color: "#6b7280", // text-typography-500
  },
  disabledDay: {
    backgroundColor: "#f3f4f6",
    opacity: 0.5,
  },
  disabledDayText: {
    color: "#9ca3af",
  },
  monthlySummary: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "BGSB",
    color: "#475569",
  },
  holidayDay: {
    backgroundColor: "#adadad", // orange-500
  },
});

const TOTAL_CLASSES_PER_DAY = 6;

const getAttendanceColor = (classesAttended: number) => {
  if (classesAttended === 0) {
    return { backgroundColor: "#f87171" }; // red-400 for absent
  }
  const opacity = classesAttended / TOTAL_CLASSES_PER_DAY;
  return {
    backgroundColor: `rgba(52, 211, 153, ${opacity})`, // green-400 with varying opacity
  };
};

type DeclaredHolidays = {
  [key: number]: string;
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  attendanceData = defaultAttendanceData,
}) => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Add declared holidays
  const declaredHolidays: DeclaredHolidays = {
    15: "Independence Day", // Example holiday on the 15th
  };

  // Calculate monthly attendance
  const calculateMonthlyAttendance = () => {
    let totalClasses = 0;
    let totalDays = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(currentYear, currentMonth, i).getDay();
      if (dayOfWeek !== 0) {
        // Skip Sundays
        totalDays++;
        const attendance = attendanceData[i];
        if (attendance) {
          totalClasses += attendance.classesAttended;
        }
      }
    }

    return { totalClasses, totalDays };
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === selectedDay;
      const attendance = attendanceData[i];
      const dayOfWeek = new Date(currentYear, currentMonth, i).getDay();
      const isSunday = dayOfWeek === 0;
      const isHoliday = declaredHolidays[i];

      let statusStyle: any = {};
      if (isHoliday) {
        statusStyle = styles.holidayDay;
      } else if (attendance && !isSunday) {
        statusStyle = getAttendanceColor(attendance.classesAttended);
      }

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            statusStyle,
            isSelected && styles.selectedCalendarDay,
            isSunday && styles.disabledDay,
          ]}
          onPress={() => !isSunday && setSelectedDay(i)}
          disabled={isSunday}
        >
          <Text
            style={[
              styles.calendarDayText,
              attendance && !isSunday && styles.presentAbsentDayText,
              isSelected && styles.selectedCalendarDayText,
              isSunday && styles.disabledDayText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const { totalClasses, totalDays } = calculateMonthlyAttendance();
  const totalPossibleClasses = totalDays * TOTAL_CLASSES_PER_DAY;

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>My Attendance</Text>
        <View style={styles.calendarMonthSelector}>
          <TouchableOpacity
            onPress={() => {
              const newMonth = currentMonth - 1;
              if (newMonth < 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(newMonth);
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#7E8793" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {months[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newMonth = currentMonth + 1;
              if (newMonth > 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(newMonth);
              }
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#7E8793" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdaysContainer}>
        {weekdays.map((day, index) => (
          <Text key={index} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>{generateCalendarDays()}</View>

      <View style={styles.monthlySummary}>
        <Text style={styles.summaryText}>
          Monthly Attendance: {totalClasses}/{totalPossibleClasses} classes (
          {Math.round((totalClasses / totalPossibleClasses) * 100)}%)
        </Text>
      </View>

      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#34d399", opacity: 1 },
            ]}
          />
          <Text style={styles.legendText}>6/6 Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#34d399", opacity: 0.5 },
            ]}
          />
          <Text style={styles.legendText}>4/6 Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#34d399", opacity: 0.2 },
            ]}
          />
          <Text style={styles.legendText}>2/6 Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f87171" }]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#adadad" }]} />
          <Text style={styles.legendText}>Holiday</Text>
        </View>
      </View>
    </View>
  );
};

export default CalendarWidget;
