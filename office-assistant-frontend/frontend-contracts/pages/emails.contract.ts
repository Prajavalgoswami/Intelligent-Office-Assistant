export const EmailsPageContract = {
  route: "/emails",
  title: "Emails",
  layout: "dashboard",

  table: {
    columns: [
      { key: "from", label: "From" },
      { key: "subject", label: "Subject" },
      { key: "category", label: "Category" },
      { key: "received_at", label: "Received" }
    ]
  },

  data: {
    mock: [
      {
        id: "e1",
        from: "hr@company.com",
        subject: "Leave Policy Update",
        category: "HR",
        received_at: "2026-01-06"
      },
      {
        id: "e2",
        from: "manager@company.com",
        subject: "Sprint Review",
        category: "MEETING",
        received_at: "2026-01-05"
      }
    ]
  },

  states: {
    loading: true,
    emptyMessage: "No emails found",
    errorMessage: "Failed to load emails"
  }
};
