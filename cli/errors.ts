import { TaggedError } from "better-result";

/** Reports short-link failures without exposing authentication details. */
export class PhackError extends TaggedError("PhackError")<{ message: string }> {} // oxlint-disable-line rayhanadev/errors-file-organization -- TaggedError factory superclasses are not recognized by this rule.
