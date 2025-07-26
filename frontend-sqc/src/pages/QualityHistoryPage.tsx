"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function QualityHistoryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">검사이력 조회</h1>
      </div>

      {/* 데이터 테이블이 제거되었습니다 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 테이블</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">데이터 테이블 컴포넌트가 제거되었습니다.</p>
        </CardContent>
      </Card>
    </div>
  )
} 