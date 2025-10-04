const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  },
  size: { 
    type: Number, 
    required: true 
  },
  mimetype: { 
    type: String, 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('File', fileSchema);