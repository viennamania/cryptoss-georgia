export function isValidPaymentAuditDashboardToken(accessToken?: string | null) {
  const expectedToken = process.env.PAYMENT_AUDIT_DASHBOARD_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return expectedToken === (accessToken || "");
}
