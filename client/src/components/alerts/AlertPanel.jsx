import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import AlertCard from './AlertCard.jsx';

export default function AlertPanel({ alerts, title = 'Recent Alerts', limit, emptyTitle = 'No alerts' }) {
  const list = limit ? alerts.slice(0, limit) : alerts;
  return (
    <Card title={title} subtitle={`${list.length} record${list.length === 1 ? '' : 's'}`}>
      {list.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description="Live alerts will appear here as the alert engine correlates events."
          icon="∅"
        />
      ) : (
        <div className="space-y-1.5 -mx-1">
          {list.map((a) => (
            <AlertCard key={a.id} alert={a} compact />
          ))}
        </div>
      )}
    </Card>
  );
}
