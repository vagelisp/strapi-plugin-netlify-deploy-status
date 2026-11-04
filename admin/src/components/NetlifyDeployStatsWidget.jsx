import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const Bar = ({ value = 0, color = '#4945ff' }) => (
  <div style={{ height: 10, width: '100%', overflow: 'hidden', borderRadius: 999, background: '#dcdce4' }}>
    <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, borderRadius: 999, background: color, transition: 'width 400ms ease' }} />
  </div>
);

const NetlifyDeployStatsWidget = () => {
  const { get } = useFetchClient();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('/netlify-deploy-status/status');
      setStatus(data);
    } catch {
      setStatus({ error: 'Unable to load build statistics.' });
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const stats = status?.stats;
  const recentDeploys = status?.recentDeploys || [];
  const maxRecentBuildTime = Math.max(...recentDeploys.map((deploy) => deploy.deployTimeSeconds || 0), stats?.averageBuildTimeSeconds || 1);
  const isBuilding = ['building', 'enqueued', 'processing'].includes(status?.deploy?.state);

  useEffect(() => {
    if (!isBuilding) return undefined;
    const interval = window.setInterval(loadStatus, 15000);
    return () => window.clearInterval(interval);
  }, [isBuilding, loadStatus]);

  return (
    <Box padding={5} background="neutral0" shadow="tableShadow" hasRadius>
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="alpha">Build stats</Typography>
          <Button variant="tertiary" size="S" onClick={loadStatus} loading={loading}>Refresh</Button>
        </Flex>
        {status?.error ? <Typography textColor="danger600">{status.error}</Typography> : null}
        {stats ? (
          <Flex direction="column" alignItems="stretch" gap={2}>
            <Flex gap={2} wrap="wrap">
              <Box padding={3} background="neutral100" hasRadius style={{ flex: 1, minWidth: 120 }}>
                <Typography variant="alpha">{stats.successRate ?? '—'}%</Typography>
                <Typography variant="pi" textColor="neutral600">Success rate</Typography>
              </Box>
              <Box padding={3} background="neutral100" hasRadius style={{ flex: 1, minWidth: 120 }}>
                <Typography variant="alpha">{formatDuration(stats.averageBuildTimeSeconds)}</Typography>
                <Typography variant="pi" textColor="neutral600">Average build</Typography>
              </Box>
              <Box padding={3} background="neutral100" hasRadius style={{ flex: 1, minWidth: 120 }}>
                <Typography variant="alpha">{stats.active}</Typography>
                <Typography variant="pi" textColor="neutral600">Active now</Typography>
              </Box>
            </Flex>
            <Typography variant="pi" textColor="neutral600">Recent success</Typography>
            <Bar value={stats.successRate || 0} color="#328048" />
            <Typography variant="pi" textColor="neutral600">Recent build durations</Typography>
            <Flex direction="column" alignItems="stretch" gap={1}>
              {recentDeploys.slice(0, 5).map((deploy) => (
                <Flex key={deploy.id} gap={2} alignItems="center">
                  <Typography variant="pi" style={{ width: 80 }}>{deploy.commit ? deploy.commit.slice(0, 7) : 'build'}</Typography>
                  <Bar value={((deploy.deployTimeSeconds || 0) / maxRecentBuildTime) * 100} color={deploy.state === 'error' ? '#d02b20' : '#4945ff'} />
                  <Typography variant="pi" textColor="neutral600" style={{ width: 48 }}>{formatDuration(deploy.deployTimeSeconds)}</Typography>
                </Flex>
              ))}
            </Flex>
          </Flex>
        ) : !loading ? <Typography textColor="neutral600">No build history available.</Typography> : null}
      </Flex>
    </Box>
  );
};

export default NetlifyDeployStatsWidget;
