import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/apiClient";
import {
  ShoppingBag,
  Award,
  ShieldCheck,
  Coins,
  Calendar,
  FileText,
  HeartHandshake,
  Sparkles,
  Gift,
} from "lucide-react";
import "./CustomerFootprint.css";

// Helper to extract the product title from schema's titleSnapshot
function resolveItemName(item) {
  return item?.titleSnapshot || "Item";
}

export default function CustomerFootprint({ userId }) {
  const [orders, setOrders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const [ordersRes, donationsRes] = await Promise.allSettled([
        apiClient.get("/api/v1/marketplace/orders"),
        apiClient.get("/api/v1/donations/my"),
      ]);

      if (cancelled) return;

      const orderList =
        ordersRes.status === "fulfilled"
          ? ordersRes.value.data?.data?.orders || []
          : [];

      const donationList =
        donationsRes.status === "fulfilled"
          ? donationsRes.value.data?.data?.donations || []
          : [];

      setOrders(orderList);
      setDonations(donationList);
      setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="footprint-loading">
        <div className="footprint-spinner"></div>
        <p>Loading your purchases and donations...</p>
      </div>
    );
  }

  const totalCoinsEarned = orders.reduce(
    (acc, o) => acc + Number(o.coinsEarned || 0),
    0,
  );

  return (
    <div className="customer-footprint-container" style={{ padding: "0 20px 40px" }}>
      {/* Hero intro */}
      <div className="footprint-hero">
        <Sparkles size={18} />
        <p>Your purchase history, and the impact your coins have funded.</p>
      </div>

      {/* Metric Highlights — real numbers only */}
      <div className="footprint-summary-grid">
        <div className="summary-card">
          <div className="card-icon-wrapper blue">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3>{orders.length}</h3>
            <p>Completed Purchases</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper gold">
            <Coins size={24} />
          </div>
          <div>
            <h3>{totalCoinsEarned.toLocaleString()}</h3>
            <p>Coins Earned</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper green">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h3>{donations.length}</h3>
            <p>Donations Made</p>
          </div>
        </div>
      </div>

      {/* Orders Timeline — only real fields from the Order schema */}
      <div className="orders-timeline-section" style={{ marginTop: "24px" }}>
        <h2 className="section-title">Your Purchases</h2>

        {orders.length === 0 ? (
          <div className="footprint-empty">
            <FileText size={48} className="empty-icon" />
            <p>No purchases recorded for this customer profile yet.</p>
          </div>
        ) : (
          <div className="orders-timeline">
            {orders.map((order, idx) => {
              const orderId = order._id || `ORD-${idx + 1}`;
              const orderDate = new Date(
                order.createdAt || Date.now(),
              ).toLocaleDateString();
              const itemsList = order.items || [];
              const totalAmount = Number(order.totalAmount || 0);

              return (
                <div key={orderId} className="timeline-row">
                  <div className="timeline-rail">
                    <div className="timeline-dot theme-community">
                      <ShoppingBag size={16} />
                    </div>
                    {idx < orders.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="order-footprint-card">
                    <div className="order-card-header">
                      <div className="order-card-header-main">
                        <span className="order-id">
                          Order #{String(orderId).slice(-8)}
                        </span>
                        <span className="order-date">
                          <Calendar size={14} /> {orderDate}
                        </span>
                      </div>
                      <span className="order-status-badge">
                        <ShieldCheck size={14} />{" "}
                        {order.status ? order.status.toUpperCase() : "PENDING"}
                      </span>
                    </div>

                    <div className="order-items-detail">
                      <h4>Purchased Items:</h4>
                      <ul>
                        {itemsList.length > 0 ? (
                          itemsList.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <span className="item-name">
                                {resolveItemName(item)}
                              </span>
                              <span className="item-qty">
                                x{item.quantity || 1}
                              </span>
                              <span className="item-price">
                                {order.currency || "LKR"}{" "}
                                {(
                                  Number(item.unitPrice || 0) *
                                  Number(item.quantity || 1)
                                ).toLocaleString()}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span className="item-name">No item details</span>
                          </li>
                        )}
                      </ul>
                      <div className="order-total-row">
                        <span>Total Paid:</span>
                        <strong>
                          {order.currency || "LKR"}{" "}
                          {totalAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                      {Number(order.coinsEarned || 0) > 0 && (
                        <div className="order-total-row">
                          <span>Coins Earned:</span>
                          <strong>{order.coinsEarned}</strong>
                        </div>
                      )}
                    </div>

                    <Link to="/donate" className="footprint-donate-cta">
                      <Gift size={14} /> Donate your coins
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Donations — the actual "Certificate of Impact" content, backed by real Donation records */}
      <div className="orders-timeline-section" style={{ marginTop: "24px" }}>
        <h2 className="section-title">Your Donations</h2>

        {donations.length === 0 ? (
          <div className="footprint-empty">
            <HeartHandshake size={48} className="empty-icon" />
            <p>No donations recorded yet. Donate your coins to a cause to see it here.</p>
          </div>
        ) : (
          <div className="orders-timeline">
            {donations.map((donation, idx) => {
              const donationDate = new Date(
                donation.createdAt || Date.now(),
              ).toLocaleDateString();

              return (
                <div key={donation._id || idx} className="timeline-row">
                  <div className="timeline-rail">
                    <div className="timeline-dot theme-forest">
                      <HeartHandshake size={16} />
                    </div>
                    {idx < donations.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="order-footprint-card">
                    <div className="order-card-header">
                      <div className="order-card-header-main">
                        <span className="order-date">
                          <Calendar size={14} /> {donationDate}
                        </span>
                      </div>
                      <span className="order-status-badge">
                        <ShieldCheck size={14} /> {(donation.status || "completed").toUpperCase()}
                      </span>
                    </div>

                    <div className={`impact-certificate ${donation.status === "completed" ? "is-verified" : "is-pending"}`}>
                      <div className="certificate-seal">
                        <Award size={22} />
                        <span>{donation.status === "completed" ? "Verified" : "Processing"}</span>
                      </div>

                      <div className="certificate-body">
                        <div className="certificate-title">
                          <Award size={16} />
                          <span>Certificate of Impact</span>
                        </div>

                        <p className="certificate-statement">
                          You donated to <strong>{donation.project}</strong>
                          {donation.charity ? (
                            <>
                              {" "}
                              via <strong>{donation.charity}</strong>
                            </>
                          ) : null}
                          .
                        </p>

                        <p>
                          <strong>Coins Donated:</strong> {donation.coinAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}