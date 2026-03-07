import React from 'react';

import { LoadingOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { Steps } from 'antd';
import getStatus from '../utils/getStatus';

export interface IHeaderProps {
  active: number
}

const HeaderStep: React.FC<IHeaderProps> = ({ active }) => {
  const steps = [
    {
      title: 'Verification',
      icon: <SolutionOutlined />,
    },
    {
      title: 'Pay',
      icon: <LoadingOutlined />,
    },
    {
      title: 'Done',
      icon: <SmileOutlined />,
    },
  ]
  return (
    <Steps current={active-1} items={steps.map((step, index) => ({
      ...step,
      status: getStatus(index, active)
    }))}
    />
  )
}

export default HeaderStep;