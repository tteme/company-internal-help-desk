import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/utils/password.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// ============================================================
// SEED DATA
// ============================================================

const departments = [
  {
    name: "Information Technology",
    code: "IT",
    description: "Handles technical and IT-related employee requests.",
  },
  {
    name: "Finance",
    code: "FIN",
    description:
      "Handles finance, accounting, payment, and financial-related employee requests.",
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "Handles employee and human-resource-related requests.",
  },
  {
    name: "Legal",
    code: "LEGAL",
    description:
      "Handles legal, compliance, contractual, and legal advisory requests.",
  },
  {
    name: "Operations",
    code: "OPS",
    description:
      "Handles branch operations, operational procedures, and general operational requests.",
  },
  {
    name: "Credit Control",
    code: "CC",
    description:
      "Handles credit control, loan monitoring, repayment, and credit-related requests.",
  },
];

const branches = [
  {
    name: "Head Office",
    code: "HO",
    address: null,
    phone: null,
    email: null,
  },
  {
    name: "Bole Wolosefer",
    code: "BW",
    address: null,
    phone: null,
    email: null,
  },
  {
    name: "Kotebe",
    code: "KOT",
    address: null,
    phone: null,
    email: null,
  },
  {
    name: "Bahir Dar",
    code: "BD",
    address: null,
    phone: null,
    email: null,
  },
  {
    name: "Gondar",
    code: "GON",
    address: null,
    phone: null,
    email: null,
  },
];

const categories = [
  {
    name: "IT Support",
    code: "IT-SUPPORT",
    description:
      "Computer, laptop, internet, network, software, hardware, printer, email, system access, technical and information technology support requests.",
    departmentCode: "IT",
  },
  {
    name: "System Access",
    code: "SYSTEM-ACCESS",
    description:
      "User account access, login problems, password reset, permission problems, application access, and access to company systems.",
    departmentCode: "IT",
  },
  {
    name: "Payroll",
    code: "PAYROLL",
    description:
      "Salary, payroll, salary payment, salary deduction, payslip, employee compensation, and payroll-related requests.",
    departmentCode: "FIN",
  },
  {
    name: "Finance and Accounting",
    code: "FINANCE-ACCOUNTING",
    description:
      "Accounting, payment, expense, financial transaction, reimbursement, budget, and finance-related requests.",
    departmentCode: "FIN",
  },
  {
    name: "Leave Management",
    code: "LEAVE",
    description:
      "Annual leave, sick leave, maternity leave, leave balance, leave approval, and employee absence requests.",
    departmentCode: "HR",
  },
  {
    name: "Employee Services",
    code: "EMPLOYEE-SERVICES",
    description:
      "Employee records, employment information, staff documents, transfers, employee information updates, and general HR services.",
    departmentCode: "HR",
  },
  {
    name: "Legal and Compliance",
    code: "LEGAL-COMPLIANCE",
    description:
      "Legal advice, contracts, agreements, compliance, regulatory matters, legal interpretation, and contractual issues.",
    departmentCode: "LEGAL",
  },
  {
    name: "Branch Operations",
    code: "BRANCH-OPERATIONS",
    description:
      "Branch operations, operational procedures, branch processes, workflow problems, and general operational issues.",
    departmentCode: "OPS",
  },
  {
    name: "Loan and Credit",
    code: "LOAN-CREDIT",
    description:
      "Loans, credit, loan processing, loan monitoring, repayment, borrower accounts, credit control, and credit-related issues.",
    departmentCode: "CC",
  },
];

