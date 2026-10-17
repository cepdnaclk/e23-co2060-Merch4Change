import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../../../components/AppLayout/AppLayout";
import { adminApprove, adminGetCharity, adminReject } from "../../../services/charityApi";
import "./CharityVerification.css";

export default function CharityReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charity, setCharity] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    adminGetCharity(id)
      .then((response) => setCharity(response?.data?.charity))
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load charity application.",
        );
      });
  }, [id]);

  const approve = async () => {
    setActing(true);
    setError("");
    try {
      const response = await adminApprove(id);

      if (!response?.success) {
        setError(response?.message || "Failed to approve charity.");
        return;
      }

      navigate("/admin/charities");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve charity.",
      );
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 5) {
      setError("Rejection reason must be at least 5 characters.");
      return;
    }

    setActing(true);
    setError("");
    try {
      const response = await adminReject(id, reason);

      if (!response?.success) {
        setError(response?.message || "Failed to reject charity.");
        return;
      }

      navigate("/admin/charities");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject charity.",
      );
    } finally {
      setActing(false);
    }
  };

  if (!charity) {
    return (
      <AppLayout>
        <div className="charity-admin-page">Loading application...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="charity-admin-page">
        <button type="button" className="charity-back-btn" onClick={() => navigate("/admin/charities")}>
          Back to queue
        </button>

        <div className="charity-review-card">
          <h1>{charity.publicName}</h1>
          <p className="charity-queue-meta">Status: {charity.verificationStatus}</p>

          <div className="charity-review-grid">
            <p><strong>Legal name:</strong> {charity.legalName || "—"}</p>
            <p><strong>Registration #:</strong> {charity.registrationNumber || "—"}</p>
            <p><strong>Category:</strong> {charity.category}</p>
            <p><strong>Country:</strong> {charity.country || "—"}</p>
            <p><strong>Owner:</strong> {charity.ownerUserId?.email}</p>
            <p><strong>Website:</strong> {charity.website || "—"}</p>
          </div>

          {charity.description && <p>{charity.description}</p>}

          <h3>Proof documents</h3>
          {charity.proofDocuments?.length ? (
            <ul className="charity-review-docs">
              {charity.proofDocuments.map((doc, index) => {
                const rawUrl = String(doc?.url || "").trim();
                const isSafeUrl =
                  rawUrl.startsWith("https://") ||
                  rawUrl.startsWith("http://") ||
                  rawUrl.startsWith("/uploads/");
                return (
                  <li key={`${doc.label}-${index}`}>
                    {isSafeUrl ? (
                      <a href={rawUrl} target="_blank" rel="noreferrer noopener">{doc.label}</a>
                    ) : (
                      <span>{doc.label} (invalid URL)</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="charity-empty-state">No documents submitted.</p>
          )}

          {charity.verificationStatus !== "verified" && (
            <div className="charity-review-actions">
              <button
                type="button"
                className="charity-approve-btn"
                onClick={approve}
                disabled={acting}
              >
                Approve
              </button>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Rejection reason (required to reject)"
              />
              <button
                type="button"
                className="charity-reject-btn"
                onClick={reject}
                disabled={acting}
              >
                Reject
              </button>
            </div>
          )}

          {error && <p className="charity-form-message error">{error}</p>}
        </div>
      </div>
    </AppLayout>
  );
}
