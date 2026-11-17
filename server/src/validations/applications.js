import { z } from "zod";
import { STATUSES } from "../models/Application.js";

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(100),
  role: z.string().trim().min(1, "Role is required").max(100),
  status: z
    .enum(STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${STATUSES.join(", ")}`,
      }),
    })
    .default("Applied"),
  appliedDate: z.coerce.date({
    errorMap: () => ({ message: "Enter a valid date" }),
  }),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional()
    .default(""),
});