const categoryKeywordConfig = {
  "IT-SUPPORT": [
    { keyword: "internet", weight: 5 },
    { keyword: "no internet", weight: 10 },
    { keyword: "internet not working", weight: 10 },
    { keyword: "internet connection", weight: 8 },
    { keyword: "laptop", weight: 5 },
    { keyword: "office laptop", weight: 8 },
    { keyword: "computer", weight: 5 },
    { keyword: "computer problem", weight: 8 },
    { keyword: "wifi", weight: 5 },
    { keyword: "wi-fi", weight: 5 },
    { keyword: "wifi not working", weight: 10 },
    { keyword: "network", weight: 5 },
    { keyword: "network problem", weight: 8 },
    { keyword: "network connection", weight: 8 },
    { keyword: "printer", weight: 5 },
    { keyword: "printer problem", weight: 8 },
    { keyword: "hardware", weight: 5 },
    { keyword: "software", weight: 5 },
    { keyword: "keyboard", weight: 4 },
    { keyword: "mouse", weight: 4 },
    { keyword: "monitor", weight: 4 },
    { keyword: "screen", weight: 4 },
  ],

  "SYSTEM-ACCESS": [
    { keyword: "login", weight: 5 },
    { keyword: "log in", weight: 5 },
    { keyword: "cannot login", weight: 10 },
    { keyword: "cannot log in", weight: 10 },
    { keyword: "can't login", weight: 10 },
    { keyword: "forgot password", weight: 10 },
    { keyword: "reset password", weight: 10 },
    { keyword: "password", weight: 5 },
    { keyword: "access denied", weight: 10 },
    { keyword: "access", weight: 4 },
    { keyword: "permission", weight: 5 },
    { keyword: "account locked", weight: 10 },
    { keyword: "locked account", weight: 10 },
  ],

  PAYROLL: [
    { keyword: "salary", weight: 5 },
    { keyword: "salary problem", weight: 10 },
    { keyword: "salary issue", weight: 10 },
    { keyword: "salary deduction", weight: 10 },
    { keyword: "salary deducted", weight: 10 },
    { keyword: "incorrect deduction", weight: 10 },
    { keyword: "wrong deduction", weight: 10 },
    { keyword: "payroll", weight: 5 },
    { keyword: "payslip", weight: 5 },
    { keyword: "payslip error", weight: 10 },
    { keyword: "deduction", weight: 5 },
    { keyword: "wage", weight: 5 },
  ],

  "FINANCE-ACCOUNTING": [
    { keyword: "finance", weight: 5 },
    { keyword: "accounting", weight: 5 },
    { keyword: "expense", weight: 5 },
    { keyword: "expense claim", weight: 10 },
    { keyword: "reimbursement", weight: 5 },
    { keyword: "expense reimbursement", weight: 10 },
    { keyword: "invoice", weight: 5 },
    { keyword: "invoice problem", weight: 10 },
    { keyword: "payment", weight: 5 },
    { keyword: "payment problem", weight: 10 },
    { keyword: "budget", weight: 5 },
  ],

  LEAVE: [
    { keyword: "leave", weight: 5 },
    { keyword: "annual leave", weight: 10 },
    { keyword: "sick leave", weight: 10 },
    { keyword: "leave request", weight: 10 },
    { keyword: "leave application", weight: 10 },
    { keyword: "leave balance", weight: 10 },
    { keyword: "vacation", weight: 5 },
    { keyword: "absence", weight: 5 },
  ],

  "EMPLOYEE-SERVICES": [
    { keyword: "employee", weight: 4 },
    { keyword: "employee information", weight: 10 },
    { keyword: "employee record", weight: 10 },
    { keyword: "staff information", weight: 10 },
    { keyword: "employment", weight: 5 },
    { keyword: "employment letter", weight: 10 },
    { keyword: "experience letter", weight: 10 },
    { keyword: "certificate", weight: 5 },
  ],

  "LEGAL-COMPLIANCE": [
    { keyword: "legal", weight: 5 },
    { keyword: "legal issue", weight: 10 },
    { keyword: "legal problem", weight: 10 },
    { keyword: "legal advice", weight: 10 },
    { keyword: "compliance", weight: 5 },
    { keyword: "compliance issue", weight: 10 },
    { keyword: "regulatory", weight: 5 },
    { keyword: "regulatory issue", weight: 10 },
    { keyword: "contract", weight: 5 },
    { keyword: "policy violation", weight: 10 },
  ],

  "BRANCH-OPERATIONS": [
    { keyword: "branch", weight: 5 },
    { keyword: "branch problem", weight: 10 },
    { keyword: "branch issue", weight: 10 },
    { keyword: "branch operation", weight: 10 },
    { keyword: "maintenance", weight: 5 },
    { keyword: "facility", weight: 5 },
    { keyword: "office operation", weight: 8 },
  ],

  "LOAN-CREDIT": [
    { keyword: "loan", weight: 5 },
    { keyword: "loan application", weight: 10 },
    { keyword: "loan approval", weight: 10 },
    { keyword: "loan repayment", weight: 10 },
    { keyword: "loan problem", weight: 10 },
    { keyword: "loan issue", weight: 10 },
    { keyword: "credit", weight: 5 },
    { keyword: "credit problem", weight: 10 },
    { keyword: "credit issue", weight: 10 },
    { keyword: "repayment", weight: 5 },
    { keyword: "disbursement", weight: 5 },
    { keyword: "collateral", weight: 5 },
  ],
};

