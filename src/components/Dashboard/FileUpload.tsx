import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardMetricsData, DashboardSHACLData } from './DashboardTypes';

interface FileUploadProps {
  onMetricsLoad: (data: DashboardMetricsData) => void;
  onShaclLoad: (data: DashboardSHACLData) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onMetricsLoad, onShaclLoad, onError }) => {
  const { t } = useTranslation();
  const metricsFileRef = useRef<HTMLInputElement>(null);
  const shaclFileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMetricsFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      onError('Please select a JSON file for metrics data');
      return;
    }

    setIsLoading(true);
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      // Basic validation of the JSON structure
      if (!data.dimensions || !data.metrics || typeof data.totalScore !== 'number') {
        throw new Error('Invalid JSON structure. Expected metrics data with dimensions, metrics, and totalScore fields.');
      }

      onMetricsLoad(data);
    } catch (error) {
      onError(`Error reading metrics file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShaclFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ttl')) {
      onError('Please select a TTL file for SHACL validation data');
      return;
    }

    setIsLoading(true);
    try {
      const content = await file.text();
      
      // Basic validation of TTL content
      if (!content.includes('sh:ValidationReport') && !content.includes('ValidationReport')) {
        console.warn('File may not contain SHACL validation report');
      }

      onShaclLoad({
        ttlContent: content,
        fileName: file.name
      });
    } catch (error) {
      onError(`Error reading SHACL file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-cloud-upload me-2"></i>
          {t('dashboard.uploads.load_data')}
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Metrics JSON Upload */}
          <div className="col-md-6">
            <div className="border rounded p-4 text-center">
              <i className="bi bi-filetype-json display-4 text-primary mb-3"></i>
              <h6>{t('dashboard.files.file_json_metrics')}</h6>
              <p className="text-muted small mb-3">
                {t('dashboard.files.file_json_metrics_description')}
              </p>
              <div className="d-grid">
                <input
                  ref={metricsFileRef}
                  type="file"
                  accept=".json"
                  onChange={handleMetricsFileChange}
                  className="form-control mb-2"
                  disabled={isLoading}
                />
                <button
                  className="btn btn-outline-primary"
                  onClick={() => metricsFileRef.current?.click()}
                  disabled={isLoading}
                >
                  <i className="bi bi-upload me-1"></i>
                  {t('dashboard.uploads.choose_file')}
                </button>
              </div>
            </div>
          </div>

          {/* SHACL TTL Upload */}
          <div className="col-md-6">
            <div className="border rounded p-4 text-center">
              <i className="bi bi-file-earmark-code display-4 text-success mb-3"></i>
              <h6>{t('dashboard.files.file_ttl_shacl')}</h6>
              <p className="text-muted small mb-3">
                {t('dashboard.files.file_ttl_shacl_description')}
              </p>
              <div className="d-grid">
                <input
                  ref={shaclFileRef}
                  type="file"
                  accept=".ttl"
                  onChange={handleShaclFileChange}
                  className="form-control mb-2"
                  disabled={isLoading}
                />
                <button
                  className="btn btn-outline-success"
                  onClick={() => shaclFileRef.current?.click()}
                  disabled={isLoading}
                >
                  <i className="bi bi-upload me-1"></i>
                  {t('dashboard.uploads.choose_file')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center mt-3">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">{t('common.states.loading')}</span>
            </div>
            {t('dashboard.uploads.loading')}
          </div>
        )}

        {/* Sample Data Info */}
        <div className="mt-4">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-1"></i>
              {t('dashboard.formats.expected_formats')}
            </h6>
            <ul className="mb-0">
              <li><strong>{t('dashboard.formats.json_metrics')}:</strong> {t('dashboard.formats.json_format')}</li>
              <li><strong>{t('dashboard.formats.ttl_shacl')}:</strong> {t('dashboard.formats.ttl_format')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;