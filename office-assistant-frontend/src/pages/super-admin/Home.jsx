import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

export default function SuperAdminHome() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("super_admin_token");
    window.location.href = "/super-admin/login";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          px: 6,
          py: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Super Admin Panel
            </Typography>
            <Typography color="#cbd5f5">
              Central control for organizations
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{
              color: "#f8fafc",
              borderColor: "#475569",
              "&:hover": {
                backgroundColor: "#1e293b",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: 6,
          py: 6,
        }}
      >
        {/* OVERVIEW */}
        <Typography
          variant="h6"
          fontWeight={600}
          mb={2}
          color="#0f172a"
        >
          System Overview
        </Typography>

        <Grid container spacing={3} mb={6}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" fontSize={13}>
                  System Status
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="success.main"
                >
                  Operational
                </Typography>
                <Typography color="text.secondary" mt={1}>
                  All services are running normally
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* PRIMARY ACTIONS */}
        <Typography
          variant="h6"
          fontWeight={600}
          mb={2}
          color="#0f172a"
        >
          Administrative Actions
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              onClick={() =>
                navigate("/super-admin/companies/create")
              }
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent>
                <BusinessIcon
                  sx={{ color: "#2563eb" }}
                  fontSize="large"
                />
                <Typography variant="h6" mt={1} fontWeight={600}>
                  Create Company
                </Typography>
                <Typography color="text.secondary">
                  Register a new organization and initialize system
                  configuration
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                opacity: 0.6,
              }}
            >
              <CardContent>
                <SettingsIcon fontSize="large" />
                <Typography variant="h6" mt={1} fontWeight={600}>
                  System Configuration
                </Typography>
                <Typography color="text.secondary">
                  Global feature and system controls
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
