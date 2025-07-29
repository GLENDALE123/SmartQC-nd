export class ProcessInspectionResponseDto {
  id: number;
  batchId: number;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  paintPrimer?: string;
  paintTopcoat?: string;
  rounds: Array<any>;
  defects: Array<any>;
  attachments: Array<any>;
  createdAt: string;
  updatedAt: string;
}
