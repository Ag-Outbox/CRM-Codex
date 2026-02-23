import { FormEvent, useState } from 'react';
import { CrmLayout } from '../components/crm/Layout';
import { IncomingLeadPayload } from '../lib/types';
import { useCrmStore } from '../state/crm-store';

export function SettingsPage() {
  const { integrationConfig, updateIntegrationConfig, ingestExternalLead, integrationStats } = useCrmStore();
  const [payload, setPayload] = useState<IncomingLeadPayload>({
    name: 'Lead WhatsApp',
    sourceHint: 'FACEBOOK_TO_WHATSAPP',
    campaign: 'Meta C2W - Março',
    message: 'Quero saber preço e como contratar',
    phone: '+5511999999999',
    estimatedValue: 28000,
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await ingestExternalLead(payload);
  };

  return (
    <CrmLayout>
      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-3 text-lg font-semibold">Integrações e IA</h2>
          <div className="space-y-3">
            <ToggleRow
              label="Automação WhatsApp"
              enabled={integrationConfig.whatsappAutomationEnabled}
              onChange={(enabled) => updateIntegrationConfig({ whatsappAutomationEnabled: enabled })}
            />
            <ToggleRow
              label="Ingestão Facebook Ads"
              enabled={integrationConfig.facebookAdsIngestionEnabled}
              onChange={(enabled) => updateIntegrationConfig({ facebookAdsIngestionEnabled: enabled })}
            />
            <ToggleRow
              label="IA para classificação e score"
              enabled={integrationConfig.aiLeadScoringEnabled}
              onChange={(enabled) => updateIntegrationConfig({ aiLeadScoringEnabled: enabled })}
            />
            <ToggleRow
              label="Auto-assign para Vendas/Atendimento"
              enabled={integrationConfig.autoAssignEnabled}
              onChange={(enabled) => updateIntegrationConfig({ autoAssignEnabled: enabled })}
            />
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>WhatsApp: {integrationStats.whatsappLeads}</p>
            <p>Facebook Ads: {integrationStats.facebookLeads}</p>
            <p>Facebook → WhatsApp: {integrationStats.facebookToWhatsappLeads}</p>
            <p>Leads processados por IA: {integrationStats.aiProcessed}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-3 text-lg font-semibold">Simular Webhook (WhatsApp/Facebook Ads)</h2>
          <form className="space-y-2" onSubmit={submit}>
            <input className="w-full rounded border p-2" value={payload.name} onChange={(e) => setPayload((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nome do lead" />
            <input className="w-full rounded border p-2" value={payload.phone ?? ''} onChange={(e) => setPayload((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Telefone" />
            <input className="w-full rounded border p-2" value={payload.campaign ?? ''} onChange={(e) => setPayload((prev) => ({ ...prev, campaign: e.target.value }))} placeholder="Campanha Meta Ads" />
            <select className="w-full rounded border p-2" value={payload.sourceHint} onChange={(e) => setPayload((prev) => ({ ...prev, sourceHint: e.target.value as IncomingLeadPayload['sourceHint'] }))}>
              <option value="WHATSAPP">WhatsApp direto</option>
              <option value="FACEBOOK_ADS">Facebook Ads (CAPI/Lead form)</option>
              <option value="FACEBOOK_TO_WHATSAPP">Facebook click-to-WhatsApp</option>
            </select>
            <textarea className="w-full rounded border p-2" rows={3} value={payload.message ?? ''} onChange={(e) => setPayload((prev) => ({ ...prev, message: e.target.value }))} placeholder="Mensagem recebida" />
            <button className="rounded bg-teal-600 px-3 py-2 text-white">Processar lead na IA e enviar ao CRM</button>
          </form>
        </section>
      </div>
    </CrmLayout>
  );
}

type ToggleProps = {
  label: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
};

function ToggleRow({ label, enabled, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!enabled)} className={`rounded-full px-3 py-1 text-xs ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
        {enabled ? 'Ativo' : 'Inativo'}
      </button>
    </label>
  );
}
