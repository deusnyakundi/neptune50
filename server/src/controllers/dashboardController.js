const dashboardModel = require('../models/dashboardModel');

const dashboardController = {
    // Get overview stats
    getOverview: async (req, res) => {
        try {
            const stats = await dashboardModel.getOverviewStats();
            res.json(stats);
        } catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({ message: 'Error fetching dashboard overview' });
        }
    },

    // Get timeline data
    getTimeline: async (req, res) => {
        try {
            const timeline = await dashboardModel.getProjectTimeline();
            res.json(timeline);
        } catch (error) {
            console.error('Timeline error:', error);
            res.status(500).json({ message: 'Error fetching timeline data' });
        }
    },

    // Get engineer metrics
    getEngineerMetrics: async (req, res) => {
        try {
            const metrics = await dashboardModel.getEngineerMetrics();
            res.json(metrics);
        } catch (error) {
            console.error('Engineer metrics error:', error);
            res.status(500).json({ message: 'Error fetching engineer metrics' });
        }
    }
};

module.exports = dashboardController; 