"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { orderApi, OrderInfoResponseDto } from "@/api/orders"

interface OrderInfo {
  orderNumber: string
  client: string
  productName: string
  partName: string
  specification: string
  manager: string
}

interface BasicInfoFormProps {
  onBasicInfoChange: (data: {
    orderNumbers: string[]
    orderInfos: OrderInfo[]
  }) => void
}

export function BasicInfoForm({ onBasicInfoChange }: BasicInfoFormProps) {
  const [displayValue, setDisplayValue] = useState("")
  const [orderNumbers, setOrderNumbers] = useState<string[]>([])
  const [orderInfos, setOrderInfos] = useState<OrderInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 발주번호 형식 변환 함수
  const formatOrderNumber = (input: string): string[] => {
    const numbers = input.replace(/\D/g, '') // 숫자만 추출
    const formattedNumbers: string[] = []
    
    for (let i = 0; i < numbers.length; i += 6) {
      const sixDigits = numbers.slice(i, i + 6)
      if (sixDigits.length === 6) {
        const firstFive = sixDigits.slice(0, 5)
        const lastOne = sixDigits.slice(5, 6)
        formattedNumbers.push(`T${firstFive}-${lastOne}`)
      }
    }
    
    return formattedNumbers
  }

  // 실시간 형식 변환 함수
  const formatMultipleOrderNumbers = (input: string): string => {
    const numbers = input.replace(/\D/g, '')
    const orderNumbers: string[] = []
    
    for (let i = 0; i < numbers.length; i += 6) {
      const chunk = numbers.slice(i, i + 6)
      
      if (chunk.length <= 5) {
        orderNumbers.push(`T${chunk}`)
      } else if (chunk.length === 6) {
        const prefix = chunk.slice(0, 5)
        const suffix = chunk.slice(5)
        orderNumbers.push(`T${prefix}-${suffix}`)
      }
    }
    
    return orderNumbers.join(', ')
  }

  // 발주번호 입력 처리
  const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 추출
    setDisplayValue(formatMultipleOrderNumbers(value))
    
    // 형식 변환된 발주번호들을 배열로 저장
    const formattedArray = formatOrderNumber(value)
    setOrderNumbers(formattedArray)
  }

  // 숫자만 입력 허용
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.which ? e.which : e.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault()
    }
    }

  // 발주 정보 가져오기 (실제 API 호출)
  const fetchOrderInfo = async (orderNumber: string): Promise<OrderInfo> => {
    try {
      const response = await orderApi.getByOrderNumber(orderNumber);
      
      if (response.success && response.data) {
        const orderData: OrderInfoResponseDto = response.data;
        
        return {
          orderNumber: orderData.finalorderNumber || orderNumber,
          client: orderData.customer || "정보 없음", // customer 필드 사용
          productName: orderData.productName || "정보 없음", 
          partName: orderData.partName || "정보 없음",
          specification: orderData.specification || "정보 없음",
          manager: orderData.manager || "정보 없음"
        };
      } else {
        // API에서 데이터를 찾지 못한 경우
        return {
          orderNumber,
          client: "정보 없음",
          productName: "정보 없음",
          partName: "정보 없음", 
          specification: "정보 없음",
          manager: "정보 없음"
        };
      }
    } catch (error) {
      console.error(`발주번호 ${orderNumber} 정보 가져오기 실패:`, error);
      
      // 에러 발생 시 기본값 반환
      return {
        orderNumber,
        client: "정보 없음",
        productName: "정보 없음",
        partName: "정보 없음",
        specification: "정보 없음", 
        manager: "정보 없음"
      };
    }
  }

  // 모든 발주 정보 가져오기
  const fetchAllOrderInfos = useCallback(async () => {
    if (orderNumbers.length === 0) {
      setOrderInfos([])
      return
    }

    setIsLoading(true)
    try {
      const infos = await Promise.all(
        orderNumbers.map(orderNumber => fetchOrderInfo(orderNumber))
      )
      setOrderInfos(infos)
    } catch (error) {
      console.error("발주 정보 가져오기 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [orderNumbers])

  // 발주번호가 변경될 때마다 정보 가져오기
  useEffect(() => {
    fetchAllOrderInfos()
  }, [orderNumbers])

  // 부모 컴포넌트에 데이터 전달 - onBasicInfoChange를 의존성에서 제거
  useEffect(() => {
    onBasicInfoChange({
      orderNumbers,
      orderInfos
    })
  }, [orderNumbers, orderInfos])

  // 중복 제거된 값들 계산
  const getUniqueValues = (field: keyof OrderInfo) => {
    const values = orderInfos.map(info => info[field])
    return [...new Set(values)]
  }

  const uniqueClients = getUniqueValues('client')
  const uniqueProductNames = getUniqueValues('productName')
  const uniquePartNames = getUniqueValues('partName')
  const uniqueSpecifications = getUniqueValues('specification')
  const uniqueManagers = getUniqueValues('manager')

  return (
              <Card className="border-transparent shadow-none max-w-4xl mx-auto">
       <CardContent className="space-y-6 p-0 px-1">
        {/* 발주번호 입력 */}
        <div className="space-y-3" style={{ marginTop: '10px' }}>
          <Label htmlFor="order-numbers">발주번호 *</Label>
          <div className="space-y-2">
                         <Input
               id="order-numbers"
               placeholder="T00000-0 (6자리씩 자동 변환)"
               value={displayValue}
               onChange={handleOrderNumberChange}
               onKeyPress={handleKeyPress}
               maxLength={60} // 최대 10개 발주번호 (6자리 × 10)
             />
             <p className="text-xs text-muted-foreground">
               숫자만 입력하면 T00000-0 형식으로 자동 변환됩니다
             </p>
          </div>
          
          
        </div>

        {/* 자동 입력된 정보들 */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
                 ) : orderInfos.length > 0 ? (
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               {/* 발주처 */}
               <div className="space-y-2">
                 <Label>발주처</Label>
                 <div className="flex flex-wrap gap-2">
                   {uniqueClients.map((client, index) => (
                     <Badge key={index} variant="outline">
                       {client}
                     </Badge>
                   ))}
                 </div>
               </div>

               {/* 제품명 */}
               <div className="space-y-2">
                 <Label>제품명</Label>
                 <div className="flex flex-wrap gap-2">
                   {uniqueProductNames.map((productName, index) => (
                     <Badge key={index} variant="outline">
                       {productName}
                     </Badge>
                   ))}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               {/* 부속명 */}
               <div className="space-y-2">
                 <Label>부속명</Label>
                 <div className="flex flex-wrap gap-2">
                   {uniquePartNames.map((partName, index) => (
                     <Badge key={index} variant="outline">
                       {partName}
                     </Badge>
                   ))}
                 </div>
               </div>

               {/* 사양 */}
               <div className="space-y-2">
                 <Label>사양</Label>
                 <div className="flex flex-wrap gap-2">
                   {uniqueSpecifications.map((spec, index) => (
                     <Badge key={index} variant="outline">
                       {spec}
                     </Badge>
                   ))}
                 </div>
               </div>
             </div>

             {/* 담당자 */}
             <div className="space-y-2">
               <Label>담당자</Label>
               <div className="flex flex-wrap gap-2">
                 {uniqueManagers.map((manager, index) => (
                   <Badge key={index} variant="outline">
                     {manager}
                   </Badge>
                 ))}
               </div>
             </div>
           </div>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="text-center py-8 text-muted-foreground">
              발주번호를 입력하면 자동으로 정보가 표시됩니다
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}