import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { Shield, Users, CheckCircle, XCircle, Save } from 'lucide-react';
import { InfoModal } from '../../components/InfoModal';

type Role = {
  name: string;
  label: string;
  permissions: {
    viewCases: boolean;
    createCases: boolean;
    editCases: boolean;
    deleteCases: boolean;
    approveCases: boolean;
    rejectCases: boolean;
    changeStatus: boolean;
    viewUsers: boolean;
    manageUsers: boolean;
    viewAnalytics: boolean;
    manageSettings: boolean;
  };
};

const ROLES: Role[] = [
  {
    name: 'CIDADAO',
    label: 'Cidadão',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: false,
      deleteCases: false,
      approveCases: false,
      rejectCases: false,
      changeStatus: false,
      viewUsers: false,
      manageUsers: false,
      viewAnalytics: false,
      manageSettings: false,
    },
  },
  {
    name: 'FAMILIAR',
    label: 'Familiar',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: true,
      deleteCases: false,
      approveCases: false,
      rejectCases: false,
      changeStatus: false,
      viewUsers: false,
      manageUsers: false,
      viewAnalytics: false,
      manageSettings: false,
    },
  },
  {
    name: 'VOLUNTARIO',
    label: 'Voluntário',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: false,
      deleteCases: false,
      approveCases: false,
      rejectCases: false,
      changeStatus: false,
      viewUsers: false,
      manageUsers: false,
      viewAnalytics: false,
      manageSettings: false,
    },
  },
  {
    name: 'MODERADOR',
    label: 'Moderador',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: true,
      deleteCases: false,
      approveCases: true,
      rejectCases: true,
      changeStatus: true,
      viewUsers: true,
      manageUsers: false,
      viewAnalytics: true,
      manageSettings: false,
    },
  },
  {
    name: 'AUTORIDADE',
    label: 'Autoridade',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: true,
      deleteCases: false,
      approveCases: false,
      rejectCases: false,
      changeStatus: true,
      viewUsers: true,
      manageUsers: false,
      viewAnalytics: true,
      manageSettings: false,
    },
  },
  {
    name: 'ADMIN',
    label: 'Administrador',
    permissions: {
      viewCases: true,
      createCases: true,
      editCases: true,
      deleteCases: true,
      approveCases: true,
      rejectCases: true,
      changeStatus: true,
      viewUsers: true,
      manageUsers: true,
      viewAnalytics: true,
      manageSettings: true,
    },
  },
];

const PERMISSION_LABELS: Record<string, string> = {
  viewCases: 'Visualizar Casos',
  createCases: 'Criar Casos',
  editCases: 'Editar Casos',
  deleteCases: 'Deletar Casos',
  approveCases: 'Aprovar Casos',
  rejectCases: 'Rejeitar Casos',
  changeStatus: 'Alterar Status',
  viewUsers: 'Visualizar Usuários',
  manageUsers: 'Gerenciar Usuários',
  viewAnalytics: 'Visualizar Analytics',
  manageSettings: 'Gerenciar Configurações',
};

export function PermissionsPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const togglePermission = (roleName: string, permission: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.name === roleName
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permission]: !role.permissions[permission as keyof typeof role.permissions],
              },
            }
          : role
      )
    );
  };

  const handleSave = () => {
    // Aqui você salvaria as permissões no backend
    // Por enquanto, apenas mostra mensagem de sucesso
    setShowSuccessModal(true);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Permissões e Roles</h1>
        <p className="mt-1 text-slate-600">Gerencie permissões e acesso por role</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Configuração de Permissões</h2>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                {Object.keys(PERMISSION_LABELS).map((key) => (
                  <th key={key} className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                    {PERMISSION_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roles.map((role) => (
                <tr key={role.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="font-semibold text-slate-900">{role.label}</span>
                    </div>
                  </td>
                  {Object.keys(PERMISSION_LABELS).map((permission) => (
                    <td key={permission} className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePermission(role.name, permission)}
                        className={`p-2 rounded transition-colors ${
                          role.permissions[permission as keyof typeof role.permissions]
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {role.permissions[permission as keyof typeof role.permissions] ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Permissões Atualizadas"
        message="As permissões foram atualizadas com sucesso!"
        variant="success"
      />
    </div>
  );
}


