import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { superAdminLogin } from "../../api/superAdmin.api";

export default function SuperAdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await superAdminLogin(form);
      localStorage.setItem("super_admin_token", res.data.access_token);
      window.location.href = "/super-admin";
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(1200px circle at 20% 20%, #1e3a8a 0%, transparent 60%),
          radial-gradient(900px circle at 80% 80%, #0f766e 0%, transparent 55%),
          linear-gradient(135deg, #020617, #020617)
        `,
        px: { xs: 2, md: 6 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            px: 6,
            py: 7,
            borderRadius: 4,
            backdropFilter: "blur(14px)",
            backgroundColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 26px 64px rgba(0,0,0,0.45)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            textAlign="center"
            color="white"
            mb={1}
          >
            Admin Access
          </Typography>

          <Typography
            variant="body1"
            textAlign="center"
            sx={{ color: "rgba(255,255,255,0.75)" }}
            mb={6}
          >
            Sign in to continue
          </Typography>

          <form onSubmit={submit}>
            {/* EMAIL */}
            <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 0.5 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              InputProps={{
                sx: {
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 2,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.15)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                  },
              }}
            />

            {/* PASSWORD */}
            <Typography
              sx={{
                color: "rgba(255,255,255,0.85)",
                mt: 4,
                mb: 0.5,
              }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              InputProps={{
                sx: {
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 2,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.15)",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#3b82f6",
                    borderWidth: 1,
                  },
              }}
            />

            {error && (
              <Typography color="error" mt={3}>
                {error}
              </Typography>
            )}

            {/* CTA */}
            <Button
              fullWidth
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 6,
                height: 56,
                fontWeight: 700,
                fontSize: "1rem",
                color: "#ffffff",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 12px 28px rgba(37, 99, 235, 0.45)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 16px 36px rgba(37, 99, 235, 0.55)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: "#ffffff" }} />
              ) : (
                "SIGN IN"
              )}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
