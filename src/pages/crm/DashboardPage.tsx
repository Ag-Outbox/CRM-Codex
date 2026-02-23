import { Cell, Funnel, FunnelChart, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { CrmLayout } from '../../components/crm/Layout';
import { useCrmStore } from '../../state/crm-store';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const BRAZIL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

export function DashboardPage() {
  const { leads, activities, integrationStats } = useCrmStore();

  const kpis = [
    { label: 'Leads', value: leads.length },
    { label: 'WhatsApp', value: integrationStats.whatsappLeads },
    { label: 'Facebook Ads', value: integrationStats.facebookLeads },
    { label: 'FB → Whats', value: integrationStats.facebookToWhatsappLeads },
    { label: 'IA Processados', value: integrationStats.aiProcessed },
    { label: 'Proposta', value: leads.filter((l) => l.stage === 'PROPOSTA').length },
    { label: 'Negociando', value: leads.filter((l) => l.stage === 'NEGOCIACAO').length },
    { label: 'Clientes', value: leads.filter((l) => l.stage === 'CLIENTE').length },
  ];

  const sourceData = Object.entries(leads.reduce<Record<string, number>>((acc, lead) => ({ ...acc, [lead.source]: (acc[lead.source] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  const momentData = [
    { name: 'Quente', value: leads.filter((l) => l.probability >= 70).length },
    { name: 'Morno', value: leads.filter((l) => l.probability >= 40 && l.probability < 70).length },
    { name: 'Frio', value: leads.filter((l) => l.probability < 40).length },
  ];
  const funnelData = [
    { name: 'Contato', value: leads.filter((l) => ['CONTATO', 'QUALIFICADO'].includes(l.stage)).length, fill: '#d94657' },
    { name: 'Negociação', value: leads.filter((l) => ['PROPOSTA', 'ANALISANDO', 'NEGOCIACAO'].includes(l.stage)).length, fill: '#f59e0b' },
    { name: 'Fechados', value: leads.filter((l) => ['CLIENTE', 'CLOSED'].includes(l.stage)).length, fill: '#22c55e' },
  ];

  return (
    <CrmLayout>
      <div className="grid grid-cols-4 gap-2">
        {kpis.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] uppercase text-slate-500">{item.label}</p>
            <p className="text-4xl font-bold leading-none">{item.value}</p>
            <p className="text-xs text-slate-400">contagem</p>
          </article>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-12 gap-3">
        <section className="col-span-4 rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Atividade Recente</h3>
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-slate-100 p-2">
                <p className="text-sm font-semibold">{activity.actorName}</p>
                <p className="text-xs text-slate-600">{activity.message}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-4 rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Canal de Vendas</h3>
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sourceData} dataKey="value" innerRadius={55} outerRadius={85} label>
                  {sourceData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="col-span-4 row-span-2 rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Mapa do Brasil</h3>
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 600, center: [-52, -15] }}>
            <Geographies geography={BRAZIL}>{({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} fill="#edf2f7" stroke="#fff" />)}</Geographies>
            {leads.filter((lead) => lead.state).map((lead, index) => <Marker key={lead.id} coordinates={[-60 + index * 3, -20 + index]}><circle r={4} fill="#3b82f6" /></Marker>)}
          </ComposableMap>
          <p className="text-xs text-slate-400">Total: {leads.length} • {new Set(leads.map((l) => l.state)).size} estados</p>
          <div className="mt-3 space-y-2">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between text-sm">
                <span>{lead.name}</span>
                <span className="font-semibold">R$ {lead.valueBrl.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-4 rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Funil</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <FunnelChart>
                <Funnel data={funnelData} dataKey="value" isAnimationActive />
                <Tooltip />
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="col-span-4 rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold">Momento do lead</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={momentData} dataKey="value" innerRadius={55} outerRadius={85} label>
                  {momentData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </CrmLayout>
  );
}
