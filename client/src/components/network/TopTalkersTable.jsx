import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import { formatBytes } from '../../utils/formatters.js';

export default function TopTalkersTable({ talkers = [] }) {
  return (
    <Card title="Top Talkers" subtitle={`${talkers.length} hosts`}>
      <Table
        dense
        columns={[
          { key: 'ip',     label: 'Host' },
          { key: 'flows',  label: 'Flows',  align: 'right' },
          { key: 'bytes',  label: 'Bytes',  align: 'right', render: (r) => formatBytes(r.bytes) },
          { key: 'asn',    label: 'ASN',    dim: true },
        ]}
        rows={talkers}
        empty="No traffic recorded yet"
      />
    </Card>
  );
}
