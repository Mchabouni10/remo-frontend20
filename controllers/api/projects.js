// controllers/api/projects.js
const Project = require('../../models/project');

module.exports = {
  create,
  index,
  show,
  update,
  delete: deleteProject,
};

async function create(req, res) {
  try {
    const projectData = {
      userId: req.user._id,
      customerInfo: req.body.customerInfo,
      categories: req.body.categories || [],
      settings: {
        taxRate: req.body.settings?.taxRate || 0,
        transportationFee: req.body.settings?.transportationFee || 0,
        wasteFactor: req.body.settings?.wasteFactor || 0,
        miscFees: req.body.settings?.miscFees || [],
        deposit: req.body.settings?.deposit || 0,
        amountPaid: req.body.settings?.amountPaid || 0,
        markup: req.body.settings?.markup || 0,  // Added
      },
    };
    const project = new Project(projectData);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Bad request' });
  }
}

async function index(req, res) {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function show(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const updatedData = {
      customerInfo: req.body.customerInfo,
      categories: req.body.categories,
      settings: req.body.settings,
      updatedAt: Date.now(),
    };
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatedData,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Bad request' });
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}