import React, { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import EquipmentDetail from "./components/EquipmentDetail/EquipmentDetail";
import apiClient from "./services/apiClient";

export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка данных оборудования при монтировании компонента
    useEffect(() => {
        loadEquipmentData();
    }, []);

    // Обновление данных каждые 30 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            loadEquipmentData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadEquipmentData = async () => {
        try {
            setError(null);
            const data = await apiClient.getAllEquipment();
            setEquipmentData(data);
        } catch (err) {
            console.error('Failed to load equipment data:', err);
            setError('Failed to load equipment data. Using fallback data.');
            setEquipmentData(getFallbackData());
        } finally {
            setLoading(false);
        }
    };

    const handleNav = (page) => {
        setCurrentPage(page);
        setSelectedEquipment(null);
    };

    const handleSelectEquipment = async (equipment) => {
        try {
            // Загружаем полные данные оборудования с сервера
            const fullData = await apiClient.getEquipmentById(equipment.id);

            // Преобразуем данные в формат, ожидаемый компонентом EquipmentDetail
            const transformedData = transformEquipmentData(fullData);
            setSelectedEquipment(transformedData);
        } catch (err) {
            console.error('Failed to load equipment details:', err);
            // В случае ошибки используем данные из списка с преобразованием
            const transformedData = transformEquipmentData(equipment);
            setSelectedEquipment(transformedData);
        }
    };

    // Функция для преобразования данных в формат, ожидаемый EquipmentDetail
    const transformEquipmentData = (equipment) => {
        let metrics = { vibration: 'N/A', temperature: 'N/A', pressure: 'N/A' };
        let historicalData = [];
        let prediction = null;

        // Извлекаем метрики в зависимости от типа оборудования
        if (equipment.type === 'Pump' && equipment.pumpSensors && equipment.pumpSensors.length > 0) {
            const latest = equipment.pumpSensors[0];
            metrics = {
                vibration: latest.vibrationX || latest.vibrationY || latest.vibrationZ || 'N/A',
                temperature: latest.temperature || latest.bearingTemperature || 'N/A',
                pressure: latest.dischargePressure || latest.suctionPressure || 'N/A',
            };

            // Создаём исторические данные для графика
            historicalData = equipment.pumpSensors.slice(0, 30).reverse().map((d, i) => ({
                day: -30 + i,
                vibration: d.vibrationX || d.vibrationY || 0,
                temperature: d.temperature || 0,
            }));
        } else if (equipment.type === 'Compressor' && equipment.compressorSensors && equipment.compressorSensors.length > 0) {
            const latest = equipment.compressorSensors[0];
            metrics = {
                vibration: latest.vibrationAxial || latest.vibrationRadial || 'N/A',
                temperature: latest.outletTemperature || latest.inletTemperature || 'N/A',
                pressure: latest.outletPressure || latest.inletPressure || 'N/A',
            };

            historicalData = equipment.compressorSensors.slice(0, 30).reverse().map((d, i) => ({
                day: -30 + i,
                vibration: d.vibrationAxial || 0,
                temperature: d.outletTemperature || 0,
            }));
        } else if (equipment.type === 'Turbine' && equipment.turbineSensors && equipment.turbineSensors.length > 0) {
            const latest = equipment.turbineSensors[0];
            metrics = {
                vibration: latest.vibrationBearing1 || latest.vibrationBearing2 || 'N/A',
                temperature: latest.exhaustTemperature || latest.inletTemperature || 'N/A',
                pressure: latest.inletPressure || 'N/A',
            };

            historicalData = equipment.turbineSensors.slice(0, 30).reverse().map((d, i) => ({
                day: -30 + i,
                vibration: d.vibrationBearing1 || 0,
                temperature: d.exhaustTemperature || 0,
            }));
        }

        // Если нет исторических данных, создаём fallback
        if (historicalData.length === 0) {
            historicalData = Array.from({ length: 7 }, (_, i) => ({
                day: -30 + i * 5,
                vibration: Math.random() * 5 + 2,
                temperature: Math.random() * 10 + 70,
            }));
        }

        // Проверяем predictions
        if (equipment.predictions && equipment.predictions.length > 0) {
            const latestPrediction = equipment.predictions.find(p => !p.isAcknowledged);
            if (latestPrediction) {
                prediction = {
                    timeToFailure: `${Math.ceil(latestPrediction.predictedDaysToFailure || 0)} days`,
                    confidence: `${Math.round((latestPrediction.confidence || 0) * 100)}%`,
                    reason: latestPrediction.failureType || 'Anomaly detected',
                };
            }
        }

        return {
            ...equipment,
            metrics,
            historicalData,
            prediction,
        };
    };

    if (loading) {
        return (
            <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading equipment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <Header onNavClick={handleNav} />

            {error && (
                <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-200 px-4 py-3 mx-8 mt-4 rounded">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <main>
                {currentPage === 'dashboard' && (
                    <Dashboard
                        equipmentList={equipmentData}
                        onSelectEquipment={handleSelectEquipment}
                        onRefresh={loadEquipmentData}
                    />
                )}
                {currentPage === 'assistant' && <Assistant />}
            </main>

            {selectedEquipment && (
                <EquipmentDetail
                    equipment={selectedEquipment}
                    onBack={() => setSelectedEquipment(null)}
                />
            )}
        </div>
    );
}

// Fallback данные на случай недоступности API
function getFallbackData() {
    return [
        {
            id: 'PMP-001A',
            name: 'Crude Oil Export Pump A',
            type: 'Pump',
            status: 'Critical',
            location: 'Zone 1',
            healthScore: 65.5,
            installationDate: new Date().toISOString(),
            lastMaintenanceDate: new Date().toISOString(),
        },
        {
            id: 'CMP-002B',
            name: 'Gas Compressor B',
            type: 'Compressor',
            status: 'Warning',
            location: 'Zone 2',
            healthScore: 82.0,
            installationDate: new Date().toISOString(),
            lastMaintenanceDate: new Date().toISOString(),
        },
        {
            id: 'TRB-003C',
            name: 'Power Generation Turbine C',
            type: 'Turbine',
            status: 'Operational',
            location: 'Zone 3',
            healthScore: 95.2,
            installationDate: new Date().toISOString(),
            lastMaintenanceDate: new Date().toISOString(),
        }
    ];
}