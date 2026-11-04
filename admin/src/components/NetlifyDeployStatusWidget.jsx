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

  return (
    <Box padding={4} background="neutral0" shadow="tableShadow" hasRadius>
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="delta">Netlify frontend</Typography>
          <Button variant="tertiary" size="S" onClick={loadStatus} loading={loading}>
            Refresh
          </Button>
        </Flex>
        {loading && !status ? <Loader small>Loading deploy status</Loader> : null}
        {!loading && status?.message ? <Typography textColor="neutral600">{status.message}</Typography> : null}
        {status?.error ? <Typography textColor="danger600">{status.error}</Typography> : null}
        {deploy ? (
          <Flex direction="column" alignItems="stretch" gap={1}>
            <Typography variant="omega">Latest deploy: {state}</Typography>
            <Typography variant="pi" textColor="neutral600">
              Branch: {deploy.branch || deploy.context || 'unknown'}
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Commit: {deploy.commit ? deploy.commit.slice(0, 8) : 'unknown'}
            </Typography>
            {deploy.errorMessage ? <Typography textColor="danger600">{deploy.errorMessage}</Typography> : null}
            {deploy.deployUrl ? <Link href={deploy.deployUrl} isExternal>Open deploy</Link> : null}
          </Flex>
        ) : null}
        {status?.siteUrl ? <Link href={status.siteUrl} isExternal>Open frontend</Link> : null}
      </Flex>
    </Box>
  );
};

export default NetlifyDeployStatusWidget;
