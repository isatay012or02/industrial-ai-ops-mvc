import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard/StatCard";
import EquipmentCard from "../components/EquipmentCard/EquipmentCard";
import WrenchIcon from "../components/Icons/WrenchIcon";
import BoltIcon from "../components/Icons/BoltIcon";
import apiClient from "../services/apiClient";

export default function Dashboard({ equipmentList, onSelectEquipment, onRefresh }) {
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, [equipmentList]);

    const loadDashboardStats = async () => {
        try {
            const stats = await apiClient.getDashboardSummary();
            setDashboardStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            // Calculate stats from equipment list as fallback
            calculateStatsFromEquipment();
        } finally {
            setLoading(false);
        }
    };

    const calculateStatsFromEquipment = () => {
        const stats = {
            totalEquipment: equipmentList.length,
            equipmentStatus: {
                operational: equipmentList.filter(e => e.status === 'Operational').length,
                warning: equipmentList.filter(e => e.status === 'Warning').length,
                critical: equipmentList.filter(e => e.status === 'Critical').length,
                offline: equipmentList.filter(e => e.status === 'Offline').length,
            },
            criticalAlerts: equipmentList.filter(e => e.status === 'Critical').length,
            averageHealthScore: equipmentList.length > 0
                ? (equipmentList.reduce((sum, e) => sum + (e.healthScore || 0), 0) / equipmentList.length).toFixed(1)
                : 0,
        };
        setDashboardStats(stats);
    };

    const criticalCount = dashboardStats?.equipmentStatus?.critical || 0;
    const avgHealth = dashboardStats?.averageHealthScore || 0;

    return (
        <div className="p-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Monitored Assets"
                    value={equipmentList.length}
                    icon={<WrenchIcon />}
                />
                <StatCard
                    title="Critical Alerts"
                    value={criticalCount}
                    change={criticalCount > 0 ? `${criticalCount} need attention` : "All systems normal"}
                    icon={<BoltIcon />}
                />
                <StatCard
                    title="Avg Health Score"
                    value={`${avgHealth}%`}
                    change={avgHealth > 85 ? "+2% from last week" : "Requires monitoring"}
                    icon={<WrenchIcon />}
                />
                <StatCard
                    title="System Status"
                    value={criticalCount === 0 ? "Good" : "Alert"}
                    change={`${equipmentList.filter(e => e.status === 'Operational').length} operational`}
                    icon={<BoltIcon />}
                />
            </div>

            {/* Header with Refresh Button */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-2xl font-semibold text-white">
                    Equipment Status
                </h2>
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Equipment Cards */}
            {equipmentList.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No equipment data available</p>
                    <button
                        onClick={onRefresh}
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                    >
                        Load Equipment Data
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {equipmentList.map(eq => (
                        <EquipmentCard
                            key={eq.id}
                            equipment={eq}
                            onSelect={onSelectEquipment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}