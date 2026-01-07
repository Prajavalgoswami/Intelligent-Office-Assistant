export const MeetingsPageContract = {
  route: "/meetings",
  title: "Meetings",
  layout: "dashboard",

  cards: {
    titleKey: "title",
    dateKey: "date",
    timeKey: "time"
  },

  data: {
    mock: [
      {
        id: "m1",
        title: "Sprint Planning",
        date: "2026-01-08",
        time: "10:00 AM",
        meeting_type: "ONLINE"
      }
    ]
  },

  states: {
    emptyMessage: "No meetings scheduled"
  }
};
