import React from "react";
import { getStatusStyles } from "../../utils/getStatusStyles";

export default function EquipmentCard({ equipment, onSelect }) {
    const styles = getStatusStyles(equipment.status);

    // Извлекаем метрики в зависимости от типа оборудования
    const getMetrics = () => {
        if (equipment.type === 'Pump' && equipment.pumpSensors && equipment.pumpSensors.length > 0) {
            const latest = equipment.pumpSensors[0];
            return {
                vibration: latest.vibrationX || latest.vibrationY || latest.vibrationZ || 'N/A',
                temperature: latest.temperature || latest.bearingTemperature || 'N/A',
                pressure: latest.dischargePressure || latest.suctionPressure || 'N/A',
            };
        } else if (equipment.type === 'Compressor' && equipment.compressorSensors && equipment.compressorSensors.length > 0) {
            const latest = equipment.compressorSensors[0];
            return {
                vibration: latest.vibrationAxial || latest.vibrationRadial || 'N/A',
                temperature: latest.outletTemperature || latest.inletTemperature || 'N/A',
                pressure: latest.outletPressure || latest.inletPressure || 'N/A',
            };
        } else if (equipment.type === 'Turbine' && equipment.turbineSensors && equipment.turbineSensors.length > 0) {
            const latest = equipment.turbineSensors[0];
            return {
                vibration: latest.vibrationBearing1 || latest.vibrationBearing2 || 'N/A',
                temperature: latest.exhaustTemperature || latest.inletTemperature || 'N/A',
                pressure: latest.inletPressure || 'N/A',
            };
        }

        return {
            vibration: 'N/A',
            temperature: 'N/A',
            pressure: 'N/A',
        };
    };

    const metrics = getMetrics();

    // Находим последний prediction, если есть
    const latestPrediction = equipment.predictions && equipment.predictions.length > 0
        ? equipment.predictions[0]
        : null;

    return (
        <div
            className={`bg-gray-800 p-4 rounded-lg border-l-4 ${styles.border} cursor-pointer hover:bg-gray-700/80 transition-all duration-300 transform hover:scale-105`}
            onClick={() => onSelect(equipment)}
        >
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">{equipment.name}</h4>
                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.bg} ${styles.text}`}>
                    {equipment.status}
                </div>
            </div>

            <p className="text-sm text-gray-400 mt-1">
                {equipment.id} | {equipment.type}
            </p>

            <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Health Score</span>
                    <span className={`font-semibold ${
                        equipment.healthScore >= 85 ? 'text-green-400' :
                            equipment.healthScore >= 70 ? 'text-yellow-400' :
                                'text-red-400'
                    }`}>
            {equipment.healthScore ? `${equipment.healthScore.toFixed(1)}%` : 'N/A'}
          </span>
                </div>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-300">
                <span>Vibration: <span className="font-semibold">{metrics.vibration}</span></span>
                <span>Temp: <span className="font-semibold">{metrics.temperature}°C</span></span>
                <span>Press: <span className="font-semibold">{metrics.pressure}</span></span>
            </div>

            {latestPrediction && !latestPrediction.isAcknowledged && (
                <div className={`mt-3 p-3 rounded-md text-sm ${styles.bg} border ${styles.border}`}>
                    <p className={`${styles.text} font-bold`}>
                        {latestPrediction.failureType}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                        Confidence: {(latestPrediction.confidence * 100).toFixed(0)}%
                    </p>
                </div>
            )}
        </div>
    );
}