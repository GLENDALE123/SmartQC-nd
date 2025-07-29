export class IncomingInspectionResponseDto {
  id: number;
  batchId: number;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  defects: Array<any>;
  attachments: Array<any>;
  createdAt: string;
  updatedAt: string;
}
