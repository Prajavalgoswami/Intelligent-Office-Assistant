export const TasksPageContract = {
  route: "/tasks",
  title: "My Tasks",
  layout: "dashboard",

  list: {
    primaryKey: "title",
    secondaryKey: "due_date",
    statusKey: "status"
  },

  data: {
    mock: [
      {
        id: "t1",
        title: "Submit project report",
        status: "PENDING",
        due_date: "2026-01-10"
      },
      {
        id: "t2",
        title: "Code review",
        status: "COMPLETED",
        due_date: "2026-01-04"
      }
    ]
  },

  states: {
    emptyMessage: "No tasks assigned"
  }
};
