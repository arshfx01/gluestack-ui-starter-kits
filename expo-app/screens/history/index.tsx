import { View, Text } from "react-native";
import React from "react";
import CalendarWidget from "@/components/CalendarWidget";

const HistoryScreen = () => {
  const rawAttendanceData = {
    1: { status: "present", classesAttended: 6 }, // Full attendance
    2: { status: "present", classesAttended: 5 },
    3: { status: "present", classesAttended: 4 },
    4: { status: "present", classesAttended: 3 },
    5: { status: "absent", classesAttended: 0 }, // Absent
    6: { status: "absent", classesAttended: 0 }, // Absent
    7: { status: "present", classesAttended: 2 },
    8: { status: "present", classesAttended: 1 },
    9: { status: "present", classesAttended: 6 },
    10: { status: "present", classesAttended: 5 },
    11: { status: "present", classesAttended: 4 },
    12: { status: "present", classesAttended: 3 },
    13: { status: "present", classesAttended: 2 },
    14: { status: "present", classesAttended: 6 }, // Today, full attendance
    15: { status: "present", classesAttended: 1 },
    16: { status: "absent", classesAttended: 0 }, // Absent
    17: { status: "present", classesAttended: 5 },
    18: { status: "present", classesAttended: 4 },
    19: { status: "present", classesAttended: 3 },
    20: { status: "present", classesAttended: 2 },
    21: { status: "present", classesAttended: 1 },
    22: { status: "present", classesAttended: 6 },
    23: { status: "present", classesAttended: 5 },
    24: { status: "present", classesAttended: 4 },
    25: { status: "present", classesAttended: 3 },
    26: { status: "present", classesAttended: 2 },
    27: { status: "present", classesAttended: 1 },
    28: { status: "absent", classesAttended: 0 }, // Absent
    29: { status: "present", classesAttended: 6 },
    30: { status: "present", classesAttended: 5 },
  };

  // Transform the data to match the expected format
  const customAttendanceData = Object.fromEntries(
    Object.entries(rawAttendanceData).map(([day, data]) => [
      day,
      { classesAttended: data.classesAttended },
    ])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CalendarWidget attendanceData={customAttendanceData} />
    </View>
  );
};

export default HistoryScreen;
