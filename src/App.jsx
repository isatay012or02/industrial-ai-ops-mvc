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
            // Используем fallback данные при ошибке
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
            setSelectedEquipment(fullData);
        } catch (err) {
            console.error('Failed to load equipment details:', err);
            setSelectedEquipment(equipment);
        }
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