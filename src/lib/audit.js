import { base44 } from '@/api/base44Client';

export async function logAudit({ user, action, entityId, requestNumber, details }) {
  try {
    await base44.entities.AuditLog.create({
      user_name: user?.full_name || 'Sistema',
      action,
      entity_id: entityId || '',
      request_number: requestNumber || '',
      details: details || '',
    });
  } catch (e) {
    // auditoria é best-effort; não bloqueia o fluxo
  }
}