// ============================================================
// BUSINESS HOURS CONFIGURATION
// ============================================================

const businessHours = [
  {
    day: "MONDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "TUESDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "WEDNESDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "THURSDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "FRIDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "SATURDAY",
    startTime: "08:30",
    breakStartTime: "12:30",
    breakEndTime: "13:30",
    endTime: "17:30",
    isWorking: true,
  },
  {
    day: "SUNDAY",
    startTime: "08:30",
    breakStartTime: null,
    breakEndTime: null,
    endTime: "17:30",
    isWorking: false,
  },
];
const slaPolicies = [
  // ============================================================
  // INFORMATION TECHNOLOGY
  // ============================================================
  {
    name: "IT Low Priority SLA",
    description: "SLA for low-priority IT requests.",
    departmentCode: "IT",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "IT Medium Priority SLA",
    description: "SLA for medium-priority IT requests.",
    departmentCode: "IT",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "IT High Priority SLA",
    description: "SLA for high-priority IT requests.",
    departmentCode: "IT",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "IT Critical Priority SLA",
    description: "SLA for critical IT requests.",
    departmentCode: "IT",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },

  // ============================================================
  // FINANCE
  // ============================================================
  {
    name: "Finance Low Priority SLA",
    description: "SLA for low-priority Finance requests.",
    departmentCode: "FIN",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "Finance Medium Priority SLA",
    description: "SLA for medium-priority Finance requests.",
    departmentCode: "FIN",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "Finance High Priority SLA",
    description: "SLA for high-priority Finance requests.",
    departmentCode: "FIN",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "Finance Critical Priority SLA",
    description: "SLA for critical Finance requests.",
    departmentCode: "FIN",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },

  // ============================================================
  // HUMAN RESOURCES
  // ============================================================
  {
    name: "HR Low Priority SLA",
    description: "SLA for low-priority HR requests.",
    departmentCode: "HR",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "HR Medium Priority SLA",
    description: "SLA for medium-priority HR requests.",
    departmentCode: "HR",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "HR High Priority SLA",
    description: "SLA for high-priority HR requests.",
    departmentCode: "HR",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "HR Critical Priority SLA",
    description: "SLA for critical HR requests.",
    departmentCode: "HR",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },

  // ============================================================
  // LEGAL
  // ============================================================
  {
    name: "Legal Low Priority SLA",
    description: "SLA for low-priority Legal requests.",
    departmentCode: "LEGAL",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "Legal Medium Priority SLA",
    description: "SLA for medium-priority Legal requests.",
    departmentCode: "LEGAL",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "Legal High Priority SLA",
    description: "SLA for high-priority Legal requests.",
    departmentCode: "LEGAL",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "Legal Critical Priority SLA",
    description: "SLA for critical Legal requests.",
    departmentCode: "LEGAL",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },

  // ============================================================
  // OPERATIONS
  // ============================================================
  {
    name: "Operations Low Priority SLA",
    description: "SLA for low-priority Operations requests.",
    departmentCode: "OPS",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "Operations Medium Priority SLA",
    description: "SLA for medium-priority Operations requests.",
    departmentCode: "OPS",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "Operations High Priority SLA",
    description: "SLA for high-priority Operations requests.",
    departmentCode: "OPS",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "Operations Critical Priority SLA",
    description: "SLA for critical Operations requests.",
    departmentCode: "OPS",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },

  // ============================================================
  // CREDIT CONTROL
  // ============================================================
  {
    name: "Credit Control Low Priority SLA",
    description: "SLA for low-priority Credit Control requests.",
    departmentCode: "CC",
    priority: "LOW",
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440,
    warningPercentage: 80,
  },
  {
    name: "Credit Control Medium Priority SLA",
    description: "SLA for medium-priority Credit Control requests.",
    departmentCode: "CC",
    priority: "MEDIUM",
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  },
  {
    name: "Credit Control High Priority SLA",
    description: "SLA for high-priority Credit Control requests.",
    departmentCode: "CC",
    priority: "HIGH",
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 240,
    warningPercentage: 80,
  },
  {
    name: "Credit Control Critical Priority SLA",
    description: "SLA for critical Credit Control requests.",
    departmentCode: "CC",
    priority: "CRITICAL",
    responseTimeMinutes: 30,
    resolutionTimeMinutes: 120,
    warningPercentage: 80,
  },
];

