import React from "react";
import SimpleChart from "../SimpleChart/SimpleChart";
import { getStatusStyles } from "../../utils/getStatusStyles";
import CloseIcon from "../Icons/CloseIcon";

export default function EquipmentDetail({ equipment, onBack }) {
  const styles = getStatusStyles(equipment.status);
  const primaryMetric = equipment.type === 'Compressor' ? 'temperature' : 'vibration';
  const chartColor = styles.dot;

  // Безопасное извлечение метрик с fallback значениями
  const metrics = equipment.metrics || {
    vibration: 'N/A',
    temperature: 'N/A',
    pressure: 'N/A',
  };

  // Безопасное извлечение исторических данных
  const historicalData = equipment.historicalData || [];

  // Безопасное извлечение prediction
  const prediction = equipment.prediction || null;

  return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-500/10">
          <div className="p-6 sticky top-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{equipment.name}</h2>
              <p className="text-gray-400">{equipment.id} | {equipment.location}</p>
            </div>
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
              <CloseIcon />
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`md:col-span-3 p-6 rounded-lg ${styles.bg} border ${styles.border}`}>
              {prediction ? (
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className={`text-xl font-bold ${styles.text}`}>AI Prediction Analysis</h3>
                      <p className="text-gray-300 mt-2">{prediction.reason}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-center flex-shrink-0">
                      <p className="text-gray-300 text-sm">Predicted Time to Failure</p>
                      <p className={`text-4xl font-bold ${styles.text}`}>{prediction.timeToFailure}</p>
                      <p className="text-gray-300 text-sm">Confidence: {prediction.confidence}</p>
                    </div>
                  </div>
              ) : (
                  <div className="text-center w-full">
                    <h3 className={`text-xl font-bold ${styles.text}`}>System Healthy</h3>
                    <p className="text-gray-300 mt-2">No anomalies detected.</p>
                  </div>
              )}
            </div>

            <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Live Metrics</h3>
              <div className="space-y-4">
                <Metric label="Vibration" value={metrics.vibration} unit="mm/s" />
                <Metric label="Temperature" value={metrics.temperature} unit="°C" />
                <Metric label="Pressure" value={metrics.pressure} unit="psi" />
              </div>
            </div>

            <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Historical {primaryMetric} Trend (30 Days)
              </h3>
              {historicalData.length > 0 ? (
                  <SimpleChart data={historicalData} dataKey={primaryMetric} color={chartColor} />
              ) : (
                  <div className="flex items-center justify-center h-[150px] text-gray-400">
                    No historical data available
                  </div>
              )}
            </div>
          </div>

          <div className="p-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
            {prediction ? (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Schedule maintenance within the next 48 hours.</li>
                  <li>Prepare bearing replacement kit.</li>
                  <li>Notify operations about possible downtime.</li>
                </ul>
            ) : (
                <p className="text-gray-400">No immediate actions required.</p>
            )}
          </div>
        </div>
      </div>
  );
}

function Metric({ label, value, unit }) {
  // Безопасная обработка значений
  const displayValue = value !== undefined && value !== null && value !== 'N/A'
      ? value
      : 'N/A';

  return (
      <div className="flex justify-between items-baseline">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-mono text-xl">
        {displayValue} {displayValue !== 'N/A' && <span className="text-sm text-gray-400">{unit}</span>}
      </span>
      </div>
  );
}