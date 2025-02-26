// src/app/admin/cron-jobs/page.tsx
import CronJobsPage from '@/components/admin/cron-jobs/page';

export const metadata = {
  title: 'Administración de Cron Jobs | Panel de Control',
  description: 'Gestione y ejecute manualmente tareas programadas del sistema',
};

export default function CronJobsRoute() {
  return <CronJobsPage />;
}