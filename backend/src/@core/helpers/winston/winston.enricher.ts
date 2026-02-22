import { format } from 'winston';

export const winstonEnricher = format((info) => {
  info.timestamp = new Date().toISOString();
  info.service = 'evntaly-backend';

  // Add request context if available
  if (info.req) {
    info.tenantID = info.req['account']?.tenantID;
    info.projectID = info.req['projectID'];
    delete info.req; // Remove the full request object to avoid circular references
  }

  return info;
});

export default winstonEnricher;
