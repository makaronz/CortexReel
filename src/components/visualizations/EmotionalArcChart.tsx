import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Favorite as LoveIcon,
  SentimentVeryDissatisfied as SadnessIcon,
  Whatshot as AngerIcon,
  SentimentNeutral as NeutralIcon,
  EmojiEmotions as JoyIcon,
  PsychologyAlt as SurpriseIcon,
  ThumbDown as DisgustIcon,
  SentimentVeryDissatisfied as FearIcon,
} from '@mui/icons-material';
import { EmotionalArcData } from '@/types/analysis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';

interface EmotionalArcChartProps {
  emotionalArcs: EmotionalArcData;
}

const EmotionalArcChart: React.FC<EmotionalArcChartProps> = ({
  emotionalArcs,
}) => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState('overall');
  const [selectedEmotion, setSelectedEmotion] = useState('all');

  if (!emotionalArcs) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            {t('emotionalArcChart.title')}
          </Typography>
          <Typography color="text.secondary">
            {t('emotionalArcChart.waiting')}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const emotionData =
    emotionalArcs.overall?.map((point, index) => ({
      scene: index + 1,
      tension: point.tension || 0,
      intensity: point.intensity || 0,
      joy: point.joy || 0,
      sadness: point.sadness || 0,
      anger: point.anger || 0,
      fear: point.fear || 0,
      hope: point.hope || 0,
      surprise: 0,
      disgust: 0,
      love: 0,
      neutral: 0,
      averageEmotion:
        ((point.joy || 0) +
          (point.sadness || 0) +
          (point.anger || 0) +
          (point.fear || 0)) /
        4,
    })) || [];

  const emotionalPeaks = emotionData.map((point, index) => {
    const emotions = [
      { name: 'joy', value: point.joy, color: '#fbbf24' },
      { name: 'sadness', value: point.sadness, color: '#3b82f6' },
      { name: 'anger', value: point.anger, color: '#ef4444' },
      { name: 'fear', value: point.fear, color: '#8b5cf6' },
      { name: 'surprise', value: point.surprise, color: '#10b981' },
      { name: 'disgust', value: point.disgust, color: '#6b7280' },
      { name: 'love', value: point.love, color: '#ec4899' },
      { name: 'neutral', value: point.neutral, color: '#9ca3af' },
    ];

    const dominantEmotion = emotions.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );

    return {
      scene: index + 1,
      dominantEmotion: dominantEmotion.name,
      dominantValue: dominantEmotion.value,
      dominantColor: dominantEmotion.color,
      intensity: point.intensity || 0,
      tension: point.tension || 0,
    };
  });

  const emotionStats = {
    joy:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.joy, 0) /
          emotionData.length
        : 0,
    sadness:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.sadness, 0) /
          emotionData.length
        : 0,
    anger:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.anger, 0) /
          emotionData.length
        : 0,
    fear:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.fear, 0) /
          emotionData.length
        : 0,
    hope:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.hope, 0) /
          emotionData.length
        : 0,
    averageIntensity:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.intensity, 0) /
          emotionData.length
        : 0,
    averageTension:
      emotionData.length > 0
        ? emotionData.reduce((sum, point) => sum + point.tension, 0) /
          emotionData.length
        : 0,
  };

  const emotionRadarData = [
    {
      emotion: t('emotionalArcChart.emotions.joy'),
      value: emotionStats.joy,
      fullMark: 10,
    },
    {
      emotion: t('emotionalArcChart.emotions.sadness'),
      value: emotionStats.sadness,
      fullMark: 10,
    },
    {
      emotion: t('emotionalArcChart.emotions.anger'),
      value: emotionStats.anger,
      fullMark: 10,
    },
    {
      emotion: t('emotionalArcChart.emotions.fear'),
      value: emotionStats.fear,
      fullMark: 10,
    },
    {
      emotion: t('emotionalArcChart.emotions.hope'),
      value: emotionStats.hope,
      fullMark: 10,
    },
  ];

  const keyMoments =
    emotionalArcs.keyMoments ||
    emotionalPeaks
      .map((peak, index) => ({ ...peak, sceneIndex: index }))
      .filter((peak) => peak.intensity > 7 || peak.tension > 8)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 10);

  const emotionalDynamics = emotionData.map((point, index) => {
    if (index === 0) return { scene: point.scene, change: 0, momentum: 0 };
    const prevPoint = emotionData[index - 1];
    const emotionChange = Math.abs(
      (point.averageEmotion || 0) - (prevPoint.averageEmotion || 0)
    );
    const intensityChange =
      (point.intensity || 0) - (prevPoint.intensity || 0);
    return {
      scene: point.scene,
      change: emotionChange,
      momentum: intensityChange,
      direction:
        intensityChange > 0
          ? 'increase'
          : intensityChange < 0
          ? 'decrease'
          : 'stable',
    };
  });

  const getEmotionIcon = (emotion: string) => {
    const key =
      Object.keys(t('emotionalArcChart.emotions', { returnObjects: true })).find(
        (k) => t(`emotionalArcChart.emotions.${k}`) === emotion
      ) || emotion;
    switch (key) {
      case 'joy': return <JoyIcon sx={{ color: '#fbbf24' }} />;
      case 'sadness': return <SadnessIcon sx={{ color: '#3b82f6' }} />;
      case 'anger': return <AngerIcon sx={{ color: '#ef4444' }} />;
      case 'fear': return <FearIcon sx={{ color: '#8b5cf6' }} />;
      case 'surprise': return <SurpriseIcon sx={{ color: '#10b981' }} />;
      case 'disgust': return <DisgustIcon sx={{ color: '#6b7280' }} />;
      case 'love': return <LoveIcon sx={{ color: '#ec4899' }} />;
      case 'neutral': return <NeutralIcon sx={{ color: '#9ca3af' }} />;
      default: return <NeutralIcon />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const key =
      Object.keys(t('emotionalArcChart.emotions', { returnObjects: true })).find(
        (k) => t(`emotionalArcChart.emotions.${k}`) === emotion
      ) || emotion;
    switch (key) {
      case 'joy': return '#fbbf24';
      case 'sadness': return '#3b82f6';
      case 'anger': return '#ef4444';
      case 'fear': return '#8b5cf6';
      case 'surprise': return '#10b981';
      case 'disgust': return '#6b7280';
      case 'love': return '#ec4899';
      case 'neutral': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getIntensityLevel = (intensity: number) => {
    if (intensity >= 8)
      return { level: t('emotionalArcChart.intensityLevels.veryHigh'), color: 'error' };
    if (intensity >= 6)
      return { level: t('emotionalArcChart.intensityLevels.high'), color: 'warning' };
    if (intensity >= 4)
      return { level: t('emotionalArcChart.intensityLevels.moderate'), color: 'info' };
    if (intensity >= 2)
      return { level: t('emotionalArcChart.intensityLevels.low'), color: 'success' };
    return { level: t('emotionalArcChart.intensityLevels.veryLow'), color: 'default' };
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="primary.main"
                  fontWeight="bold"
                >
                  {emotionData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('emotionalArcChart.stats.points')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="warning.main"
                  fontWeight="bold"
                >
                  {emotionStats.averageIntensity.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('emotionalArcChart.stats.avgIntensity')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {emotionStats.averageTension.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('emotionalArcChart.stats.avgTension')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="success.main"
                  fontWeight="bold"
                >
                  {keyMoments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('emotionalArcChart.stats.keyMoments')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>{t('emotionalArcChart.filters.viewLabel')}</InputLabel>
          <Select
            value={selectedView}
            label={t('emotionalArcChart.filters.viewLabel')}
            onChange={(e) => setSelectedView(e.target.value)}
          >
            <MenuItem value="overall">{t('emotionalArcChart.filters.overall')}</MenuItem>
            <MenuItem value="emotions">{t('emotionalArcChart.filters.detailed')}</MenuItem>
            <MenuItem value="dynamics">{t('emotionalArcChart.filters.dynamics')}</MenuItem>
            <MenuItem value="moments">{t('emotionalArcChart.filters.keyMoments')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>{t('emotionalArcChart.filters.emotionLabel')}</InputLabel>
          <Select
            value={selectedEmotion}
            label={t('emotionalArcChart.filters.emotionLabel')}
            onChange={(e) => setSelectedEmotion(e.target.value)}
          >
            <MenuItem value="all">{t('emotionalArcChart.filters.allEmotions')}</MenuItem>
            {['joy', 'sadness', 'anger', 'fear', 'hope'].map((emotion) => (
              <MenuItem key={emotion} value={emotion}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getEmotionIcon(t(`emotionalArcChart.emotions.${emotion}`))}
                  <span>{t(`emotionalArcChart.emotions.${emotion}`)}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t(`emotionalArcChart.chartTitles.${selectedView}`)}
            </Typography>
            {selectedView === 'overall' && (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scene" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      t(`emotionalArcChart.tooltip.${name}`),
                    ]}
                  />
                  <Legend
                    formatter={(value) => t(`emotionalArcChart.legend.${value}`)}
                  />
                  <Area
                    type="monotone"
                    dataKey="tension"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="intensity"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="averageEmotion"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmotionalArcChart; 