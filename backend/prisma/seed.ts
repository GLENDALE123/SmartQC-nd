import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('시드 데이터 생성을 시작합니다...');

  // 테스트 계정들 생성
  const testUsers = [
    {
      username: 'admin',
      password: 'admin123!',
      name: '관리자',
      role: 'admin' as const,
      inspectionType: 'all',
      processLine: null,
      rank: '부장',
      position: '시스템관리자',
    },
    {
      username: 'inspector1',
      password: 'inspector123!',
      name: '검사원1',
      role: 'inspector' as const,
      inspectionType: 'incoming',
      processLine: 'LINE-A',
      rank: '대리',
      position: '품질검사원',
    },
    {
      username: 'manager1',
      password: 'manager123!',
      name: '관리자1',
      role: 'manager' as const,
      inspectionType: 'all',
      processLine: null,
      rank: '과장',
      position: '품질관리팀장',
    },
    {
      username: 'operator1',
      password: 'operator123!',
      name: '작업자1',
      role: 'operator' as const,
      inspectionType: 'process',
      processLine: 'LINE-B',
      rank: '사원',
      position: '생산작업자',
    },
  ];

  for (const userData of testUsers) {
    // 기존 사용자가 있는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      console.log(`사용자 '${userData.username}'는 이미 존재합니다. 건너뜁니다.`);
      continue;
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        inspectionType: userData.inspectionType,
        processLine: userData.processLine,
        rank: userData.rank,
        position: userData.position,
        authType: 'local',
        isActive: true,
      },
    });

    console.log(`✅ 사용자 생성됨: ${user.username} (${user.name}) - 역할: ${user.role}`);
    console.log(`   초기 비밀번호: ${userData.password}`);
  }

  console.log('\n🎉 시드 데이터 생성이 완료되었습니다!');
  console.log('\n📋 생성된 테스트 계정 목록:');
  console.log('┌─────────────┬──────────────┬─────────┬──────────────┐');
  console.log('│ 사용자명    │ 초기비밀번호 │ 역할    │ 검사유형     │');
  console.log('├─────────────┼──────────────┼─────────┼──────────────┤');
  testUsers.forEach(user => {
    console.log(`│ ${user.username.padEnd(11)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(7)} │ ${(user.inspectionType || '').padEnd(12)} │`);
  });
  console.log('└─────────────┴──────────────┴─────────┴──────────────┘');
  console.log('\n⚠️  보안을 위해 사용자들에게 첫 로그인 후 비밀번호 변경을 안내하세요.');
}

main()
  .catch((e) => {
    console.error('시드 실행 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });