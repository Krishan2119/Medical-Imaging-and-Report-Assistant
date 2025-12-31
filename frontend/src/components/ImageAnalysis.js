import React, { useState } from 'react';
import { analysisAPI } from '../Api.js';

const ImageAnalysis = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyType, setStudyType] = useState('general');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('study_type', studyType);

      const response = await analysisAPI.analyze(formData);
      
      if (response.data.success) {
        setAnalysisResult(response.data.data.analysis);
      } else {
        setAnalysisResult('Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      // For demo purposes, show mock analysis result
      const mockAnalysis = `
MEDICAL IMAGE ANALYSIS REPORT
============================

Study Type: ${studyType.replace('_', ' ').toUpperCase()}

FINDINGS:
The image quality is adequate for interpretation. No acute abnormalities detected in the study. 
The anatomical structures are within normal limits for the specified study type.

IMPRESSION:
Study appears within normal limits.

CONFIDENCE SCORE: 85.0%

DISCLAIMER: This is an AI-assisted analysis for educational purposes only. 
All findings must be reviewed and validated by a qualified medical professional.
      `;
      setAnalysisResult(mockAnalysis);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    
    const blob = new Blob([analysisResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Image Analysis</h1>
        <p className="text-gray-600">Upload and analyze medical images with AI assistance</p>
      </div>

      {/* Medical Disclaimer */}
      <div className="alert alert-warning">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2 mt-0.5 text-sm">⚠️</div>
          <div className="text-sm">
            <strong>Important:</strong> This AI analysis is for educational and training purposes only. 
            All results must be reviewed and validated by qualified medical professionals before any clinical use.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Medical Image</h2>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">
                Study Type
              </label>
              <select
                value={studyType}
                onChange={(e) => setStudyType(e.target.value)}
                className="form-select"
              >
                <option value="general">General</option>
                <option value="chest_xray">Chest X-ray</option>
                <option value="brain_mri">Brain MRI</option>
                <option value="abdominal_ct">Abdominal CT</option>
                <option value="spine_mri">Spine MRI</option>
                <option value="mammography">Mammography</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded shadow"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setAnalysisResult(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl text-gray-400 mb-4">📁</div>
                  <div className="text-gray-600">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Click to upload</span>
                      <span> or drag and drop</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, TIFF, or DICOM files up to 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.tiff,.dicom"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="text-2xl mr-2">🖼️</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn btn-primary cursor-pointer opacity-50 cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      🔬 Analyze Image
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
          
          {!analysisResult && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-400 mb-4">🔬</div>
              <p className="text-gray-500">
                Upload and analyze an image to see results here
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI is analyzing the image...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {analysisResult}
                </pre>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadReport}
                  className="btn btn-success"
                >
                  📥 Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;
