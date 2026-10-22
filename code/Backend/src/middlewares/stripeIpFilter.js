import ipaddr from "ipaddr.js";

/**
 * Middleware to filter webhook requests to only accept Stripe's known IPs.
 * Prevents attackers from spoofing fake webhook events.
 *
 * Stripe publishes their current webhook IP addresses at:
 *   https://stripe.com/docs/verification/ips
 *
 * This list is updated periodically — review and update when Stripe announces changes.
 */
const STRIPE_WEBHOOK_IPS = [
  "13.59.248.219",
  "23.235.127.100",
  "3.80.132.167",
  "35.192.0.0/12",
  "52.24.0.0/14",
  "52.63.0.0/16",
  "52.88.0.0/15",
  "52.250.0.0/16",
  "54.187.0.0/16",
  "54.192.0.0/16",
  "64.18.0.0/15",
  "64.184.0.0/15",
  "72.21.196.0/22",
  "72.21.212.0/22",
  "99.77.112.0/22",
  "185.187.68.0/22",
  "192.34.64.0/22",
  "192.43.18.0/23",
  "192.44.168.0/22",
  "198.41.128.0/17",
  "204.232.175.0/22",
  "205.234.175.0/22",
  "216.71.10.0/23",
];

/**
 * Check if an IP address matches a CIDR range or is an exact match.
 */
const ipMatchesRange = (ipStr, range) => {
  try {
    const ip = ipaddr.parse(ipStr);
    if (range.includes("/")) {
      const [addr, prefixLenStr] = range.split("/");
      if (ip.kind() !== ipaddr.parse(addr).kind()) return false; // IPv4 vs IPv6 mismatch
      return ip.match(ipaddr.parse(addr), Number(prefixLenStr));
    }
    return ip.toString() === range;
  } catch {
    return false;
  }
};

export const stripeIpFilter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "";
  const isAllowed = STRIPE_WEBHOOK_IPS.some((range) => ipMatchesRange(ip, range));

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "Forbidden — only Stripe servers can access this endpoint.",
      code: "STRIPE_WEBHOOK_IP_RESTRICTED",
    });
  }

  next();
};

export default stripeIpFilter;
