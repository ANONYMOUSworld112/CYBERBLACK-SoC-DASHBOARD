import NetworkMap from '../components/network/NetworkMap.jsx';
import TopTalkersTable from '../components/network/TopTalkersTable.jsx';
import PacketFeed from '../components/network/PacketFeed.jsx';
import BandwidthChart from '../components/network/BandwidthChart.jsx';
import ProtocolDonut from '../components/network/ProtocolDonut.jsx';
import { useNetwork } from '../hooks/useNetwork.js';

export default function NetworkPage() {
  const { packets, topTalkers, protocols, bandwidthHistory, capture } = useNetwork();
  return (
    <div className="p-4 space-y-3">
      <NetworkMap threats={[]} />

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-7">
          <BandwidthChart data={bandwidthHistory} title="Throughput" />
        </div>
        <div className="col-span-12 md:col-span-5">
          <ProtocolDonut data={protocols} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-7">
          <TopTalkersTable talkers={topTalkers} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <PacketFeed packets={packets} title={`Live Packets · ${capture.source}`} />
        </div>
      </div>
    </div>
  );
}
