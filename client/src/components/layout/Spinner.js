

import React, { Fragment } from 'react';
//import "antd/dist/antd.css";
import 'antd/dist/antd.min.css';
import { Spin } from 'antd';

export default () => (
  <Fragment>
    <Spin size="middle" style={{ }}spinning={true} alt="Loading..."></Spin>
  </Fragment>
);
