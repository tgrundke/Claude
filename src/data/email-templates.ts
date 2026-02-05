import type { EmailTemplate } from "@/types/email";
import { generateId } from "@/lib/id";

export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: generateId(),
    name: "Client Welcome Email",
    type: "client_welcome",
    subject: "Welcome to Our Managed IT Services - {{companyName}}",
    body: `Dear {{contactFirstName}},

Welcome to our managed IT services family! We are thrilled to have {{companyName}} on board and look forward to a great partnership.

Here's what to expect in the coming weeks:

1. DISCOVERY PHASE: Our team will be reviewing your current environment documentation and may reach out with additional questions.

2. DEPLOYMENT PLANNING: We will create a deployment schedule for our core tools and share it with your team for approval.

3. TOOL DEPLOYMENT: We will begin deploying the following tools to your environment:
   - NinjaOne RMM (Remote Monitoring & Management)
   - Auvik (Network Monitoring)
   - Sophos MDR (Managed Detection & Response)
   - Axcient (Backup & Disaster Recovery)

4. VERIFICATION: We will verify all systems are reporting correctly and fine-tune our monitoring.

Your primary point of contact during onboarding will be provided shortly. In the meantime, if you have any questions, don't hesitate to reach out.

We're targeting {{contractStartDate}} as our official start date.

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "contactFirstName", "contactLastName", "contractStartDate"],
    isDefault: true,
  },
  {
    id: generateId(),
    name: "Outgoing Provider Notification",
    type: "outgoing_provider_notification",
    subject: "IT Services Transition Notice - {{companyName}}",
    body: `Dear {{currentProviderContact}},

This email is to formally notify you that {{companyName}} will be transitioning their managed IT services to our organization.

KEY DATES:
- Transition Start: {{contractStartDate}}
- Current Contract End: {{contractEndDate}}

We kindly request the following to ensure a smooth transition:

1. Please provide any remaining documentation for {{companyName}}'s environment including:
   - Network diagrams
   - Admin credentials and access details
   - Active directory documentation
   - Backup configurations
   - Any open tickets or known issues

2. Please do NOT make any major changes to the environment during the transition period without coordinating with us first.

3. We will be deploying our management tools during this period. Please do not remove or block these installations.

DEPLOYMENT SCHEDULE:
{{deploymentSchedule}}

We appreciate your cooperation in making this transition as smooth as possible for the client. Please direct any questions to our team.

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "currentProviderContact", "currentProviderEmail", "contractStartDate", "contractEndDate", "deploymentSchedule"],
    isDefault: true,
  },
  {
    id: generateId(),
    name: "Deployment Schedule Email",
    type: "deployment_schedule",
    subject: "Deployment Timeline - {{companyName}} IT Transition",
    body: `Dear {{contactFirstName}},

We have finalized the deployment schedule for {{companyName}}'s IT transition. Please review the timeline below:

DEPLOYMENT SCHEDULE:
{{deploymentSchedule}}

IMPORTANT NOTES:
- Some deployments may require brief interruptions. We will notify you in advance of any expected downtime.
- Please ensure that all workstations and servers are powered on and connected to the network during scheduled deployment windows.
- If any dates need to be adjusted, please let us know at least 48 hours in advance.

If you have any questions or concerns about the schedule, please don't hesitate to reach out.

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "contactFirstName", "deploymentSchedule"],
    isDefault: true,
  },
  {
    id: generateId(),
    name: "Tool Access Credentials",
    type: "tool_access_credentials",
    subject: "Your IT Management Portal Access - {{companyName}}",
    body: `Dear {{contactFirstName}},

Your IT management tools have been provisioned and are ready for use. Below you'll find your access information:

PORTAL ACCESS:
Please use the following link to access your IT management portal. Login credentials will be sent in a separate secure email.

TOOLS NOW ACTIVE:
- NinjaOne RMM: Remote monitoring and management
- Auvik: Network monitoring and mapping
- Sophos MDR: Endpoint protection and threat detection
- Axcient: Backup and disaster recovery

WHAT THIS MEANS FOR YOU:
- 24/7 monitoring of your servers, workstations, and network devices
- Automated patch management
- Real-time security threat detection
- Automated backups with verified restores

If you have any questions about accessing these tools or need assistance, please contact our support team.

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "contactFirstName"],
    isDefault: true,
  },
  {
    id: generateId(),
    name: "Weekly Status Update",
    type: "weekly_status_update",
    subject: "Onboarding Status Update - {{companyName}} - Week of {{weekDate}}",
    body: `Dear {{contactFirstName}},

Here is your weekly onboarding status update for {{companyName}}:

COMPLETED THIS WEEK:
{{completedItems}}

IN PROGRESS:
{{inProgressItems}}

UPCOMING NEXT WEEK:
{{upcomingItems}}

BLOCKERS / ITEMS NEEDING ATTENTION:
{{blockers}}

If you have any questions or need to discuss any of these items, please let us know.

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "contactFirstName", "weekDate", "completedItems", "inProgressItems", "upcomingItems", "blockers"],
    isDefault: true,
  },
  {
    id: generateId(),
    name: "Onboarding Complete",
    type: "onboarding_complete",
    subject: "Onboarding Complete - Welcome Aboard, {{companyName}}!",
    body: `Dear {{contactFirstName}},

Great news! The onboarding process for {{companyName}} is now complete. All of our management tools have been deployed and verified, and your environment is fully under our care.

WHAT'S NOW IN PLACE:
- 24/7 Remote Monitoring & Management (NinjaOne)
- Network Monitoring & Mapping (Auvik)
- Advanced Endpoint Protection (Sophos MDR)
- Backup & Disaster Recovery (Axcient)

HOW TO REACH US:
- Support Email: support@yourmsp.com
- Support Phone: (555) 123-4567
- Emergency After-Hours: (555) 123-4568
- Support Portal: https://support.yourmsp.com

SUPPORT HOURS:
- Standard Support: Monday-Friday, 8 AM - 6 PM
- Emergency Support: 24/7/365

We're committed to keeping {{companyName}}'s IT running smoothly. Welcome aboard!

Best regards,
IT Onboarding Team`,
    availableVariables: ["companyName", "contactFirstName"],
    isDefault: true,
  },
];
