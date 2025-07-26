import { PrismaClient } from '@prisma/client';
import { join, sep } from 'path';

const prisma = new PrismaClient();

async function main() {
  const attachments = await prisma.attachment.findMany();
  for (const att of attachments) {
    // url에서 inspectionId까지만 남기기
    // 예: C:\Users\ghfud\Desktop\SmartQC.ver1\images\inspections\11\original\파일명.jpg
    // => C:\Users\ghfud\Desktop\SmartQC.ver1\images\inspections\11
    let url = att.url;
    let fileName = att.fileName;
    // url이 파일까지 포함하는 경우만 처리
    if (url.match(/original|thumbnail|modal/)) {
      // 폴더 구분자 통일
      const parts = url.split(/\\|\//);
      // inspectionId 위치 찾기
      const idx = parts.findIndex(p => p === 'inspections');
      if (idx !== -1 && parts.length > idx + 1) {
        const inspectionId = parts[idx + 1];
        // inspectionId까지만 경로 재조합
        url = parts.slice(0, idx + 2).join(sep);
      }
      // 파일명 추출 (original/thumbnail/modal 폴더 다음)
      if (!fileName || fileName === '') {
        fileName = att.url.split(sep).pop()?.replace(/(-thumb|-modal)?\.jpg$/, '') || '';
      }
    }
    // DB 업데이트
    await prisma.attachment.update({
      where: { id: att.id },
      data: { url, fileName },
    });
    console.log(`Updated id=${att.id}: url=${url}, fileName=${fileName}`);
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 