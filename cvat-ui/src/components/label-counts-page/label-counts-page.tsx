// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import notification from 'antd/lib/notification';

import { getCore, SerializedLabelCounts } from 'cvat-core-wrapper';
import GoBackButton from 'components/common/go-back-button';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import LabelCountsChart from './label-counts-chart';

const core = getCore();

function LabelCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const taskId = +tid;
    const [labelCounts, setLabelCounts] = useState<SerializedLabelCounts | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        setFetching(true);
        core.labelCounts.get(taskId)
            .then(setLabelCounts)
            .catch((error: unknown) => {
                notification.error({
                    message: 'Could not receive annotation counts',
                    description: error instanceof Error ? error.message : '',
                });
            })
            .finally(() => setFetching(false));
    }, [taskId]);

    const total = labelCounts?.labels.reduce((sum, label) => sum + label.count, 0) ?? 0;

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
                    {fetching && <CVATLoadingSpinner />}
                    {labelCounts && (
                        <>
                            <Text type='secondary'>
                                {`${total} annotations across ${labelCounts.labels.length} labels`}
                            </Text>
                            <LabelCountsChart labels={labelCounts.labels} />
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(LabelCountsPage);
