// Netlify Functions - 서버리스 함수
// API 키를 안전하게 숨기고 프록시 역할 수행

exports.handler = async (event, context) => {
  // CORS 헤더
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 환경변수에서 API 키 가져오기 (Netlify 대시보드에서 설정)
    const DID_API_KEY = process.env.DID_API_KEY;
    const AGENT_ID = process.env.AGENT_ID || 'v2_agt_UcvqQ_-y';

    // 클라이언트에서 보낸 데이터
    const { studentName, question, answer, isCorrect } = JSON.parse(event.body);

    // Step 1: Knowledge Base 생성
    const timestamp = new Date().toLocaleString('ko-KR');
    
    const createKnowledgeResponse = await fetch('https://api.d-id.com/knowledge', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `퀴즈답변_${studentName}_${Date.now()}`,
        description: `${studentName}님의 스텝레더 운동 퀴즈 답변 기록`
      })
    });

    if (!createKnowledgeResponse.ok) {
      throw new Error('Knowledge Base 생성 실패');
    }

    const knowledge = await createKnowledgeResponse.json();
    const knowledgeId = knowledge.id;

    // Step 2: 답변 내용 작성
    const knowledgeContent = `
지식제목: 퀴즈 답변 기록 - ${studentName}
답변일시: ${timestamp}

답변자 정보:
- 이름: ${studentName}

퀴즈 정보:
- 문제: ${question}
- 선택한 답: ${answer}
- 정답 여부: ${isCorrect ? '정답 ✓' : '오답 ✗'}

학습 성과:
${isCorrect ? '- 이중과제의 개념을 정확히 이해했습니다.' : '- 이중과제의 개념을 복습하면 좋겠습니다.'}
${isCorrect ? '- 노인 운동 프로그램의 핵심 원리를 파악했습니다.' : '- 노인 운동 프로그램의 핵심 원리를 다시 학습하세요.'}
    `.trim();

    // Step 3: Knowledge에 문서 추가 (텍스트로)
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from(knowledgeContent), {
      filename: 'quiz_answer.txt',
      contentType: 'text/plain'
    });
    form.append('documentType', 'text');
    form.append('title', `${studentName}_답변`);

    const addDocumentResponse = await fetch(
      `https://api.d-id.com/knowledge/${knowledgeId}/documents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          ...form.getHeaders()
        },
        body: form
      }
    );

    if (!addDocumentResponse.ok) {
      throw new Error('문서 추가 실패');
    }

    // Step 4: Agent에 Knowledge 연결
    const updateAgentResponse = await fetch(
      `https://api.d-id.com/agents/${AGENT_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          knowledge: { id: knowledgeId }
        })
      }
    );

    if (!updateAgentResponse.ok) {
      throw new Error('Agent 업데이트 실패');
    }

    // 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '답변이 성공적으로 저장되었습니다!',
        knowledgeId: knowledgeId
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
