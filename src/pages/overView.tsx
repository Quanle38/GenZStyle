import { Card, Col, Row } from 'antd';
import * as React from 'react';


export default function OverViewPage () {
  return (
    <>
     {/* Đây là nơi bạn sẽ đặt <Outlet /> sau này để hiển thị các trang con */}
            <div className="mb-10">
              <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-1">
                Overview
              </h2>
              <div className="h-1 w-12 bg-black"></div>
            </div>

            {/* Ví dụ Stat Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card className="rounded-none border-gray-200 border-b-4 border-b-black shadow-sm transition-all hover:-translate-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Revenue</p>
                  <h3 className="text-3xl font-bold">$128,430</h3>
                </Card>
              </Col>
            </Row>
    </>
  );
}
