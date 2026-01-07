export default function SuperAdminGuard({ children }) {
  const token = localStorage.getItem("super_admin_token");

  if (!token) {
    return <p>Unauthorized</p>;
  }

  return children;
}