const roles = [
  {
    name: "EMPLOYEE",
    description:
      "Regular Digaf employee who creates and tracks help desk requests.",
  },
  {
    name: "DEPARTMENT_OFFICER",
    description:
      "Department officer who handles assigned requests and provides support.",
  },
  {
    name: "DEPARTMENT_HEAD",
    description: "Department head who handles escalated and complex requests.",
  },
  {
    name: "ADMIN",
    description:
      "Administrator who manages help desk configuration and operational settings.",
  },
  {
    name: "SYSTEM_ADMINISTRATOR",
    description:
      "System administrator responsible for users, roles, permissions, security, and system-wide configuration.",
  },
];

const permissions = [
  // Requests
  { name: "request.create", description: "Create a help desk request." },
  { name: "request.view", description: "View help desk requests." },
  { name: "request.update", description: "Update help desk requests." },
  { name: "request.assign", description: "Assign requests." },
  { name: "request.reassign", description: "Reassign requests." },
  { name: "request.comment", description: "Add comments to requests." },
  { name: "request.resolve", description: "Resolve requests." },
  {
    name: "request.confirm_resolution",
    description: "Confirm that a request has been successfully resolved.",
  },
  {
    name: "request.reject_resolution",
    description: "Reject a proposed resolution and reopen the request.",
  },
  { name: "request.close", description: "Close requests." },
  { name: "request.reopen", description: "Reopen requests." },
  { name: "request.rate", description: "Rate the resolution of a request." },
  { name: "request.escalate", description: "Escalate requests." },

  // Users
  { name: "user.create", description: "Create user accounts." },
  { name: "user.view", description: "View users." },
  { name: "user.update", description: "Update user information." },
  { name: "user.activate", description: "Activate user accounts." },
  { name: "user.deactivate", description: "Deactivate user accounts." },

  // Departments
  { name: "department.create", description: "Create departments." },
  { name: "department.view", description: "View departments." },
  { name: "department.update", description: "Update departments." },
  { name: "department.delete", description: "Delete departments." },

  // Branches
  { name: "branch.create", description: "Create branches." },
  { name: "branch.view", description: "View branches." },
  { name: "branch.update", description: "Update branches." },
  { name: "branch.delete", description: "Delete branches." },

  // Categories
  {
    name: "category.create",
    description: "Create request categories.",
  },
  {
    name: "category.view",
    description: "View request categories.",
  },
  {
    name: "category.update",
    description: "Update request categories.",
  },
  {
    name: "category.delete",
    description: "Delete request categories.",
  },

  // Category Keywords
  {
    name: "category.keyword.create",
    description: "Create keywords for request categories.",
  },
  {
    name: "category.keyword.view",
    description: "View keywords assigned to request categories.",
  },
  {
    name: "category.keyword.update",
    description: "Update request category keywords.",
  },
  {
    name: "category.keyword.delete",
    description: "Deactivate request category keywords.",
  },

  // SLA
  { name: "sla.create", description: "Create SLA policies." },
  { name: "sla.view", description: "View SLA policies." },
  { name: "sla.update", description: "Update SLA policies." },
  { name: "sla.delete", description: "Delete SLA policies." },
  {
    name: "business_hours.view",
    description: "View business hours configuration.",
  },
  {
    name: "business_hours.update",
    description: "Update business hours configuration.",
  },

  // Knowledge Base
  {
    name: "knowledge.create",
    description: "Create knowledge base articles.",
  },
  {
    name: "knowledge.view",
    description: "View knowledge base articles.",
  },
  {
    name: "knowledge.update",
    description: "Update knowledge base articles.",
  },
  {
    name: "knowledge.publish",
    description: "Publish knowledge base articles.",
  },
  {
    name: "knowledge.archive",
    description: "Archive knowledge base articles.",
  },

  // Reports
  { name: "report.view", description: "View reports." },
  { name: "report.export", description: "Export reports." },

  // System
  {
    name: "system.settings",
    description: "Manage system settings.",
  },
  {
    name: "role.manage",
    description: "Manage roles.",
  },
  {
    name: "permission.manage",
    description: "Manage permissions.",
  },
];

