import { Suspense } from 'react';
import ReportForm from './ReportForm';

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="loading-page">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    }>
      <ReportForm />
    </Suspense>
  );
}
