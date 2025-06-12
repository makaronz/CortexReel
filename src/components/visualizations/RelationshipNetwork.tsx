import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import { Paper, Typography, LinearProgress } from '@mui/material';
import { CharacterDetail, CharacterRelationship } from '@/types/analysis';

import 'reactflow/dist/style.css';

interface RelationshipNetworkProps {
  characters: CharacterDetail[];
  relationships: CharacterRelationship[];
}

const getEdgeStyle = (intensity: CharacterRelationship['emotionalIntensity'], strength: number) => {
  const baseStyle = {
    strokeWidth: Math.max(1, strength / 2),
  };
  switch (intensity) {
    case 'VOLATILE':
      return { ...baseStyle, stroke: '#f44336', animation: 'dashdraw 0.5s linear infinite' };
    case 'HIGH':
      return { ...baseStyle, stroke: '#ff9800' };
    case 'MEDIUM':
      return { ...baseStyle, stroke: '#2196f3' };
    case 'LOW':
    default:
      return { ...baseStyle, stroke: '#4caf50' };
  }
};

const RelationshipNetwork: React.FC<RelationshipNetworkProps> = ({ characters, relationships }) => {
  if (!characters || !relationships) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Character Relationships</Typography>
        <Typography>Waiting for relationship data...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const characterMap = new Map<string, CharacterDetail>();

    if (characters && characters.length > 0) {
      const radius = 250;
      const angleStep = (2 * Math.PI) / characters.length;
      
      characters.forEach((char, i) => {
        characterMap.set(char.name, char);
        nodes.push({
          id: char.name,
          data: { label: char.name },
          position: {
            x: Math.cos(i * angleStep) * radius + 300,
            y: Math.sin(i * angleStep) * radius + 150,
          },
        });
      });
    }

    if (relationships) {
      relationships.forEach(rel => {
        if (characterMap.has(rel.character1) && characterMap.has(rel.character2)) {
          edges.push({
            id: rel.id,
            source: rel.character1,
            target: rel.character2,
            label: rel.type,
            style: getEdgeStyle(rel.emotionalIntensity, rel.strength),
            animated: rel.emotionalIntensity === 'VOLATILE',
          });
        }
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [characters, relationships]);

  return (
    <Paper elevation={3} sx={{ height: 500, p: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Character Relationship Network
      </Typography>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <style>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </Paper>
  );
};

export default RelationshipNetwork; 