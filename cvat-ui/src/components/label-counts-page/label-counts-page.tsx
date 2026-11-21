// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Result from 'antd/lib/result';

import { getCore, SerializedLabelCounts } from 'cvat-core-wrapper';
import GoBackButton from 'components/common/go-back-button';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import LabelCountsChart from './label-counts-chart';

const core = getCore();

function LabelCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const taskId = +tid;
    const [labelCounts, setLabelCounts] = useState<SerializedLabelCounts | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    const fetchLabelCounts = useCallback(() => {
        setFetching(true);
        setError(null);
        core.labelCounts.get(taskId)
            .then(setLabelCounts)
            .catch((_error: unknown) => {
                setLabelCounts(null);
                setError(_error instanceof Error ? _error.message : String(_error));
            })
            .finally(() => setFetching(false));
    }, [taskId]);

    useEffect(fetchLabelCounts, [fetchLabelCounts]);

    const total = labelCounts?.labels.reduce((sum, label) => sum + label.count, 0) ?? 0;

    let content: JSX.Element | null = null;
    if (fetching) {
        content = <CVATLoadingSpinner />;
    } else if (error !== null) {
        content = (
            <Result
                className='cvat-label-counts-error'
                status='error'
                title='Could not load annotation counts'
                subTitle={error}
                extra={<Button type='primary' onClick={fetchLabelCounts}>Retry</Button>}
            />
        );
    } else if (labelCounts && total === 0) {
        content = (
            <Empty
                className='cvat-label-counts-empty'
                description='This task has no annotations yet'
            />
        );
    } else if (labelCounts) {
        content = (
            <>
                <Text type='secondary'>
                    {`${total} annotations across ${labelCounts.labels.length} labels`}
                </Text>
                <LabelCountsChart labels={labelCounts.labels} />
            </>
        );
    }

    return (
        <div className='cvat-label-counts-page'>
            <Row justify='center'>
                <Col span={22} xl={18} xxl={14} className='cvat-task-top-bar'>
                    <GoBackButton />
                </Col>
            </Row>
            <Row justify='center' className='cvat-label-counts-inner-wrapper'>
                <Col span={22} xl={18} xxl={14} className='cvat-label-counts-inner'>
                    <Title level={4}>{`Annotations per label, task #${taskId}`}</Title>
                    {content}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(LabelCountsPage);
