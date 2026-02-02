import { useState, useEffect } from 'react';
import { Image, AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react';
import { api } from '../../api/client';
import { InfoModal } from '../../components/InfoModal';

type ImageAnalysis = {
  id: string;
  photoId: string;
  analysisType: string;
  confidence: number;
  isManipulated: boolean;
  manipulationDetails?: string;
  analyzedAt: string;
  photo: {
    id: string;
    url: string;
    missingPerson: {
      id: string;
      fullName: string;
    };
  };
  result: any;
};

export function ImageAnalysisPage() {
  const [analyses, setAnalyses] = useState<ImageAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAnalyses();
  }, [filter]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const params = filter ? `?isManipulated=${filter}` : '';
      const { data } = await api.get(`/image-analysis${params}`);
      setAnalyses(data.analyses || []);
    } catch (error: any) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (photoId: string) => {
    try {
      setAnalyzing(true);
      await api.post(`/image-analysis/analyze/${photoId}`, {
        analysisType: 'FULL_ANALYSIS',
      });
      setSuccessMessage('Análise concluída com sucesso!');
      setShowSuccessModal(true);
      await loadAnalyses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao analisar imagem');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeCase = async (caseId: string) => {
    try {
      setAnalyzing(true);
      await api.post(`/image-analysis/case/${caseId}/analyze-all`);
      setSuccessMessage('Análise de todas as imagens do caso concluída!');
      setShowSuccessModal(true);
      await loadAnalyses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao analisar imagens do caso');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Análise de Imagens</h1>
        <p className="mt-2 text-slate-600">Detecte edições e manipulações em fotos de casos</p>
      </div>

      {/* Filtros e Ações */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
        >
          <option value="">Todas as Imagens</option>
          <option value="true">Manipuladas</option>
          <option value="false">Não Manipuladas</option>
        </select>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ID da foto para análise"
            value={selectedPhotoId}
            onChange={(e) => setSelectedPhotoId(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300"
          />
          <button
            onClick={() => selectedPhotoId && handleAnalyze(selectedPhotoId)}
            disabled={!selectedPhotoId || analyzing}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${analyzing ? 'animate-spin' : ''}`} />
            Analisar Foto
          </button>
        </div>
      </div>

      {/* Lista de Análises */}
      <div className="space-y-4">
        {analyses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Image className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Nenhuma análise encontrada</p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={analysis.photo.url}
                    alt="Foto analisada"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Caso: {analysis.photo.missingPerson.fullName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Analisado em {new Date(analysis.analyzedAt).toLocaleString('pt-AO')}
                      </p>
                    </div>
                    {analysis.isManipulated ? (
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Manipulada
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Original
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-600">
                        <strong>Confiança:</strong> {(analysis.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Tipo de Análise:</strong> {analysis.analysisType}
                      </p>
                    </div>
                    {analysis.isManipulated && analysis.manipulationDetails && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-semibold text-red-900 mb-1">Detalhes da Manipulação:</p>
                        <p className="text-sm text-red-700">{analysis.manipulationDetails}</p>
                      </div>
                    )}
                    {analysis.result && (
                      <details className="mt-2">
                        <summary className="text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                          Ver detalhes técnicos
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-50 rounded text-xs overflow-auto">
                          {JSON.stringify(analysis.result, null, 2)}
                        </pre>
                      </details>
                    )}
                    <a
                      href={`/casos/${analysis.photo.missingPerson.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline inline-block"
                    >
                      Ver caso completo →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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








