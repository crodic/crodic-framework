import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock server-only in Vitest jsdom test environment
vi.mock("server-only", () => ({}));
