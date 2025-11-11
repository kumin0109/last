const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const DID_API_KEY = process.env.DID_API_KEY;
    const AGENT_ID = 'v2_agt_UcvqQ_-y';  // ← 퀴즈 Agent ID

    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY 환경변수가 설정되지 않았습니다');
    }

    const { studentName, question, answer, isCorrect } = JSON.parse(event.body);
    const timestamp = new Date().toLocaleString('ko-KR');
    
    // Step 1: Knowledge Base 생성
    const createKnowledgeResponse = await fetch('https://api.d-id.com/knowledge', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `퀴즈답변_${studentName}_${Date.now()}`,
        description: `${studentName}님의 스텝레더 운동 퀴즈 답변`
      })
    });

    if (!createKnowledgeResponse.ok) {
      const errorText = await createKnowledgeResponse.text();
      throw new Error(`Knowledge 생성 실패: ${errorText}`);
    }

    const knowledge = await createKnowledgeResponse.json();
    const knowledgeId = knowledge.id;

    // Step 2: 답변 내용 작성
    const knowledgeContent = `
지식제목: 퀴즈 답변 기록 - ${studentName}
답변일시: ${timestamp}

답변자: ${studentName}
문제: ${question}
선택한 답: ${answer}
정답 여부: ${isCorrect ? '정답 ✓' : '오답 ✗'}

해설:
이중과제 운동은 일상생활에서 걷기와 대화하기, 걷기와 물건 들기 등 
여러 과제를 동시에 처리해야 하는 상황에 대비하는 훈련입니다. 
스텝레더 운동에 청각 자극(호각 소리)을 추가하여 
주의력, 기억력, 반응속도를 함께 향상시킬 수 있습니다.
    `.trim();

    // Step 3: Pastebin 또는 GitHub Gist 사용 (임시 텍스트 호스팅)
    // 간단하게 data URI 사용
    const base64Content = Buffer.from(knowledgeContent, 'utf-8').toString('base64');
    const dataUri = `data:text/plain;base64,${base64Content}`;

    // Step 4: D-ID에 문서 추가 (data URI 방식)
    const addDocumentResponse = await fetch(
      `https://api.d-id.com/knowledge/${knowledgeId}/documents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentType: 'text',
          source_url: dataUri,
          title: `${studentName}_답변`
        })
      }
    );

    if (!addDocumentResponse.ok) {
      const errorText = await addDocumentResponse.text();
      throw new Error(`문서 추가 실패: ${errorText}`);
    }

    // Step 5: Agent에 Knowledge 연결
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
      const errorText = await updateAgentResponse.text();
      throw new Error(`Agent 업데이트 실패: ${errorText}`);
    }

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
