import { Settings } from "../models/settings.model.js";
import { autoExport } from "./export.controller.js";

// Get setting by key
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      // Return empty value instead of 404 - allows frontend to handle gracefully
      return res.json({ key, value: null });
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update or create setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const [setting, created] = await Settings.upsert({
      key,
      value: value || null,
    }, {
      returning: true,
    });

    // Auto-export when settings change
    if (key === 'whatsapp_number' || key === 'show_prices') {
      await autoExport();
    }
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

