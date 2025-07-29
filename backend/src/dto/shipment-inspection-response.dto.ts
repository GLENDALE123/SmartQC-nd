export class ShipmentInspectionResponseDto {
  id: number;
  batchId: number;
  inspectionDate: string;
  totalQty: number;
  defectQty: number;
  notes?: string;
  finalPeeling?: string;
  externalCheck?: boolean;
  rounds: Array<any>;
  attachments: Array<any>;
  createdAt: string;
  updatedAt: string;
}
