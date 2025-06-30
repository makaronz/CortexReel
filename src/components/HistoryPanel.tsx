import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
  Chip,
  Stack
} from '@mui/material';
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useAnalysisHistory, useAnalysisStore } from '@/store/analysisStore';

const HistoryPanel: React.FC = () => {
  const history = useAnalysisHistory();
  const { loadFromHistory, removeFromHistory, clearHistory } = useAnalysisStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const formatProcessingTime = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <HistoryIcon />
            <Typography variant="h6">Analysis History</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No analyses yet. Upload a screenplay to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HistoryIcon />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Analysis History
          </Typography>
          <Chip 
            label={history.length}
            color="primary"
            size="small"
          />
          <IconButton 
            size="small" 
            onClick={clearHistory}
            title="Clear all history"
          >
            <ClearIcon />
          </IconButton>
        </Stack>

        <List dense>
          {history.map((entry) => (
            <ListItem
              key={entry.id}
              divider
              sx={{
                border: 1,
                borderColor: 'grey.200',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {entry.filename}
                  </Typography>
                }
                secondary={
                  <Box component="div">
                    <Typography variant="caption" component="div">
                      {formatDate(entry.timestamp)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip 
                        label={entry.analysisType}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={formatFileSize(entry.fileSize)}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                      <Chip 
                        label={formatProcessingTime(entry.processingTime)}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    </Stack>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => loadFromHistory(entry.id)}
                    title="View analysis"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeFromHistory(entry.id)}
                    title="Delete from history"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {history.length > 3 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={clearHistory}
              color="error"
            >
              Clear All History
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel; 