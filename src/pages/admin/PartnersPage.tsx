import { useState, useEffect } from 'react';
import { Send, Building2, Shield, Users, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ConfirmModal } from '../../components/ConfirmModal';
import { InfoModal } from '../../components/InfoModal';

type Partner = {
  id: string;
  name: string;
  type: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
};

type Forwarding = {
  id: string;
  missingPersonId: string;
  partnerId: string;
  status: string;
  notes?: string;
  response?: string;
  createdAt: string;
  partner: Partner;
  missingPerson: {
    id: string;
    fullName: string;
    age?: number;
    missingDate: string;
    province: string;
  };
  forwardedByUser: {
    id: string;
    fullName: string;
    role: string;
  };
};

export function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [forwardings, setForwardings] = useState<Forwarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [forwardNotes, setForwardNotes] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'POLICIA',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadPartners();
    loadForwardings();
  }, []);

  const loadPartners = async () => {
    try {
      const { data } = await api.get('/partners');
      setPartners(data.partners || []);
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadForwardings = async () => {
    try {
      const { data } = await api.get('/partners/forwardings');
      setForwardings(data.forwardings || []);
    } catch (error: any) {
      console.error('Erro ao carregar envios:', error);
    }
  };

  const handleCreatePartner = async () => {
    try {
      await api.post('/partners', formData);
      setSuccessMessage('Parceiro criado com sucesso!');
      setShowSuccessModal(true);
      setShowCreateModal(false);
      setFormData({
        name: '',
        type: 'POLICIA',
        contactName: '',
        email: '',
        phone: '',
        address: '',
      });
      await loadPartners();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar parceiro');
    }
  };

  const handleForwardCase = async () => {
    if (!selectedCase || !selectedPartner) {
      alert('Selecione um caso e um parceiro');
      return;
    }

    try {
      await api.post('/partners/forward', {
        missingPersonId: selectedCase,
        partnerId: selectedPartner,
        notes: forwardNotes,
      });
      setSuccessMessage('Caso enviado para o parceiro com sucesso!');
      setShowSuccessModal(true);
      setShowForwardModal(false);
      setSelectedCase('');
      setSelectedPartner('');
      setForwardNotes('');
      await loadForwardings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao enviar caso');
    }
  };

  const getPartnerTypeLabel = (type: string) => {
    switch (type) {
      case 'POLICIA':
        return 'Polícia';
      case 'PROTECAO_CIVIL':
        return 'Proteção Civil';
      case 'ORGAO_PARCEIRO':
        return 'Órgão Parceiro';
      case 'OUTRO':
        return 'Outro';
      default:
        return type;
    }
  };

  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'POLICIA':
        return Shield;
      case 'PROTECAO_CIVIL':
        return Building2;
      default:
        return Users;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-700';
      case 'RECEBIDO':
        return 'bg-green-100 text-green-700';
      case 'EM_ANALISE':
        return 'bg-amber-100 text-amber-700';
      case 'ACEITE':
        return 'bg-green-100 text-green-700';
      case 'REJEITADO':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parceiros Externos</h1>
          <p className="mt-2 text-slate-600">Gerencie parceiros e envie casos para polícia, proteção civil e outros órgãos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Parceiro
        </button>
      </div>

      {/* Lista de Parceiros */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {partners.map((partner) => {
          const Icon = getPartnerTypeIcon(partner.type);
          return (
            <div key={partner.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{partner.name}</p>
                    <p className="text-xs text-slate-600">{getPartnerTypeLabel(partner.type)}</p>
                  </div>
                </div>
                {partner.isActive ? (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ativo</span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Inativo</span>
                )}
              </div>
              {partner.contactName && (
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Contato:</strong> {partner.contactName}
                </p>
              )}
              {partner.email && (
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Email:</strong> {partner.email}
                </p>
              )}
              {partner.phone && (
                <p className="text-sm text-slate-600 mb-1">
                  <strong>Telefone:</strong> {partner.phone}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Envios de Casos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Envios de Casos</h2>
          <button
            onClick={() => setShowForwardModal(true)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            Enviar Caso
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Caso</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Parceiro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Enviado por</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {forwardings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum envio registrado
                    </td>
                  </tr>
                ) : (
                  forwardings.map((forwarding) => (
                    <tr key={forwarding.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <a
                          href={`/casos/${forwarding.missingPersonId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {forwarding.missingPerson.fullName}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{forwarding.partner.name}</p>
                        <p className="text-xs text-slate-600">{getPartnerTypeLabel(forwarding.partner.type)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{forwarding.forwardedByUser.fullName}</p>
                        <p className="text-xs text-slate-600">{forwarding.forwardedByUser.role}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(forwarding.status)}`}>
                          {forwarding.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(forwarding.createdAt).toLocaleDateString('pt-AO')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Criar Parceiro */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Criar Novo Parceiro</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Ex: Polícia Nacional de Angola"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="POLICIA">Polícia</option>
                  <option value="PROTECAO_CIVIL">Proteção Civil</option>
                  <option value="ORGAO_PARCEIRO">Órgão Parceiro</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Contato</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    type: 'POLICIA',
                    contactName: '',
                    email: '',
                    phone: '',
                    address: '',
                  });
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePartner}
                disabled={!formData.name}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Caso */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Enviar Caso para Parceiro</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID do Caso *</label>
                <input
                  type="text"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Cole o ID do caso aqui"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parceiro *</label>
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Selecione um parceiro</option>
                  {partners.filter((p) => p.isActive).map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} ({getPartnerTypeLabel(partner.type)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={forwardNotes}
                  onChange={(e) => setForwardNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={3}
                  placeholder="Adicione informações relevantes sobre o caso..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedCase('');
                  setSelectedPartner('');
                  setForwardNotes('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleForwardCase}
                disabled={!selectedCase || !selectedPartner}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
        title="Sucesso"
        message={successMessage}
        variant="success"
      />
    </div>
  );
}








