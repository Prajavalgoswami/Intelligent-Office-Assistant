export const AdminUsersPageContract = {
  route: "/admin/users",
  title: "Users",
  layout: "dashboard",

  table: {
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" }
    ]
  },

  data: {
    mock: [
      {
        id: "u1",
        name: "Amit Sharma",
        email: "amit@company.com",
        role: "EMPLOYEE",
        status: "ACTIVE"
      }
    ]
  }
};