// ============================================================
// ROLE → PERMISSION CONFIGURATION
// ============================================================

const rolePermissions = {
  EMPLOYEE: [
    "request.create",
    "request.view",
    "request.comment",
    "request.confirm_resolution",
    "request.reject_resolution",
    "request.reopen",
    "request.rate",
  ],

  DEPARTMENT_OFFICER: [
    "request.view",
    "request.update",
    "request.comment",
    "request.resolve",
    "request.escalate",
    "knowledge.view",
  ],

  DEPARTMENT_HEAD: [
    "request.view",
    "request.update",
    "request.comment",
    "request.resolve",
    "request.escalate",
    "request.close",
    "request.reopen",
    "report.view",
    "knowledge.view",
  ],

  ADMIN: [
    "request.view",

    "user.create",
    "user.view",
    "user.update",
    "user.activate",
    "user.deactivate",

    "department.create",
    "department.view",
    "department.update",
    "department.delete",

    "branch.create",
    "branch.view",
    "branch.update",
    "branch.delete",

    "category.create",
    "category.view",
    "category.update",
    "category.delete",

    "category.keyword.create",
    "category.keyword.view",
    "category.keyword.update",
    "category.keyword.delete",

    "sla.create",
    "sla.view",
    "sla.update",
    "sla.delete",
    "business_hours.view",
    "business_hours.update",

    "knowledge.create",
    "knowledge.view",
    "knowledge.update",
    "knowledge.publish",
    "knowledge.archive",

    "report.view",
    "report.export",

    "system.settings",
  ],

  SYSTEM_ADMINISTRATOR: [
    "request.view",

    "user.create",
    "user.view",
    "user.update",
    "user.activate",
    "user.deactivate",

    "department.create",
    "department.view",
    "department.update",
    "department.delete",

    "branch.create",
    "branch.view",
    "branch.update",
    "branch.delete",

    "category.create",
    "category.view",
    "category.update",
    "category.delete",

    "category.keyword.create",
    "category.keyword.view",
    "category.keyword.update",
    "category.keyword.delete",

    "sla.create",
    "sla.view",
    "sla.update",
    "sla.delete",
    "business_hours.view",
    "business_hours.update",

    "knowledge.create",
    "knowledge.view",
    "knowledge.update",
    "knowledge.publish",
    "knowledge.archive",

    "report.view",
    "report.export",

    "system.settings",
    "role.manage",
    "permission.manage",
  ],
};

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("========================================");
  console.log("Starting database seed...");
  console.log("========================================");

  // ==========================================================
  // DEPARTMENTS
  // ==========================================================

  for (const department of departments) {
    await prisma.department.upsert({
      where: {
        code: department.code,
      },
      update: {
        name: department.name,
        description: department.description,
        isActive: true,
      },
      create: department,
    });
  }

  console.log("✅ Departments synchronized.");

  // ==========================================================
  // BRANCHES
  // ==========================================================

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: {
        code: branch.code,
      },
      update: {
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        isActive: true,
      },
      create: branch,
    });
  }

  console.log("✅ Branches synchronized.");

  // ==========================================================
  // ROLES
  // ==========================================================

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log("✅ Roles synchronized.");

  // ==========================================================
  // PERMISSIONS
  // ==========================================================

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log("✅ Permissions synchronized.");

  // ==========================================================
  // ROLE PERMISSIONS
  // ==========================================================

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    const permissionRecords = await prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames,
        },
      },
    });

    const foundPermissionNames = permissionRecords.map(
      (permission) => permission.name,
    );

    const missingPermissions = permissionNames.filter(
      (permissionName) => !foundPermissionNames.includes(permissionName),
    );

    if (missingPermissions.length > 0) {
      throw new Error(
        `Missing permissions for ${roleName}: ${missingPermissions.join(", ")}`,
      );
    }

    const permissionIds = permissionRecords.map((permission) => permission.id);

    // Remove old permissions that are no longer configured
    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
        permissionId: {
          notIn: permissionIds,
        },
      },
    });

    // Add missing permissions
    for (const permission of permissionRecords) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ Role permissions synchronized.");

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  for (const category of categories) {
    const department = await prisma.department.findUnique({
      where: {
        code: category.departmentCode,
      },
    });

    if (!department) {
      throw new Error(
        `Department not found for category: ${category.departmentCode}`,
      );
    }

    await prisma.category.upsert({
      where: {
        code: category.code,
      },
      update: {
        name: category.name,
        description: category.description,
        departmentId: department.id,
        isActive: true,
      },
      create: {
        name: category.name,
        code: category.code,
        description: category.description,
        departmentId: department.id,
        isActive: true,
      },
    });
  }

  console.log("✅ Categories synchronized.");
  // ==========================================================
  // CATEGORY KEYWORDS
  // ==========================================================

  for (const [categoryCode, keywords] of Object.entries(
    categoryKeywordConfig,
  )) {
    const category = await prisma.category.findUnique({
      where: {
        code: categoryCode,
      },
    });

    if (!category) {
      console.warn(`⚠️ Category ${categoryCode} not found. Skipping keywords.`);
      continue;
    }

    for (const item of keywords) {
      await prisma.categoryKeyword.upsert({
        where: {
          categoryId_keyword: {
            categoryId: category.id,
            keyword: item.keyword.toLowerCase(),
          },
        },
        update: {
          weight: item.weight,
          isActive: true,
        },
        create: {
          categoryId: category.id,
          keyword: item.keyword.toLowerCase(),
          weight: item.weight,
          isActive: true,
        },
      });
    }

    console.log(`✅ Keywords synchronized for ${category.name}.`);
  }

  // ==========================================================
  // BUSINESS HOURS
  // ==========================================================

  for (const hours of businessHours) {
    await prisma.businessHours.upsert({
      where: {
        day: hours.day,
      },
      update: {
        startTime: hours.startTime,
        breakStartTime: hours.breakStartTime,
        breakEndTime: hours.breakEndTime,
        endTime: hours.endTime,
        isWorking: hours.isWorking,
      },
      create: {
        day: hours.day,
        startTime: hours.startTime,
        breakStartTime: hours.breakStartTime,
        breakEndTime: hours.breakEndTime,
        endTime: hours.endTime,
        isWorking: hours.isWorking,
      },
    });
  }

  console.log("✅ Business hours synchronized.");

  // ==========================================================
  // SLA POLICIES
  // ==========================================================

  for (const sla of slaPolicies) {
    const department = await prisma.department.findUnique({
      where: {
        code: sla.departmentCode,
      },
    });

    if (!department) {
      throw new Error(`Department not found for SLA: ${sla.departmentCode}`);
    }

    await prisma.slaPolicy.upsert({
      where: {
        departmentId_priority: {
          departmentId: department.id,
          priority: sla.priority,
        },
      },
      update: {
        name: sla.name,
        description: sla.description,
        responseTimeMinutes: sla.responseTimeMinutes,
        resolutionTimeMinutes: sla.resolutionTimeMinutes,
        warningPercentage: sla.warningPercentage,
        isActive: true,
      },
      create: {
        name: sla.name,
        description: sla.description,
        departmentId: department.id,
        priority: sla.priority,
        responseTimeMinutes: sla.responseTimeMinutes,
        resolutionTimeMinutes: sla.resolutionTimeMinutes,
        warningPercentage: sla.warningPercentage,
        isActive: true,
      },
    });
  }

  console.log("✅ SLA policies synchronized.");
  // ==========================================================
  // SYSTEM ADMINISTRATOR
  // ==========================================================

  const systemAdminRole = await prisma.role.findUnique({
    where: {
      name: "SYSTEM_ADMINISTRATOR",
    },
  });

  if (!systemAdminRole) {
    throw new Error("SYSTEM_ADMINISTRATOR role not found.");
  }

  const systemAdminPassword = await hashPassword("ChangeMe123!");

  const systemAdmin = await prisma.user.upsert({
    where: {
      email: "admin@digaf.com",
    },
    update: {
      firstName: "System",
      lastName: "Administrator",
      role: "SYSTEM_ADMINISTRATOR",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: null,
      departmentId: null,
      passwordHash: systemAdminPassword,
    },
    create: {
      employeeId: "SYS-001",
      firstName: "System",
      lastName: "Administrator",
      email: "admin@digaf.com",
      passwordHash: systemAdminPassword,
      role: "SYSTEM_ADMINISTRATOR",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: null,
      departmentId: null,
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: systemAdmin.id,
        roleId: systemAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: systemAdmin.id,
      roleId: systemAdminRole.id,
    },
  });

  console.log("✅ System Administrator synchronized.");

  // ==========================================================
  // TEST EMPLOYEE
  // ==========================================================
  //
  // Development/testing account only.
  // Remove this section before production deployment.
  // ==========================================================

  const employeeRole = await prisma.role.findUnique({
    where: {
      name: "EMPLOYEE",
    },
  });

  if (!employeeRole) {
    throw new Error("EMPLOYEE role not found.");
  }

  const testEmployeePassword = await hashPassword("TestEmployee123!");

  const testEmployeeBranch = await prisma.branch.findUnique({
    where: {
      code: "BW",
    },
  });

  if (!testEmployeeBranch) {
    throw new Error("Test employee branch not found.");
  }

  const testEmployee = await prisma.user.upsert({
    where: {
      email: "test.employee@digaf.com",
    },

    update: {
      firstName: "Test",
      lastName: "Employee",
      role: "EMPLOYEE",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: testEmployeeBranch.id,
      departmentId: null,
      passwordHash: testEmployeePassword,
    },

    create: {
      employeeId: "TEST-EMP-001",
      firstName: "Test",
      lastName: "Employee",
      email: "test.employee@digaf.com",
      passwordHash: testEmployeePassword,
      role: "EMPLOYEE",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: testEmployeeBranch.id,
      departmentId: null,
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: testEmployee.id,
        roleId: employeeRole.id,
      },
    },

    update: {},

    create: {
      userId: testEmployee.id,
      roleId: employeeRole.id,
    },
  });

  console.log("✅ Test Employee synchronized.");

  // ==========================================================
  // TEST DEPARTMENT OFFICER
  // ==========================================================
  //
  // Development/testing account only.
  // Remove this section before production deployment.
  // ==========================================================

  const departmentOfficerRole = await prisma.role.findUnique({
    where: {
      name: "DEPARTMENT_OFFICER",
    },
  });

  if (!departmentOfficerRole) {
    throw new Error("DEPARTMENT_OFFICER role not found.");
  }

  const itDepartment = await prisma.department.findUnique({
    where: {
      code: "IT",
    },
  });

  if (!itDepartment) {
    throw new Error("IT department not found.");
  }

  const officerBranch = await prisma.branch.findUnique({
    where: {
      code: "HO",
    },
  });

  if (!officerBranch) {
    throw new Error("Head Office branch not found.");
  }

  const testOfficerPassword = await hashPassword("TestOfficer123!");

  const testOfficer = await prisma.user.upsert({
    where: {
      email: "test.officer@digaf.com",
    },

    update: {
      firstName: "Test",
      lastName: "IT Officer",
      role: "DEPARTMENT_OFFICER",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: officerBranch.id,
      departmentId: itDepartment.id,
      passwordHash: testOfficerPassword,
      availability: "AVAILABLE",
    },

    create: {
      employeeId: "TEST-OFFICER-001",
      firstName: "Test",
      lastName: "IT Officer",
      email: "test.officer@digaf.com",
      passwordHash: testOfficerPassword,
      role: "DEPARTMENT_OFFICER",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: officerBranch.id,
      departmentId: itDepartment.id,
      availability: "AVAILABLE",
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: testOfficer.id,
        roleId: departmentOfficerRole.id,
      },
    },

    update: {},

    create: {
      userId: testOfficer.id,
      roleId: departmentOfficerRole.id,
    },
  });

  console.log("✅ Test Department Officer synchronized.");

  // ==========================================================
  // TEST DEPARTMENT HEAD
  // ==========================================================
  //
  // Development/testing account only.
  // Remove this section before production deployment.
  // ==========================================================

  const departmentHeadRole = await prisma.role.findUnique({
    where: {
      name: "DEPARTMENT_HEAD",
    },
  });

  if (!departmentHeadRole) {
    throw new Error("DEPARTMENT_HEAD role not found.");
  }

  const testHeadPassword = await hashPassword("TestHead123!");

  const testHead = await prisma.user.upsert({
    where: {
      email: "test.head@digaf.com",
    },

    update: {
      firstName: "Test",
      lastName: "IT Head",
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: officerBranch.id,
      departmentId: itDepartment.id,
      passwordHash: testHeadPassword,
      availability: "AVAILABLE",
    },

    create: {
      employeeId: "TEST-HEAD-001",
      firstName: "Test",
      lastName: "IT Head",
      email: "test.head@digaf.com",
      passwordHash: testHeadPassword,
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
      branchId: officerBranch.id,
      departmentId: itDepartment.id,
      availability: "AVAILABLE",
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: testHead.id,
        roleId: departmentHeadRole.id,
      },
    },

    update: {},

    create: {
      userId: testHead.id,
      roleId: departmentHeadRole.id,
    },
  });

  console.log("✅ Test Department Head synchronized.");

  console.log("========================================");
  console.log("Database seed completed successfully.");
  console.log("========================================");
}

// ============================================================
// EXECUTE
// ============================================================

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
