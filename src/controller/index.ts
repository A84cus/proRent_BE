// Main Controllers Export - Clean Code Organization
// Import all controllers from their respective folders

// Base Controller (foundation for all controllers)
export { default as BaseController } from "./BaseController";

// Authentication Controllers
export * from "./auth";

// Property Controllers
export * from "./property";

// User Controllers
export * from "./user";

// Upload Controllers
export * from "./upload";

// System Controllers
export * from "./system";

// Reservation Controllers (existing folder structure)
export * from "./reservationController";
