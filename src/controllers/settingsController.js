import { dataService } from '../services/dataService.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await dataService.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updated = await dataService.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Website settings updated successfully',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update website settings' });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await dataService.getDashboardAnalytics();
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to compile dashboard analytics' });
  }
};

