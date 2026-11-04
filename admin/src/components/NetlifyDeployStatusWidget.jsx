import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Link, Loader, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

const stateLabels = {
  ready: 'Published',
  building: 'Building',
  enqueued: 'Queued',
  processing: 'Processing',
  error: 'Failed',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const stateDescriptions = {
  enqueued: 'Waiting for Netlify to start the build.',
  building: 'Installing dependencies and running the frontend build.',
  processing: 'The build is complete and Netlify is publishing it.',
  ready: 'The latest frontend build is live.',
  error: 'The latest frontend build failed.',
};

const Bar = ({ value = 0, color = '#4945ff', animated = false }) => (
  <div style={{ height: 10, width: '100%', overflow: 'hidden', borderRadius: 999, background: '#dcdce4' }}>
    <div
      style={{
        height: '100%',
        width: `${Math.max(0, Math.min(100, value))}%`,
        borderRadius: 999,
        background: color,
        transition: 'width 400ms ease',
        animation: animated ? 'netlify-deploy-pulse 1.4s ease-in-out infinite alternate' : undefined,
      }}
    />
  </div>
);

const NetlifyDeployStatusWidget = () => {
  const { get } = useFetchClient();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await get('/netlify-deploy-status/status');
      setStatus(data);
    } catch {
      setStatus({ error: 'Unable to load Netlify deploy status.' });
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const deploy = status?.deploy;
  const state = deploy?.state ? stateLabels[deploy.state] || deploy.state : null;
  const isBuilding = ['building', 'enqueued', 'processing'].includes(deploy?.state);
  useEffect(() => {
    if (!isBuilding) return undefined;
    const interval = window.setInterval(loadStatus, 15000);
    return () => window.clearInterval(interval);
  }, [isBuilding, loadStatus]);

  return (
    <Box padding={5} background="neutral0" shadow="tableShadow" hasRadius>
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="alpha">Netlify frontend</Typography>
          <Button variant="tertiary" size="S" onClick={loadStatus} loading={loading}>
            Refresh
          </Button>
        </Flex>
        {loading && !status ? <Loader small>Loading deploy status</Loader> : null}
        {!loading && status?.message ? <Typography textColor="neutral600">{status.message}</Typography> : null}
        {status?.error ? <Typography textColor="danger600">{status.error}</Typography> : null}
        {deploy ? (
          <Flex direction="column" alignItems="stretch" gap={2}>
            <Typography variant="beta" textColor={isBuilding ? 'warning600' : deploy.state === 'error' ? 'danger600' : 'success600'}>
              {isBuilding ? 'Build in progress' : `Latest deploy: ${state}`}
            </Typography>
            <Typography variant="pi" textColor="neutral600">{stateDescriptions[deploy.state] || 'Netlify has reported a new deploy state.'}</Typography>
            <Bar value={isBuilding ? 65 : deploy.state === 'error' ? 100 : 100} color={deploy.state === 'error' ? '#d02b20' : isBuilding ? '#f29d49' : '#328048'} animated={isBuilding} />
            <Typography variant="pi" textColor="neutral600">Branch/context: {deploy.branch || deploy.context || 'unknown'}</Typography>
            {deploy.commitMessage ? <Typography variant="pi">{deploy.commitMessage}</Typography> : null}
            <Typography variant="pi" textColor="neutral600">Commit: {deploy.commit ? deploy.commit.slice(0, 8) : 'unknown'}</Typography>
            <Typography variant="pi" textColor="neutral600">Started: {formatDate(deploy.createdAt)}</Typography>
            <Typography variant="pi" textColor="neutral600">
              {isBuilding ? 'Last updated' : 'Completed'}: {formatDate(isBuilding ? deploy.updatedAt : deploy.publishedAt || deploy.updatedAt)}
            </Typography>
            <Typography variant="pi" textColor="neutral600">Build time: {formatDuration(deploy.deployTimeSeconds)}</Typography>
            {deploy.errorMessage ? <Typography textColor="danger600">{deploy.errorMessage}</Typography> : null}
            <Flex gap={3} wrap="wrap">
              {deploy.deployUrl ? <Link href={deploy.deployUrl} isExternal>Open public preview</Link> : null}
              {deploy.commitUrl ? <Link href={deploy.commitUrl} isExternal>Open commit</Link> : null}
            </Flex>
          </Flex>
        ) : null}
        {status?.siteUrl ? <Link href={status.siteUrl} isExternal>Open frontend</Link> : null}
      </Flex>
    </Box>
  );
};

export default NetlifyDeployStatusWidget;
