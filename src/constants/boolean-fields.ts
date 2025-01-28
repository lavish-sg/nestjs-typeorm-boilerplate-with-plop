export const USER_BOOLEAN_OPTIONS = {
  NAME: `"user"."name"`,
  ROLE: `"user"."job_role"`,
  PERMISSIONS: `"role"."name"`,
  STATUS: `"user"."is_active"`,
  DEPARTMENT: `"user"."department"`,
  TEAM: `"user"."team"`,
  EMAIL: `"user"."email"`,
  // config for boolean search below
  NO_CASE_VALS: ['STATUS'],
};

export const RATE_CARD_BOOLEAN_OPTIONS = {
  NAME: `"rateCard"."name"`,
  CURRENCY: `"rateCard"."currency"`,
  DISCOUNT: `"rateCard"."discount"`,
  STATUS: `"rateCard"."is_active"`,
  CLIENT_NAME: `"client"."name"`,
  TEAM_NAME: `"team"."name"`,
  IS_DEFAULT: `"teamRateCardCross"."is_default"`,
  ALL_CLIENTS: `"rateCard"."is_global"`,
  ALL_TEAMS: `"rateCard"."is_global"`,
  // config for boolean search below
  NO_CASE_VALS: ['STATUS', 'DISCOUNT', 'IS_DEFAULT', 'ALL_CLIENTS', 'ALL_TEAMS'],
};

export const JOB_CODE_BOOLEAN_OPTIONS = {
  JOB_CODE: `"job_code"."job_code"`,
  JOB_NAME: `"job_code"."job_name"`,
  CLIENT_NAME: `"client"."name"`,
  TEAM_NAME: `"team"."name"`,
  RESOURCE_STATUS: `"job_code"."resource_status"`,
  PROJECT_MANAGER: `"projectManager"."name"`,
  BUDGET_OWNER: `"budgetOwner"."name"`,
  POD_NAME: `"job_code"."pod_name"`,
  BILLING_STATUS: `"jc_budget_summary"."billing_status"`,
  ESTIMATED_BILLING: `"jc_budget_summary"."estimated_billing"`,
  LAST_INVOICE_DATE: `"jc_budget_summary"."last_invoice_date"`,
  JOB_CODE_AMOUNT: `"jc_budget_summary"."job_code_amount"`,
  INVOICED_TO_DATE: `"jc_budget_summary"."invoiced_to_date"`,
  AMOUNT_LEFT_TO_INVOICE: `"jc_budget_summary"."amount_left_to_invoice"`,
  // config for boolean search below
  NO_CASE_VALS: [
    'RESOURCE_STATUS',
    'BILLING_STATUS',
    'ESTIMATED_BILLING',
    'LAST_INVOICE_DATE',
    'JOB_CODE_AMOUNT',
    'INVOICED_TO_DATE',
    'AMOUNT_LEFT_TO_INVOICE',
  ],
};

export const LOGGED_TIME_BOOLEAN_OPTIONS = {
  TASK: `"entry"."task"`,
  NAME: `"user"."name"`,
  ROLE: `"jobRoles"."name"`,
  // config for boolean search below
  NO_CASE_VALS: [],
};
