const axios = require('axios');
const fs = require('fs');
const projectController = {
  getProjectsOverview: async (req, res) => {
    try {
      const response = await axios.get(`${process.env.FLASK_BASE_URL}/api/projects-overview`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching projects overview:', error.message);
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.error || 'Failed to fetch projects overview from backend';
      res.status(status).json({ error: errorMessage });
    }
  },
  
  getProjectMarkdown: async (req, res) => {
    try {
      const { title } = req.params;
      if (!title) {
        return res.status(400).json({ error: 'Missing title parameter' });
      }
      
      const response = await axios.get(`${process.env.FLASK_BASE_URL}/api/project-markdown/${encodeURIComponent(title)}`);
      const markdown = response.data.markdown;
      fs.writeFileSync(`${title}.md`, markdown);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching project markdown:', error.message);
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.error || 'Failed to fetch project markdown from backend';
      res.status(status).json({ error: errorMessage });
    }
  }
}

module.exports = projectController;