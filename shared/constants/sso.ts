// Product-SSO constants shared between the secret-management API (cap
// enforcement) and the dashboard UI (create-button gating).

// Logical cap on signing secrets per org. Multiple secrets exist only to make
// rotation a CRUD operation (create new → switch product → disable old →
// delete); 5 is plenty of headroom for that without becoming a sprawl.
export const SSO_SECRET_LIMIT = 5
