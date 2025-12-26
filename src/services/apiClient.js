const API_BASE_URL = 'http://localhost:5282/api/'//import.meta.env.VITE_API_URL || 'https://localhost:7254/api/v1';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Equipment endpoints
    async getAllEquipment() {
        return this.request('equipment/list');
    }

    async getEquipmentById(id) {
        return this.request(`equipment/${id}`);
    }

    async createEquipment(data) {
        return this.request('equipment', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateEquipment(data) {
        return this.request('equipment', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteEquipment(id) {
        return this.request(`equipment/${id}`, {
            method: 'DELETE',
        });
    }

    // Dashboard endpoints
    async getDashboardSummary() {
        return this.request('dashboard/summary');
    }

    // Sensor Data endpoints
    async getPumpSensorData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`sensor-data/pump${queryString ? `?${queryString}` : ''}`);
    }

    async addPumpSensorData(data) {
        return this.request('sensor-data/pump', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async detectPumpAnomaly(id) {
        return this.request(`sensor-data/pump/${id}/detect-anomaly`, {
            method: 'POST',
        });
    }

    async getCompressorSensorData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`sensor-data/compressor${queryString ? `?${queryString}` : ''}`);
    }

    async addCompressorSensorData(data) {
        return this.request('sensor-data/compressor', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async detectCompressorAnomaly(id) {
        return this.request(`sensor-data/compressor/${id}/detect-anomaly`, {
            method: 'POST',
        });
    }

    async getTurbineSensorData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`sensor-data/turbine${queryString ? `?${queryString}` : ''}`);
    }

    async addTurbineSensorData(data) {
        return this.request('sensor-data/turbine', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async detectTurbineAnomaly(id) {
        return this.request(`sensor-data/turbine/${id}/detect-anomaly`, {
            method: 'POST',
        });
    }

    // Maintenance Prediction endpoints
    async getMaintenancePredictions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`maintenance-prediction${queryString ? `?${queryString}` : ''}`);
    }

    async createMaintenancePrediction(data) {
        return this.request('maintenance-prediction', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async predictMaintenance(equipmentId) {
        return this.request(`maintenance-prediction/${equipmentId}/predict-maintenance`, {
            method: 'POST',
        });
    }

    async acknowledgePrediction(id) {
        return this.request(`maintenance-prediction/${id}/acknowledge`, {
            method: 'PUT',
        });
    }

    // Analytics endpoints
    async getEquipmentHealthTrend(equipmentId, days = 30) {
        return this.request(`analytics/equipment/${equipmentId}/health-trend?days=${days}`);
    }

    // ML Model Management endpoints
    async getModelsStatus() {
        return this.request('ml-models/status');
    }

    async initializeModels() {
        return this.request('ml-models/initialize', {
            method: 'POST',
        });
    }

    async retrainModels() {
        return this.request('ml-models/retrain', {
            method: 'POST',
        });
    }
}

const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;