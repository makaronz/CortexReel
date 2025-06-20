// MongoDB initialization script for CortexReel
// This script runs when the MongoDB container starts for the first time

// Switch to cortexreel database
db = db.getSiblingDB('cortexreel');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          bsonType: 'string',
          enum: ['Director', 'Producer', 'Cinematographer', 'Safety Coordinator', 'Admin']
        },
        preferences: {
          bsonType: 'object',
          properties: {
            darkMode: { bsonType: 'bool' },
            language: { bsonType: 'string' },
            notifications: { bsonType: 'bool' }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('screenplays', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'userId', 'status', 'createdAt'],
      properties: {
        title: { bsonType: 'string', minLength: 1 },
        userId: { bsonType: 'objectId' },
        originalFilename: { bsonType: 'string' },
        fileSize: { bsonType: 'number' },
        mimeType: { bsonType: 'string' },
        extractedText: { bsonType: 'string' },
        status: {
          bsonType: 'string',
          enum: ['uploaded', 'processing', 'analyzed', 'error']
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('analyses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['screenplayId', 'userId', 'status', 'createdAt'],
      properties: {
        screenplayId: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        status: {
          bsonType: 'string',
          enum: ['queued', 'processing', 'completed', 'failed']
        },
        progress: {
          bsonType: 'object',
          properties: {
            completedSections: { bsonType: 'array' },
            totalSections: { bsonType: 'number' },
            currentSection: { bsonType: 'string' }
          }
        },
        results: {
          bsonType: 'object',
          properties: {
            scriptMetadata: { bsonType: 'object' },
            sceneStructure: { bsonType: 'object' },
            locationAnalysis: { bsonType: 'object' },
            pacingAnalysis: { bsonType: 'object' },
            themeAnalysis: { bsonType: 'object' },
            characterDetails: { bsonType: 'object' },
            characterRelationships: { bsonType: 'object' },
            psychologicalAnalysis: { bsonType: 'object' },
            emotionalArcs: { bsonType: 'object' },
            extraRequirements: { bsonType: 'object' },
            propsManagement: { bsonType: 'object' },
            vehicleCoordination: { bsonType: 'object' },
            weaponManagement: { bsonType: 'object' },
            lightingSchemes: { bsonType: 'object' },
            technicalRequirements: { bsonType: 'object' },
            resourcePlanning: { bsonType: 'object' },
            difficultScenes: { bsonType: 'object' },
            permitRequirements: { bsonType: 'object' },
            productionRisks: { bsonType: 'object' },
            comprehensiveSafety: { bsonType: 'object' },
            intimacyCoordination: { bsonType: 'object' },
            animalCoordination: { bsonType: 'object' },
            stuntCoordination: { bsonType: 'object' },
            equipmentPlanning: { bsonType: 'object' },
            budgetAnalysis: { bsonType: 'object' },
            productionChecklist: { bsonType: 'object' },
            postProductionNotes: { bsonType: 'object' }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('configurations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'config', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        type: {
          bsonType: 'string',
          enum: ['llm', 'prompts', 'app']
        },
        config: { bsonType: 'object' },
        version: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('jobs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'status', 'createdAt'],
      properties: {
        type: {
          bsonType: 'string',
          enum: ['pdf-extraction', 'analysis', 'embedding-generation']
        },
        status: {
          bsonType: 'string',
          enum: ['queued', 'active', 'completed', 'failed', 'delayed']
        },
        screenplayId: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        progress: { bsonType: 'number' },
        data: { bsonType: 'object' },
        result: { bsonType: 'object' },
        error: { bsonType: 'string' },
        attempts: { bsonType: 'number' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'role': 1 });

db.screenplays.createIndex({ 'userId': 1 });
db.screenplays.createIndex({ 'status': 1 });
db.screenplays.createIndex({ 'createdAt': -1 });

db.analyses.createIndex({ 'screenplayId': 1 });
db.analyses.createIndex({ 'userId': 1 });
db.analyses.createIndex({ 'status': 1 });
db.analyses.createIndex({ 'createdAt': -1 });

db.configurations.createIndex({ 'userId': 1, 'type': 1 }, { unique: true });

db.jobs.createIndex({ 'status': 1 });
db.jobs.createIndex({ 'type': 1, 'status': 1 });
db.jobs.createIndex({ 'createdAt': -1 });

// Create default admin user
db.users.insertOne({
  email: 'admin@cortexreel.com',
  role: 'Admin',
  preferences: {
    darkMode: true,
    language: 'pl',
    notifications: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default configurations
const adminUser = db.users.findOne({ email: 'admin@cortexreel.com' });

if (adminUser) {
  // Default LLM configuration
  db.configurations.insertOne({
    userId: adminUser._id,
    type: 'llm',
    config: {
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
      topK: 40,
      presencePenalty: 0,
      frequencyPenalty: 0
    },
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Default prompts configuration
  db.configurations.insertOne({
    userId: adminUser._id,
    type: 'prompts',
    config: {
      sceneStructure: {
        id: 'sceneStructure',
        name: 'Scene Structure Analysis',
        prompt: 'Analyze the scene structure of this screenplay...',
        version: '1.0.0',
        description: 'Analyzes scenes, transitions, and pacing'
      },
      characters: {
        id: 'characters',
        name: 'Character Analysis',
        prompt: 'Analyze the characters in this screenplay...',
        version: '1.0.0',
        description: 'Character development, arcs, and relationships'
      },
      locations: {
        id: 'locations',
        name: 'Location Analysis',
        prompt: 'Analyze the locations in this screenplay...',
        version: '1.0.0',
        description: 'Location requirements and logistics'
      },
      themes: {
        id: 'themes',
        name: 'Theme Analysis',
        prompt: 'Analyze the themes in this screenplay...',
        version: '1.0.0',
        description: 'Thematic elements and narrative structure'
      },
      emotionalArcs: {
        id: 'emotionalArcs',
        name: 'Emotional Arc Analysis',
        prompt: 'Analyze the emotional arcs in this screenplay...',
        version: '1.0.0',
        description: 'Emotional journey and character development'
      },
      safety: {
        id: 'safety',
        name: 'Safety Analysis',
        prompt: 'Analyze safety requirements for this screenplay...',
        version: '1.0.0',
        description: 'Safety protocols and risk assessment'
      }
    },
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Default app configuration
  db.configurations.insertOne({
    userId: adminUser._id,
    type: 'app',
    config: {
      appName: 'CortexReel',
      maxFileSize: 52428800, // 50MB
      supportedFormats: ['pdf', 'txt'],
      logLevel: 'info',
      debugMode: false,
      features: {
        ocr: true,
        advancedCharts: true,
        export: true,
        collaboration: false
      }
    },
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

print('CortexReel database initialized successfully!'); 