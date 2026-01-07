import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCompany() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: API integration
    setTimeout(() => {
      setLoading(false);
      navigate("/super-admin");
    }, 1000);
  };

  return (
    <div className="app-page">
      {/* Header / Breadcrumb */}
      <div className="page-header">
        <div className="breadcrumb">
          Super Admin <span>/</span> Companies <span>/</span> Create
        </div>
        <h1>Create Company</h1>
        <p className="page-subtitle">
          Register a new organization and initialize system configuration.
        </p>
      </div>

      {/* Content */}
      <div className="page-container">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Domain (optional)</label>
              <input
                type="text"
                placeholder="acme.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/super-admin")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
